/** Isolated integration candidate. Fixed source modes/coordinates; no request-selected paths. */
export const SOURCE_MODES=Object.freeze(['legacy-ustar-v1','offset-envelope-v1']);
const sha=/^[a-f0-9]{64}$/;
function coordinate(s,alias){
 if(!s||Object.keys(s).some(k=>!['alias','bytes','sha256','parts'].includes(k))||s.alias!==alias||!Number.isSafeInteger(s.bytes)||s.bytes<1||s.bytes>16000000||!sha.test(s.sha256||''))throw Error('Exact bounded source coordinate required');
 const value={alias,bytes:s.bytes,sha256:s.sha256};
 if(s.parts!==undefined){if(!Array.isArray(s.parts)||!s.parts.length||s.parts.length>64)throw Error('Bounded source parts required');let offset=0;value.parts=s.parts.map((p,index)=>{if(!p||Object.keys(p).sort().join('|')!=='bytes|index|offset|sha256'||p.index!==index||p.offset!==offset||!Number.isSafeInteger(p.bytes)||p.bytes<1||p.bytes>524288||!sha.test(p.sha256||''))throw Error('Contiguous sealed source parts required');offset+=p.bytes;return{index,offset:p.offset,bytes:p.bytes,sha256:p.sha256}});if(offset!==s.bytes)throw Error('Complete source part coverage required')}
 return value;
}
export function describeWorkspaceSources({mode='legacy-ustar-v1',sourceRevision,manifest,archive}={}){
 if(!SOURCE_MODES.includes(mode)||!/^[a-f0-9]{40}$/.test(sourceRevision||''))throw Error('Explicit source mode and revision required');
 return{mode,sourceRevision,expandedByteLimit:32000000,memberLimit:2200,manifest:coordinate(manifest,'workspace-sources-manifest'),archive:coordinate(archive,'workspace-sources')};
}
export function inspectWorkspaceSourceSpec(spec,expectedRevision){
 if(!spec||Object.keys(spec).sort().join('|')!=='archive|expandedByteLimit|manifest|memberLimit|mode|sourceRevision'||spec.sourceRevision!==expectedRevision||spec.expandedByteLimit!==32000000||spec.memberLimit!==2200)throw Error('Authenticated source descriptor agreement required');
 return describeWorkspaceSources(spec);
}
