/** Exact full-core chunk reassembly. Temporary chunks never enter a source cache. */
import{verifySealedBytes,readSealedTarGzip}from'./sealed-tar.js';
const CHUNK=32*1024*1024,EXPANDED=64*1024*1024,ASSET=16000000,CACHE=384000000,MAX_CHUNKS=16;
export const FULL_NATIVE_PATHS=Object.freeze(['native.css','native.json','server-contract.json','token-bindings.json'].map(n=>'options-sheets/'+n));
const text=new TextDecoder('utf-8',{fatal:true}),hash=/^[a-f0-9]{64}$/;
function aborted(signal){if(signal?.aborted)throw new DOMException('Aborted','AbortError')}
function seal(s,limit=ASSET){if(!Number.isSafeInteger(s?.bytes)||s.bytes<1||s.bytes>limit||!hash.test(s.sha256||''))throw Error('Bounded full-core seal required');return s}
const same=(a,b)=>a.bytes===b.bytes&&a.sha256===b.sha256;
function wait(promise,signal){if(!signal)return promise;return new Promise((resolve,reject)=>{const abort=()=>{signal.removeEventListener('abort',abort);reject(new DOMException('Aborted','AbortError'))};signal.addEventListener('abort',abort,{once:true});Promise.resolve(promise).then(value=>{signal.removeEventListener('abort',abort);if(signal.aborted)abort();else resolve(value)},error=>{signal.removeEventListener('abort',abort);reject(error)});if(signal.aborted)abort()})}
export async function readFullNativeChunks({manifestBytes,manifestSeal,sourceManifestSeal,archiveSeals,expectedSourceRevision,expectedMembers,maxReassembledBytes,loadArchive,signal,onProgress=()=>{}}={}){
 aborted(signal);seal(manifestSeal);seal(sourceManifestSeal);
 if(manifestSeal.alias!=='full-native-chunks-manifest'||!/^[a-f0-9]{40}$/.test(expectedSourceRevision||'')||typeof loadArchive!=='function'||!Number.isSafeInteger(maxReassembledBytes)||maxReassembledBytes<1||maxReassembledBytes>CACHE||!Array.isArray(archiveSeals)||archiveSeals.length<4||archiveSeals.length>MAX_CHUNKS)throw Error('Explicit bounded full-core descriptor required');
 for(const[i,s]of archiveSeals.entries())if(seal(s).alias!=='full-native-chunk-'+i)throw Error('Fixed full-core archive alias required');
 await verifySealedBytes(manifestBytes,manifestSeal);aborted(signal);
 const m=JSON.parse(text.decode(manifestBytes));
 if(m.schemaVersion!==2||m.kind!=='private-workspace-full-native-chunked'||m.mode!=='exact-whole-file-chunks-v1'||m.privateAccessRequired!==true||m.publicPublication!==false||m.sourceRevision!==expectedSourceRevision||m.chunkPayloadLimitBytes!==CHUNK||m.archiveExpandedLimitBytes!==EXPANDED||!same(seal(m.sourceManifest),sourceManifestSeal)||!Array.isArray(m.chunks)||m.chunks.length!==archiveSeals.length)throw Error('Full-core source identity or chunk mode changed');
 for(const entries of [m.members,expectedMembers])if(!entries||typeof entries!=='object'||Array.isArray(entries)||Object.keys(entries).sort().join('|')!==FULL_NATIVE_PATHS.join('|'))throw Error('Exact four-file full-core allowlist required');
 let total=0;const offsets=new Map(FULL_NATIVE_PATHS.map(n=>[n,0]));
 for(const n of FULL_NATIVE_PATHS){const s=seal(m.members[n],CACHE);if(s.path!==n||!same(s,seal(expectedMembers[n],CACHE)))throw Error('Original full-core member seal changed');total+=s.bytes}
 if(total!==m.totalReassembledBytes||total>maxReassembledBytes)throw Error('Full-core exceeds available source cache budget');
 let fileIndex=0;
 for(const[i,c]of m.chunks.entries()){
  const n=FULL_NATIVE_PATHS[fileIndex],expectedLength=Math.min(CHUNK,m.members[n]?.bytes-offsets.get(n));
  if(c.id!=='full-chunk-'+i||c.file!==n||c.offset!==offsets.get(n)||c.bytes!==expectedLength||c.bytes<1||c.member?.path!=='chunks/full-'+i+'.bin'||!same(seal(c.member,CHUNK),{bytes:c.bytes,sha256:c.member.sha256})||c.archive?.path!=='full-native-chunk-'+i+'.tar.gz'||!same(seal(c.archive),archiveSeals[i])||!Number.isSafeInteger(c.expandedTarBytes)||c.expandedTarBytes<1024||c.expandedTarBytes>EXPANDED)throw Error('Full-core chunk offset, coverage or archive changed');
  offsets.set(n,offsets.get(n)+c.bytes);if(offsets.get(n)===m.members[n].bytes)fileIndex++;
 }
 if(fileIndex!==FULL_NATIVE_PATHS.length||FULL_NATIVE_PATHS.some(n=>offsets.get(n)!==m.members[n].bytes))throw Error('Incomplete full-core chunk coverage');
 const files=new Map();let target=null,temporary=null,completed=0;
 try{
  for(const[i,c]of m.chunks.entries()){
   aborted(signal);if(c.offset===0)target=new Uint8Array(m.members[c.file].bytes);
   let bytes=await wait(loadArchive(archiveSeals[i],{index:i,signal}),signal);aborted(signal);
   temporary=await readSealedTarGzip(bytes,{seal:archiveSeals[i],members:{[c.member.path]:c.member},maxExpandedBytes:EXPANDED,onProgress:()=>aborted(signal)});bytes=null;aborted(signal);
   const part=temporary.get(c.member.path);target.set(part,c.offset);part.fill(0);temporary.clear();temporary=null;
   if(c.offset+c.bytes===target.length){await verifySealedBytes(target,m.members[c.file]);aborted(signal);files.set(c.file,target);target=null}
   completed+=c.bytes;onProgress({completed,total,chunksCompleted:i+1,chunksTotal:m.chunks.length});
  }
  aborted(signal);if(files.size!==4)throw Error('Incomplete verified full-core group');return{manifest:m,files};
 }catch(error){target?.fill(0);for(const b of files.values())b.fill(0);files.clear();throw error}
 finally{if(temporary){for(const b of temporary.values())b.fill(0);temporary.clear()}temporary=null;target=null}
}
