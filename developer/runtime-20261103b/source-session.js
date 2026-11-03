/** Pinned source/verified artifact bytes in session memory; bounded network concurrency. */
const refusal=()=>Object.assign(Error('GitHub sign-in required'),{status:401});
export function createSourceSession({transport,getToken,verifiedFiles=new Map(),selectedMembers=null,reviewMembers=null,limit=6,maxCacheBytes=256000000}={}){
 if(typeof transport?.readSource!=='function'||typeof getToken!=='function'||!(verifiedFiles instanceof Map)||!Number.isInteger(limit)||limit<1||limit>12||!Number.isSafeInteger(maxCacheBytes)||maxCacheBytes<1)throw Error('Bounded authenticated source session required');
 const valid=path=>typeof path==='string'&&path.startsWith('review-workspace/')&&!/[\\%?#\x00-\x1f]/.test(path)&&!path.split('/').some(x=>!x||x==='.'||x==='..');
 const cache=new Map(),pending=new Map(),queue=[],controller=new AbortController();let closed=false,active=0,bytes=0;
 for(const[path,data]of verifiedFiles){const full='review-workspace/'+path;if(!valid(full)||full.startsWith('review-workspace/calibration-protected/')||!(data instanceof Uint8Array))throw Error('Invalid verified source member');bytes+=data.length;if(bytes>maxCacheBytes)throw Error('Verified source packet exceeds session bounds');cache.set(full,{path:full,bytes:data})}
 const selected=selectedMembers===null?null:new Map(Object.entries(selectedMembers).map(([path,pin])=>['review-workspace/'+path,pin]));
 if(selected&&(!selected.size||selected.size>16000||[...selected].some(([p,s])=>!valid(p)||p.startsWith('review-workspace/calibration-protected/')||!Number.isSafeInteger(s?.bytes)||s.bytes<0||!/^[a-f0-9]{64}$/.test(s?.sha256||'')||cache.has(p))))throw Error('Exact disjoint selected member closure required');
 const reviews=reviewMembers===null?null:new Map(Object.entries(reviewMembers).map(([p,s])=>['review-workspace/'+p,s]));
 if(reviews&&(!reviews.size||reviews.size>2000||[...reviews].some(([p,s])=>!valid(p)||p.startsWith('review-workspace/calibration-protected/')||!Number.isSafeInteger(s?.bytes)||s.bytes<0||!/^[a-f0-9]{64}$/.test(s?.sha256||'')||cache.has(p)||selected?.has(p))))throw Error('Exact disjoint review member closure required');
 let reviewAdmitted=false;
 let selectedAdmitted=false;
 function close(){if(closed)return;closed=true;controller.abort();cache.clear();pending.clear();bytes=0;for(const item of queue.splice(0))item.reject(refusal())}
 function live(){if(closed)throw refusal();if(!getToken()){close();throw refusal()}}
 function pump(){while(!closed&&active<limit&&queue.length){const item=queue.shift();active++;(async()=>{try{live();const file=cache.get(item.path)??await transport.readSource(item.path,{signal:controller.signal});live();if(!(file.bytes instanceof Uint8Array))throw Error('Invalid pinned source bytes');if(!cache.has(item.path)&&file.bytes.length+bytes<=maxCacheBytes){cache.set(item.path,file);bytes+=file.bytes.length}item.resolve(file)}catch(error){item.reject(closed?refusal():error)}finally{active--;pump()}})()}}
 // Phase-locked calibration files: never through generic readSource (resources, validators); only the gated API reader.
 const isProtected=path=>typeof path==='string'&&path.startsWith('review-workspace/calibration-protected/');
 async function readSource(path){if(isProtected(path))throw Object.assign(Error('Private resource unavailable'),{status:403});return read(path)}
 async function readProtectedSource(path){if(!isProtected(path))throw Error('Protected calibration path required');return read(path)}
 async function read(path){live();if(!valid(path))throw Error('Exact private source path required');let work=cache.has(path)?Promise.resolve(cache.get(path)):pending.get(path);if(!work){if(pending.size>=5000)throw Error('Too many source requests');work=new Promise((resolve,reject)=>{queue.push({path,resolve,reject})});pending.set(path,work);pump()}
  try{const file=await work;live();return{...file,bytes:file.bytes.slice()}}finally{if(pending.get(path)===work)pending.delete(path)}
 }
 function admitVerifiedSources(group){
  live();if(!(group instanceof Map)||!group.size||group.size>20)throw Error('Bounded verified source group required');
  return admitGroup(group);
 }
 function admitGroup(group){
  let added=0;const additions=[];
  for(const[path,data]of group){if(!valid(path)||isProtected(path)||!(data instanceof Uint8Array))throw Error('Invalid verified source group');if(cache.has(path)){if(cache.get(path).bytes!==data)throw Error('Verified source group conflicts with cache')}else{added+=data.length;additions.push([path,{path,bytes:data}])}}
  if(bytes+added>maxCacheBytes)throw Error('Verified source group exceeds session bounds');
  // Synchronous preflight then insertion: no observer sees a partial group.
  for(const[path,file]of additions)cache.set(path,file);bytes+=added;
  return{addedFiles:additions.length,addedBytes:added,bytes};
 }
 function admitSelectedSources(group){
  live();if(!selected||selectedAdmitted||!(group instanceof Map)||group.size!==selected.size||[...group].some(([p,b])=>!selected.has(p)||!(b instanceof Uint8Array)||b.length!==selected.get(p).bytes))throw Error('Exact unadmitted selected member closure required');
  const result=admitGroup(group);selectedAdmitted=true;return result;
 }
 function admitReviewSources(group){
  live();if(!reviews||reviewAdmitted||!(group instanceof Map)||group.size!==reviews.size||[...group].some(([p,b])=>!reviews.has(p)||!(b instanceof Uint8Array)||b.length!==reviews.get(p).bytes))throw Error('Exact unadmitted review member closure required');
  const result=admitGroup(group);reviewAdmitted=true;return result;
 }
 return{...transport,readSource,readProtectedSource,close,admitVerifiedSources,admitSelectedSources,admitReviewSources,stats:()=>({closed,active,queued:queue.length,cached:cache.size,bytes})};
}
