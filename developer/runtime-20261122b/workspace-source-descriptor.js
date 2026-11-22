/** Isolated integration candidate. Fixed source modes/coordinates; no request-selected paths. */
export const SOURCE_MODES=Object.freeze(['legacy-ustar-v1','offset-envelope-v1','offset-envelope-shards-v1']);
const sha=/^[a-f0-9]{64}$/;
function coordinate(s,alias){
 if(!s||Object.keys(s).some(k=>!['alias','bytes','sha256','parts'].includes(k))||s.alias!==alias||!Number.isSafeInteger(s.bytes)||s.bytes<1||s.bytes>16000000||!sha.test(s.sha256||''))throw Error('Exact bounded source coordinate required');
 const value={alias,bytes:s.bytes,sha256:s.sha256};
 if(s.parts!==undefined){if(!Array.isArray(s.parts)||!s.parts.length||s.parts.length>64)throw Error('Bounded source parts required');let offset=0;value.parts=s.parts.map((p,index)=>{if(!p||Object.keys(p).sort().join('|')!=='bytes|index|offset|sha256'||p.index!==index||p.offset!==offset||!Number.isSafeInteger(p.bytes)||p.bytes<1||p.bytes>524288||!sha.test(p.sha256||''))throw Error('Contiguous sealed source parts required');offset+=p.bytes;return{index,offset:p.offset,bytes:p.bytes,sha256:p.sha256}});if(offset!==s.bytes)throw Error('Complete source part coverage required')}
 return value;
}
export function describeWorkspaceSources({mode='legacy-ustar-v1',sourceRevision,manifest,archive,shards}={}){
 if(!SOURCE_MODES.includes(mode)||!/^[a-f0-9]{40}$/.test(sourceRevision||''))throw Error('Explicit source mode and revision required');
 if(mode==='offset-envelope-shards-v1'){if(archive!==undefined||!Array.isArray(shards)||shards.length!==2)throw Error('Exact two bounded source shards required');const root=coordinate(manifest,'workspace-sources-shards-manifest');if(root.bytes>1000000)throw Error('Union manifest bound');return{mode,sourceRevision,expandedByteLimit:32000000,memberLimit:2200,shardCount:2,aggregateExpandedByteLimit:64000000,aggregateMemberLimit:4400,manifest:root,shards:shards.map((s,i)=>{if(!s||Object.keys(s).sort().join('|')!=='archive|manifest')throw Error('Exact source shard coordinates required');const m=coordinate(s.manifest,'workspace-sources-shard-'+i+'-manifest');if(m.bytes>1000000)throw Error('Shard manifest bound');return{manifest:m,archive:coordinate(s.archive,'workspace-sources-shard-'+i)}})}}
 return{mode,sourceRevision,expandedByteLimit:32000000,memberLimit:2200,manifest:coordinate(manifest,'workspace-sources-manifest'),archive:coordinate(archive,'workspace-sources')};
}
export function inspectWorkspaceSourceSpec(spec,expectedRevision){
 if(spec?.mode==='offset-envelope-shards-v1'){if(Object.keys(spec).sort().join('|')!=='aggregateExpandedByteLimit|aggregateMemberLimit|expandedByteLimit|manifest|memberLimit|mode|shardCount|shards|sourceRevision'||spec.sourceRevision!==expectedRevision||spec.expandedByteLimit!==32000000||spec.memberLimit!==2200||spec.shardCount!==2||spec.aggregateExpandedByteLimit!==64000000||spec.aggregateMemberLimit!==4400)throw Error('Exact sharded source descriptor agreement required');return describeWorkspaceSources(spec)}
 if(!spec||Object.keys(spec).sort().join('|')!=='archive|expandedByteLimit|manifest|memberLimit|mode|sourceRevision'||spec.sourceRevision!==expectedRevision||spec.expandedByteLimit!==32000000||spec.memberLimit!==2200)throw Error('Authenticated source descriptor agreement required');
 return describeWorkspaceSources(spec);
}
