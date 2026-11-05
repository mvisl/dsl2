/** Isolated integration candidate. Complete verified source group; no source fallback or session. */
import{verifySealedBytes,readSealedTarGzip}from'./sealed-tar.js';
import{readOffsetEnvelope}from'./offset-envelope-reader.js';
import{LIMITS,pathSafe}from'./offset-envelope-protocol.js';
import{inspectWorkspaceSourceSpec}from'./workspace-source-descriptor.js';
export async function loadWorkspaceSources({spec,expectedSourceRevision,loadAsset,signal,isCurrent=()=>true,onProgress=()=>{},crypto=globalThis.crypto}={}){
 let decoded=null,files=null;
 const guard=()=>{if(signal?.aborted||!isCurrent())throw new DOMException('Source session changed','AbortError')};
 try{
  guard();if(typeof loadAsset!=='function'||typeof isCurrent!=='function')throw Error('Explicit authenticated asset loader required');
  const fixed=inspectWorkspaceSourceSpec(spec,expectedSourceRevision); // snapshots all coordinates before awaits
  const manifestBytes=await loadAsset(fixed.manifest,signal);guard();if(manifestBytes.length>LIMITS.manifest)throw Error('Source manifest bound');await verifySealedBytes(manifestBytes,fixed.manifest,{crypto});guard();
  const m=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(manifestBytes)),kind=fixed.mode==='offset-envelope-v1'?'private-browser-offset-v1':'private-workspace-browser-imports';
  if(m.kind!==kind||m.schemaVersion!==1||m.sourceRevision!==expectedSourceRevision||m.archive?.bytes!==fixed.archive.bytes||m.archive?.sha256!==fixed.archive.sha256||!m.members||typeof m.members!=='object'||Array.isArray(m.members))throw Error('Sealed source manifest mode/revision/coordinates changed');
  const names=Object.keys(m.members);if(!names.length||names.length>fixed.memberLimit)throw Error('Aggregate source count');let payload=0;
  for(const n of names){pathSafe(n);const s=m.members[n];if(!s||Object.keys(s).sort().join('|')!=='bytes|path|sha256'||s.path!==n||!Number.isSafeInteger(s.bytes)||s.bytes<0||!/^[a-f0-9]{64}$/.test(s.sha256||''))throw Error('Exact source member seal required');payload+=s.bytes;if(payload>fixed.expandedByteLimit)throw Error('Aggregate source payload bound')}
  if(fixed.mode==='legacy-ustar-v1'&&(m.privateAccessRequired!==true||m.publicPublication!==false))throw Error('Private legacy source identity required');
  const bytes=await loadAsset(fixed.archive,signal);guard();
  const progress=p=>{guard();onProgress(p);guard()};
  if(fixed.mode==='offset-envelope-v1')decoded=(await readOffsetEnvelope({bytes,archiveSeal:fixed.archive,manifestBytes,manifestSeal:fixed.manifest,expectedSourceRevision,expectedMembers:m.members,signal,crypto,onProgress:progress,onPhase:guard})).files;
  else decoded=await readSealedTarGzip(bytes,{seal:fixed.archive,members:m.members,maxExpandedBytes:fixed.expandedByteLimit,maxMembers:fixed.memberLimit,crypto,onProgress:progress});
  guard();files=new Map(decoded);guard(); // never construct a source session/mount inside decoder
  if(files.size!==names.length)throw Error('Incomplete source group');return{manifest:m,files,mode:fixed.mode};
 }catch(error){if(decoded){for(const b of decoded.values())b.fill(0);decoded.clear()}if(files){for(const b of files.values())b.fill(0);files.clear()}throw error}
}
