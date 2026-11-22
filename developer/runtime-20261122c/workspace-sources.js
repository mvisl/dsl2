/** Isolated integration candidate. Complete verified source group; no source fallback or session. */
import{verifySealedBytes,readSealedTarGzip}from'./sealed-tar.js';
import{readOffsetEnvelope}from'./offset-envelope-reader.js';
import{LIMITS,pathSafe,canonical}from'./offset-envelope-protocol.js';
import{inspectWorkspaceSourceSpec}from'./workspace-source-descriptor.js';
export async function loadWorkspaceSources({spec,expectedSourceRevision,loadAsset,signal,isCurrent=()=>true,onProgress=()=>{},crypto=globalThis.crypto}={}){
 let decoded=null,files=null;
 const guard=()=>{if(signal?.aborted||!isCurrent())throw new DOMException('Source session changed','AbortError')};
 try{
  guard();if(typeof loadAsset!=='function'||typeof isCurrent!=='function')throw Error('Explicit authenticated asset loader required');
  const fixed=inspectWorkspaceSourceSpec(spec,expectedSourceRevision);if(fixed.mode==='offset-envelope-shards-v1')return await readSourceShards({fixed,expectedSourceRevision,loadAsset,signal,guard,onProgress,crypto}); // snapshots all coordinates before awaits
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

/** Atomic union only: no file/session escapes until every bounded shard is verified. */
async function readSourceShards({fixed,expectedSourceRevision,loadAsset,signal,guard,onProgress,crypto}){
 const groups=[],files=new Map();
 try{
  const fetchManifest=async seal=>{guard();const b=await loadAsset(seal,signal);guard();if(b.length>LIMITS.manifest)throw Error('Source manifest bound');await verifySealedBytes(b,seal,{crypto});guard();return{manifest:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b)),bytes:b}};
  const{manifest:m}=await fetchManifest(fixed.manifest);
  if(Object.keys(m).sort().join('|')!=='aggregateExpandedByteLimit|aggregateMemberLimit|expandedByteLimit|expandedBytes|kind|memberLimit|members|schemaVersion|shardCount|shards|sourceRevision'||m.kind!=='private-browser-offset-shards-v1'||m.schemaVersion!==1||m.sourceRevision!==expectedSourceRevision||m.shardCount!==2||m.expandedByteLimit!==32000000||m.memberLimit!==2200||m.aggregateExpandedByteLimit!==64000000||m.aggregateMemberLimit!==4400||!m.members||Array.isArray(m.members)||typeof m.members!=='object'||!Array.isArray(m.shards)||m.shards.length!==2)throw Error('Exact source union manifest required');
  const names=Object.keys(m.members),owners=new Set();let payload=0,declaredExpanded=0;
  if(!names.length||names.length>4400)throw Error('Bounded union member count');
  for(const n of names){pathSafe(n);const p=m.members[n];if(!p||Object.keys(p).sort().join('|')!=='bytes|path|sha256'||p.path!==n||!Number.isSafeInteger(p.bytes)||p.bytes<0||p.bytes>32000000||!/^[a-f0-9]{64}$/.test(p.sha256||''))throw Error('Exact union member seal');payload+=p.bytes;if(payload>64000000)throw Error('Union payload bound')}
  const subsets=m.shards.map((s,i)=>{
   if(!s||Object.keys(s).sort().join('|')!=='archive|expandedBytes|index|manifest|memberCount|members'||s.index!==i||canonical(s.manifest)!==canonical(fixed.shards[i].manifest)||canonical(s.archive)!==canonical(fixed.shards[i].archive)||!Array.isArray(s.members)||!s.members.length||s.members.length>2200||s.memberCount!==s.members.length||!Number.isSafeInteger(s.expandedBytes)||s.expandedBytes<1||s.expandedBytes>32000000)throw Error('Exact bounded shard membership/coordinates');
   const subset=Object.create(null);for(const n of s.members){pathSafe(n);if(!Object.hasOwn(m.members,n)||owners.has(n))throw Error('Duplicate or unknown shard member');owners.add(n);subset[n]=m.members[n]}
   declaredExpanded+=s.expandedBytes;return subset;
  });
  if(owners.size!==names.length||declaredExpanded>64000000||m.expandedBytes!==declaredExpanded)throw Error('Incomplete union or aggregate bound');
  for(let i=0;i<2;i++){
   guard();const s=fixed.shards[i],{manifest:part,bytes:manifestBytes}=await fetchManifest(s.manifest);
   if(part.schemaVersion!==1||part.kind!=='private-browser-offset-v1'||part.sourceRevision!==expectedSourceRevision||part.expandedBytes!==m.shards[i].expandedBytes||canonical(part.members)!==canonical(subsets[i])||part.archive?.bytes!==s.archive.bytes||part.archive?.sha256!==s.archive.sha256)throw Error('Shard manifest/revision/ownership mismatch');
   guard();const bytes=await loadAsset(s.archive,signal);guard();const decoded=await readOffsetEnvelope({bytes,archiveSeal:s.archive,manifestBytes,manifestSeal:s.manifest,expectedSourceRevision,expectedMembers:subsets[i],signal,crypto,onProgress:p=>{guard();onProgress({completed:files.size+p.completed,total:names.length});guard()},onPhase:guard});groups.push(decoded.files);guard();
   if(decoded.stats.expandedBytes!==m.shards[i].expandedBytes)throw Error('Shard expanded bytes mismatch');for(const[n,b]of decoded.files){if(files.has(n))throw Error('Duplicate decoded source member');files.set(n,b)}
  }
  guard();if(files.size!==names.length)throw Error('Incomplete source union');return{manifest:m,files,mode:fixed.mode};
 }catch(error){for(const g of groups){for(const b of g.values())b.fill(0);g.clear()}for(const b of files.values())b.fill(0);files.clear();throw error}
}
