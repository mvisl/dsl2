/** Select the sealed legacy archive or atomic shard path from an explicit descriptor. */
import{readSelectedShards}from'./selected-shards.js';
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
