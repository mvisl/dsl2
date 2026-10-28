/** Pinned source/verified artifact bytes in session memory; bounded network concurrency. */
const refusal=()=>Object.assign(Error('GitHub sign-in required'),{status:401});
export function createSourceSession({transport,getToken,verifiedFiles=new Map(),limit=6,maxCacheBytes=256000000}={}){
 if(typeof transport?.readSource!=='function'||typeof getToken!=='function'||!(verifiedFiles instanceof Map)||!Number.isInteger(limit)||limit<1||limit>12||!Number.isSafeInteger(maxCacheBytes)||maxCacheBytes<1)throw Error('Bounded authenticated source session required');
 const valid=path=>typeof path==='string'&&path.startsWith('review-workspace/')&&!/[\\%?#\x00-\x1f]/.test(path)&&!path.split('/').some(x=>!x||x==='.'||x==='..');
 const cache=new Map(),pending=new Map(),queue=[],controller=new AbortController();let closed=false,active=0,bytes=0;
 for(const[path,data]of verifiedFiles){const full='review-workspace/'+path;if(!valid(full)||!(data instanceof Uint8Array))throw Error('Invalid verified source member');bytes+=data.length;if(bytes>maxCacheBytes)throw Error('Verified source packet exceeds session bounds');cache.set(full,{path:full,bytes:data})}
 function close(){if(closed)return;closed=true;controller.abort();cache.clear();pending.clear();bytes=0;for(const item of queue.splice(0))item.reject(refusal())}
 function live(){if(closed)throw refusal();if(!getToken()){close();throw refusal()}}
 function pump(){while(!closed&&active<limit&&queue.length){const item=queue.shift();active++;(async()=>{try{live();const file=await transport.readSource(item.path,{signal:controller.signal});live();if(!(file.bytes instanceof Uint8Array))throw Error('Invalid pinned source bytes');if(file.bytes.length+bytes<=maxCacheBytes){cache.set(item.path,file);bytes+=file.bytes.length}item.resolve(file)}catch(error){item.reject(closed?refusal():error)}finally{active--;pump()}})()}}
 async function readSource(path){live();if(!valid(path))throw Error('Exact private source path required');let work=cache.has(path)?Promise.resolve(cache.get(path)):pending.get(path);if(!work){if(pending.size>=5000)throw Error('Too many source requests');work=new Promise((resolve,reject)=>{queue.push({path,resolve,reject})});pending.set(path,work);pump()}
  try{const file=await work;live();return{...file,bytes:file.bytes.slice()}}finally{if(pending.get(path)===work)pending.delete(path)}
 }
 return{...transport,readSource,close,stats:()=>({closed,active,queued:queue.length,cached:cache.size,bytes})};
}
