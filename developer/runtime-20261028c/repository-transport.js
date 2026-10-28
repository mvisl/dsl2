/** Private repository transport. Tokens stay in the caller's live session.
 * No Sites, raw/CDN redirects, browser token storage or implicit merge authority.
 */
const API='https://api.github.com';
const SHA=/^[a-f0-9]{40}$/;
function segment(value,label){if(typeof value!=='string'||!value||!/^[-\w.]+$/.test(value)||value==='.'||value==='..')throw Error('Invalid '+label);return encodeURIComponent(value)}
function filePath(path){if(typeof path!=='string'||!path||path.startsWith('/')||/[\\%?#\x00-\x1f]/.test(path)||path.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Invalid repository path');return path.split('/').map(p=>encodeURIComponent(p)).join('/')}
function decode(value){if(typeof value!=='string'||!/^[A-Za-z0-9+/=\s]*$/.test(value))throw Error('Invalid repository file encoding');try{return Uint8Array.from(atob(value.replace(/\s/g,'')),c=>c.charCodeAt(0))}catch{throw Error('Invalid repository file encoding')}}
function encode(bytes){let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value)}
export function createRepositoryTransport({owner,repo,commit,dataBranch,getToken,fetcher=globalThis.fetch}={}){
 const prefix='/repos/'+segment(owner,'owner')+'/'+segment(repo,'repository');
 if(!SHA.test(commit))throw Error('Pinned source commit required');
 if(typeof getToken!=='function'||typeof fetcher!=='function')throw Error('Live GitHub session required');
 if(typeof dataBranch!=='string'||!/^[-\w/.]+$/.test(dataBranch)||dataBranch.includes('..')||dataBranch.startsWith('/'))throw Error('Explicit data branch required');
 async function request(path,{method='GET',body,signal}={}){
  if(!path.startsWith(prefix+'/'))throw Error('Foreign repository request refused');
  const token=await getToken();if(typeof token!=='string'||!token)throw Error('GitHub sign-in required');
  let response;try{response=await fetcher(API+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,redirect:'error',cache:'no-store',signal});}catch(e){if(e?.name==='AbortError')throw e;throw Error('GitHub connection failed; working copy unchanged')}
  if(!response.ok){const e=Error(response.status===409||response.status===422?'Repository changed; reload and review before saving':response.status===401?'GitHub session expired':response.status===403?'GitHub access unavailable':response.status===404?'Private repository file unavailable':'GitHub request failed');e.status=response.status;throw e}
  return response.json();
 }
 async function read(path,{ref=commit,signal,dataCommit=false}={}){
  const encoded=filePath(path);if(ref!==commit&&ref!==dataBranch&&!(dataCommit&&SHA.test(ref)))throw Error('Unconfigured repository revision');
  let data=await request(prefix+'/contents/'+encoded+'?ref='+encodeURIComponent(ref),{signal});
  if(Array.isArray(data)||data?.type!=='file'||!SHA.test(data.sha))throw Error('Exact repository file required');
  const sha=data.sha;
  if(data.encoding!=='base64'){
   // Contents omits bodies over1MB. Resolve only the exact API blob, never download_url.
   data=await request(prefix+'/git/blobs/'+sha,{signal});
   if(data.sha!==sha||data.encoding!=='base64')throw Error('Repository blob identity mismatch');
  }
  const bytes=decode(data.content);if(Number.isSafeInteger(data.size)&&data.size!==bytes.byteLength)throw Error('Repository file length mismatch');
  return {path,sha,bytes,ref};
 }
 return{
  readSource:(path,options)=>read(path,{...options,ref:commit}),
  readRecord:(path,options)=>{if(!path.startsWith('design-workspace/records/'))throw Error('Record namespace required');return read(path,{...options,ref:dataBranch})},
  readRecordAtCommit:(path,dataCommit,options)=>{
   if(!path.startsWith('design-workspace/records/')||!SHA.test(dataCommit))throw Error('Exact record snapshot required');
   return read(path,{...options,ref:dataCommit,dataCommit:true});
  },
  async readDataHead({signal}={}){
   const result=await request(prefix+'/git/ref/heads/'+encodeURIComponent(dataBranch),{signal});
   if(result?.object?.type!=='commit'||!SHA.test(result.object.sha))throw Error('Exact data branch commit required');
   return result.object.sha;
  },
  async writeRecords(files,{expectedCommit,message='Update design workspace records',signal}={}){
   if(!SHA.test(expectedCommit))throw Error('Explicit data commit required');
   if(!Array.isArray(files)||!files.length||files.length>100)throw Error('Bounded record transaction required');
   const seen=new Set();let total=0;
   const entries=files.map(file=>{
    const path=file?.path;filePath(path);
    if(!path.startsWith('design-workspace/records/')||!path.endsWith('.json')||seen.has(path))throw Error('Unique JSON record paths required');
    seen.add(path);
    if(!file.value||typeof file.value!=='object'||Array.isArray(file.value))throw Error('Validated record object required');
    const bytes=new TextEncoder().encode(JSON.stringify(file.value));total+=bytes.length;
    if(bytes.length>2000000||total>10000000)throw Error('Record transaction is too large');
    return{path,bytes};
   });
   const ref='/git/ref/heads/'+encodeURIComponent(dataBranch),head=await request(prefix+ref,{signal});
   if(head?.object?.type!=='commit'||head.object.sha!==expectedCommit){const error=Error('Repository changed; reload and review before saving');error.status=409;throw error}
   const base=await request(prefix+'/git/commits/'+expectedCommit,{signal});
   if(base?.sha!==expectedCommit||!SHA.test(base.tree?.sha))throw Error('Exact data tree required');
   const tree=[];
   // Domain validators must check the complete transaction before this transport call.
   for(const entry of entries){
    const blob=await request(prefix+'/git/blobs',{method:'POST',signal,body:{encoding:'base64',content:encode(entry.bytes)}});
    if(!SHA.test(blob?.sha))throw Error('Record blob receipt missing');
    tree.push({path:entry.path,mode:'100644',type:'blob',sha:blob.sha});
   }
   const built=await request(prefix+'/git/trees',{method:'POST',signal,body:{base_tree:base.tree.sha,tree}});
   if(!SHA.test(built?.sha))throw Error('Record tree receipt missing');
   const commitResult=await request(prefix+'/git/commits',{method:'POST',signal,body:{message,tree:built.sha,parents:[expectedCommit]}});
   if(!SHA.test(commitResult?.sha))throw Error('Record commit receipt missing');
   // An intervening writer makes this non-fast-forward and GitHub rejects it.
   // Never force, retry or merge conflicting owner changes automatically.
   const updated=await request(prefix+'/git/refs/heads/'+encodeURIComponent(dataBranch),{method:'PATCH',signal,body:{sha:commitResult.sha,force:false}});
   if(updated?.object?.sha!==commitResult.sha)throw Error('GitHub save receipt missing; confirm remote before retry');
   return{commit:commitResult.sha,previousCommit:expectedCommit,files:tree.map(({path,sha})=>({path,sha}))};
  },
  async writeRecord(path,value,{expectedSha,message='Update design workspace record',signal}={}){
   if(!path.startsWith('design-workspace/records/')||!path.endsWith('.json'))throw Error('JSON record namespace required');
   const encoded=filePath(path);
   if(expectedSha!==null&&!SHA.test(expectedSha))throw Error('Explicit record revision required');
   if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Validated record object required');
   const bytes=new TextEncoder().encode(JSON.stringify(value));if(bytes.length>500000)throw Error('Record is too large');
   // Domain validation is still required by the screen/inbox layer before this call.
   const result=await request(prefix+'/contents/'+encoded,{method:'PUT',signal,body:{message,branch:dataBranch,content:encode(bytes),...(expectedSha?{sha:expectedSha}:{})}});
   if(!SHA.test(result?.content?.sha)||!SHA.test(result?.commit?.sha))throw Error('GitHub save receipt missing; confirm remote before retry');
   return {path,sha:result.content.sha,commit:result.commit.sha};
  }
 };
}
