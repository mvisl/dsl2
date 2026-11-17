/** OFFLINE ONLY. Atomic return; independent member copies; no network/cache/fallback. */
import{verifySealedBytes}from'./sealed-tar.js';
import{LIMITS,MAGIC,KIND,canonical,indexFor}from'./offset-envelope-protocol.js';
const decoder=new TextDecoder('utf-8',{fatal:true}),aborted=s=>{if(s?.aborted)throw new DOMException('Aborted','AbortError')};
const same=(a,b)=>a?.bytes===b?.bytes&&a?.sha256===b?.sha256;
function boundedSeal(s,max){if(!Number.isSafeInteger(s?.bytes)||s.bytes<1||s.bytes>max||!/^[a-f0-9]{64}$/.test(s.sha256||''))throw Error('Bounded seal required')}
export async function readOffsetEnvelope({bytes,archiveSeal,manifestBytes,manifestSeal,expectedSourceRevision,expectedMembers,signal,crypto=globalThis.crypto,onProgress=()=>{},onPhase=()=>{}}={}){
 const files=new Map();let raw=null,current=null,reader=null,ownedPeak=0,copied=0;
 const cancel=()=>{reader?.cancel().catch(()=>{})};
 try{
  aborted(signal);const expected=indexFor(expectedMembers,expectedSourceRevision);expectedMembers=Object.fromEntries(expected.index.members.map(([path,,bytes,sha256])=>[path,{path,bytes,sha256}]));archiveSeal={bytes:archiveSeal?.bytes,sha256:archiveSeal?.sha256};manifestSeal={bytes:manifestSeal?.bytes,sha256:manifestSeal?.sha256};boundedSeal(manifestSeal,LIMITS.manifest);boundedSeal(archiveSeal,LIMITS.compressed);
  await verifySealedBytes(manifestBytes,manifestSeal,{crypto});aborted(signal);
  const manifestText=decoder.decode(manifestBytes),expectedManifest={schemaVersion:1,kind:KIND,sourceRevision:expectedSourceRevision,expandedBytes:expected.total,members:expectedMembers,archive:archiveSeal};
  if(manifestText!==canonical(expectedManifest))throw Error('Sealed manifest identity, canonical encoding or complete inventory changed');
  await verifySealedBytes(bytes,archiveSeal,{crypto});aborted(signal);
  raw=new Uint8Array(expected.total);ownedPeak=raw.length;
  reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  signal?.addEventListener('abort',cancel,{once:true});onPhase('decompressing');aborted(signal);let used=0;
  for(;;){const{done,value}=await reader.read();aborted(signal);if(done)break;if(used+value.byteLength>expected.total||used+value.byteLength>LIMITS.expanded)throw Error('Expanded stream exceeds aggregate bounds');raw.set(value,used);used+=value.byteLength}
  aborted(signal);if(used!==expected.total)throw Error('Truncated expanded envelope');
  const header=new DataView(raw.buffer);if(!MAGIC.every((b,i)=>raw[i]===b)||header.getUint32(8,true)!==expected.bytes.length||header.getUint32(12,true)!==0)throw Error('Envelope magic/version/index/flags changed');
  const actualIndex=raw.subarray(16,16+expected.bytes.length);if(actualIndex.some((b,i)=>b!==expected.bytes[i]))throw Error('Noncanonical index, offsets, paths or seals changed');
  const start=16+expected.bytes.length;
  for(const[name,offset,length]of expected.index.members){
   aborted(signal);current=raw.slice(start+offset,start+offset+length);ownedPeak=Math.max(ownedPeak,raw.length+copied+current.length);
   await verifySealedBytes(current,expectedMembers[name],{crypto});aborted(signal);files.set(name,current);copied+=current.length;current=null;
   onProgress({completed:files.size,total:expected.index.memberCount});aborted(signal);
  }
  aborted(signal);if(files.size!==expected.index.memberCount)throw Error('Incomplete verified inventory');
  await reader.cancel();reader=null;aborted(signal);raw.fill(0);raw=null;aborted(signal);
  return{files,stats:{expandedBytes:expected.total,payloadBytes:expected.index.payloadBytes,members:files.size,indexBytes:expected.bytes.length,ownedBufferPeakBytes:ownedPeak,returnedBufferBytes:copied,ownership:'Independent per-member copies; temporary envelope zeroed/released; input caller-owned'}};
 }catch(error){current?.fill(0);for(const b of files.values())b.fill(0);files.clear();throw error}
 finally{signal?.removeEventListener('abort',cancel);reader?.cancel().catch(()=>{});raw?.fill(0);raw=null;current=null}
}
