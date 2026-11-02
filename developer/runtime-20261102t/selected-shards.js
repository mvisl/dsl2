/** Atomic, read-only bounded-shard selected-runtime loader. Not installed by itself. */
import{verifySealedBytes,readSealedTarGzip}from'./sealed-tar.js';
const LIMIT=64*1024*1024,MAX_ASSET=16000000,MAX_SHARDS=8;
const text=new TextDecoder('utf-8',{fatal:true});
const stable=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)
 ?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
function checkSignal(signal){if(signal?.aborted)throw new DOMException('Aborted','AbortError')}
function waitFor(promise,signal){
 if(!signal)return promise;
 return new Promise((resolve,reject)=>{
  const abort=()=>{signal.removeEventListener('abort',abort);reject(new DOMException('Aborted','AbortError'))};
  signal.addEventListener('abort',abort,{once:true});
  Promise.resolve(promise).then(value=>{signal.removeEventListener('abort',abort);if(signal.aborted)abort();else resolve(value)},error=>{signal.removeEventListener('abort',abort);reject(error)});
  if(signal.aborted)abort();
 });
}
function safe(name){
 if(typeof name!=='string'||!name||name.startsWith('/')||/[\\%?#\x00-\x1f]/.test(name)||name.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('Unsafe selected member');
 return name;
}
function seal(value){
 if(!Number.isSafeInteger(value?.bytes)||value.bytes<1||value.bytes>MAX_ASSET||!/^[a-f0-9]{64}$/.test(value.sha256))throw Error('Bounded selected asset seal required');
 return value;
}
export async function readSelectedShards({manifestBytes,manifestSeal,archiveSeals,loadArchive,expectedSourceRevision,signal,onProgress=()=>{}}={}){
 checkSignal(signal);seal(manifestSeal);
 if(typeof loadArchive!=='function'||!Array.isArray(archiveSeals)||archiveSeals.length<2||archiveSeals.length>MAX_SHARDS||!/^[a-f0-9]{40}$/.test(expectedSourceRevision||''))throw Error('Explicit bounded-shard source coordinates required');
 await verifySealedBytes(manifestBytes,manifestSeal);checkSignal(signal);
 const manifest=JSON.parse(text.decode(manifestBytes));
 if(![1,2].includes(manifest.schemaVersion)||manifest.kind!=='private-selected-profile-runtime-sharded'||manifest.privateAccessRequired!==true||manifest.publicPublication!==false||manifest.sourceRevision!==expectedSourceRevision||manifest.shardExpandedLimitBytes!==LIMIT||!Array.isArray(manifest.shards)||manifest.shards.length!==archiveSeals.length||(manifest.schemaVersion===1&&manifest.shards.length!==2)||(manifest.schemaVersion===2&&manifest.shardCount!==manifest.shards.length))throw Error('Selected shard identity or private boundary changed');
 if(!manifest.members||typeof manifest.members!=='object'||Array.isArray(manifest.members)||!manifest.profiles||typeof manifest.profiles!=='object'||Array.isArray(manifest.profiles)||!manifest.sourcePins||!/^[a-f0-9]{64}$/.test(manifest.sourceSealSHA256||''))throw Error('Selected global index required');
 const names=Object.keys(manifest.members),profiles=Object.entries(manifest.profiles),declared=new Set();
 if(!names.length||names.length>(manifest.schemaVersion===1?2000:2000*archiveSeals.length)||!profiles.length||profiles.length>2000)throw Error('Bounded selected global index required');
 for(const name of names){safe(name);const pin=manifest.members[name];if(pin?.path!==name||!Number.isSafeInteger(pin.bytes)||pin.bytes<0||!/^[a-f0-9]{64}$/.test(pin.sha256||''))throw Error('Invalid selected member seal')}
 for(const[index,shard]of manifest.shards.entries()){
  const descriptor=seal(archiveSeals[index]),archive=seal(shard.archive);
  if(shard.id!=='selected-'+index||descriptor.sha256!==archive.sha256||descriptor.bytes!==archive.bytes||!Number.isSafeInteger(shard.expandedTarBytes)||shard.expandedTarBytes>LIMIT||shard.expandedTarBytes<1024||!Array.isArray(shard.members)||!shard.members.length||shard.members.length>2000)throw Error('Selected shard descriptor changed');
  for(const name of shard.members){safe(name);if(declared.has(name)||!Object.hasOwn(manifest.members,name))throw Error('Duplicate or foreign selected member');declared.add(name)}
 }
 if(declared.size!==names.length)throw Error('Incomplete selected shard member coverage');
 for(const[name,p]of profiles){
  if(typeof p.rootId!=='string'||!p.context||typeof p.context!=='object'||!Array.isArray(p.assets))throw Error('Selected profile identity required');
  for(const path of [p.data,p.css,...p.assets])if(!Object.hasOwn(manifest.members,safe(path)))throw Error('Selected profile resource missing');
 }
 // This map never escapes before every shard, profile and context passes.
 const files=new Map();let completed=0;
 for(const[index,shard]of manifest.shards.entries()){
  checkSignal(signal);
  const bytes=await waitFor(loadArchive(archiveSeals[index],{index,signal}),signal);checkSignal(signal);
  const members=Object.fromEntries(shard.members.map(name=>[name,manifest.members[name]]));
  const verified=await readSealedTarGzip(bytes,{seal:archiveSeals[index],members,maxExpandedBytes:LIMIT,
   onProgress:progress=>{checkSignal(signal);onProgress({completed:completed+progress.completed,total:names.length,shardsCompleted:index})}});
  checkSignal(signal);
  for(const[name,raw]of verified){if(files.has(name))throw Error('Duplicate verified selected member');files.set(name,raw)}
  completed+=verified.size;
 }
 if(files.size!==names.length)throw Error('Incomplete verified selected union');
 for(const[name,p]of profiles){
  checkSignal(signal);const data=JSON.parse(text.decode(files.get(p.data)));
  if(!Array.isArray(data.profiles)||data.profiles.length!==1||data.profiles[0].profile!==name||data.profiles[0].rootId!==p.rootId||stable(data.profiles[0].context)!==stable(p.context))throw Error('Selected profile source or context changed');
 }
 checkSignal(signal);return{manifest,files};
}
