/** Select the sealed legacy archive or atomic shard path from an explicit descriptor. */
import{readSelectedShards,inspectSelectedShards}from'./selected-shards.js';
import{verifySealedBytes}from'./sealed-tar.js';
export async function loadSelectedRuntime({spec,expectedSourceRevision,loadAsset,loadLegacy,signal,onProgress}={}){
 if(!spec?.manifest||typeof loadAsset!=='function'||typeof loadLegacy!=='function'||!/^[a-f0-9]{40}$/.test(expectedSourceRevision||''))throw Error('Explicit selected runtime descriptor required');
 if(Object.hasOwn(spec,'archives')){
  const v2=spec.mode==='bounded-selected-shards-v2';
  if(spec.mode!==undefined&&!v2||Object.hasOwn(spec,'archive')||!Array.isArray(spec.archives)||(!v2&&spec.archives.length!==2)||(v2&&(!Number.isInteger(spec.shardCount)||spec.shardCount<2||spec.shardCount>8||spec.archives.length!==spec.shardCount)))throw Error('Ambiguous or unsupported selected shard descriptor');
  const aliases=spec.archives.map(s=>s?.alias);
  if(aliases.some(a=>typeof a!=='string'||!/^[-a-z0-9]+$/.test(a))||new Set(aliases).size!==aliases.length)throw Error('Explicit distinct selected shard aliases required');
  if(v2&&(spec.manifest.alias!=='selected-native-manifest'||aliases.some((a,i)=>a!=='selected-native-shard-'+i)))throw Error('Fixed selected v2 aliases required');
  const manifestBytes=await loadAsset(spec.manifest,signal);
  await verifySealedBytes(manifestBytes,spec.manifest);
  const manifest=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(manifestBytes));
  if(manifest.schemaVersion!==(v2?2:1)||(v2&&manifest.shardCount!==spec.shardCount))throw Error('Selected descriptor schema/count changed');
  return readSelectedShards({manifestBytes,manifestSeal:spec.manifest,archiveSeals:spec.archives,expectedSourceRevision,signal,onProgress,loadArchive:(seal,{signal})=>loadAsset(seal,signal)});
 }
 if(!spec.archive||spec.mode!==undefined)throw Error('Selected archive descriptor required');
 const result=await loadLegacy(spec,'private-selected-profile-runtime',128000000,signal);
 if(result.manifest.sourceRevision!==expectedSourceRevision)throw Error('Selected source revision changed');
 return result;
}

/** Only current bounded-v2 packets can defer their existing atomic admission. */
export async function prepareDeferredSelectedRuntime({spec,expectedSourceRevision,loadAsset,loadLegacy,signal,onProgress}={}){
 if(spec?.mode!=='bounded-selected-shards-v2'||!Number.isInteger(spec.shardCount)||spec.shardCount<2||spec.shardCount>8||!Array.isArray(spec.archives)||spec.archives.length!==spec.shardCount||Object.hasOwn(spec,'archive')||spec.manifest?.alias!=='selected-native-manifest'||spec.archives.some((a,i)=>a?.alias!=='selected-native-shard-'+i))throw Error('Explicit selected v2 descriptor required');
 const manifestBytes=await loadAsset(spec.manifest,signal);
 const manifest=await inspectSelectedShards({manifestBytes,manifestSeal:spec.manifest,archiveSeals:spec.archives,expectedSourceRevision,signal});
 if(manifest.schemaVersion!==2||manifest.shardCount!==spec.shardCount)throw Error('Selected descriptor schema/count changed');
 return {manifest,load:({signal:groupSignal}={})=>loadSelectedRuntime({spec,expectedSourceRevision,signal:groupSignal,onProgress,loadLegacy,loadAsset:(seal,s)=>seal===spec.manifest?manifestBytes:loadAsset(seal,s)})};
}
/** A selected member never falls through to GitHub: derived profiles exist only in the sealed group. */
export function createDeferredSelectedSource({transport,prepared,getToken,admit,onState=()=>{}}={}){
 if(typeof transport?.readSource!=='function'||!prepared?.manifest?.members||typeof prepared.load!=='function'||typeof getToken!=='function'||typeof admit!=='function')throw Error('Explicit deferred selected source required');
 const paths=new Set(Object.keys(prepared.manifest.members).map(p=>'review-workspace/'+p)),controller=new AbortController();let pending=null,files=null,closed=false;onState('deferred');
 const live=()=>{if(closed||!getToken())throw Object.assign(Error('GitHub sign-in required'),{status:401})};
 async function readSource(path,options){live();if(!paths.has(path))return transport.readSource(path,options);
  if(!pending)pending=(async()=>{let result;onState('loading');try{result=await prepared.load({signal:controller.signal});live();const group=new Map([...result.files].map(([p,b])=>['review-workspace/'+p,b]));admit(group);files=result.files;onState('verified');return files}catch(error){if(result){for(const b of result.files.values())b.fill(0);result.files.clear()}onState('failed');throw error}})().catch(error=>{pending=null;throw error});
  const result=await pending;live();return {path,bytes:result.get(path.slice('review-workspace/'.length))};
 }
 return {...transport,readSource,closeSelected(){closed=true;onState('closed');controller.abort();files?.clear();files=null;pending=null}};
}
