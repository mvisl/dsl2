/** Full-core mode switch; legacy 192M archive bound remains unchanged. */
import{FULL_NATIVE_PATHS,readFullNativeChunks}from'./full-native-chunks.js';
import{verifySealedBytes}from'./sealed-tar.js';
export async function loadFullNativeRuntime({spec,expectedSourceRevision,expectedMembers,maxReassembledBytes,loadAsset,loadLegacy,signal,onProgress}={}){
 let result;
 if(spec?.mode==='exact-whole-file-chunks-v1'){
  if(Object.hasOwn(spec,'archive'))throw Error('Ambiguous full-core descriptor');
  result=await readFullNativeChunks({manifestBytes:await loadAsset(spec.manifest,signal),manifestSeal:spec.manifest,sourceManifestSeal:spec.sourceManifest,archiveSeals:spec.archives,expectedSourceRevision,expectedMembers,maxReassembledBytes,loadArchive:(seal,{signal})=>loadAsset(seal,signal),signal,onProgress});
 }else{
  if(spec?.mode!==undefined||Object.hasOwn(spec||{},'archives'))throw Error('Unsupported full-core mode');
  result=await loadLegacy(spec,'private-workspace-full-native',192000000,signal);
 }
 try{
  if(result.manifest.sourceRevision!==expectedSourceRevision||!(result.files instanceof Map)||result.files.size!==4||FULL_NATIVE_PATHS.some(n=>!result.files.has(n)))throw Error('Exact full-core source closure required');
  let total=0;for(const[n,b]of result.files){await verifySealedBytes(b,expectedMembers[n]);total+=b.length}
  if(total>maxReassembledBytes)throw Error('Full-core exceeds available source cache budget');
  return result;
 }catch(error){for(const b of result.files?.values()||[])b.fill(0);result.files?.clear();throw error}
}
