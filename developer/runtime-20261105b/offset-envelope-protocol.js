/** ISOLATED OFFLINE prototype. Not imported by any runtime. */
export const LIMITS=Object.freeze({expanded:32000000,members:2200,compressed:16000000,index:1000000,manifest:1000000});
export const MAGIC=new TextEncoder().encode('DSL2OFF1');
export const KIND='private-browser-offset-v1';
export const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0)):v);
export function pathSafe(n){if(typeof n!=='string'||!n||n.length>LIMITS.index||n.startsWith('/')||/[\\%?#\x00-\x1f\x7f]/.test(n)||n.split('/').some(v=>!v||v==='.'||v==='..')||/[\ud800-\udfff]/u.test(n))throw Error('Unsafe member path');return n}
export function indexFor(members,revision){
 if(!/^[a-f0-9]{40}$/.test(revision||'')||!members||typeof members!=='object'||Array.isArray(members))throw Error('Exact source identity and inventory required');
 const names=Object.keys(members).sort();if(!names.length||names.length>LIMITS.members)throw Error('Aggregate member limit');
 let offset=0,indexBudget=0;const rows=names.map(n=>{pathSafe(n);const s=members[n];if(!s||Object.keys(s).sort().join('|')!=='bytes|path|sha256'||s.path!==n||!Number.isSafeInteger(s.bytes)||s.bytes<0||s.bytes>LIMITS.expanded||!/^[a-f0-9]{64}$/.test(s.sha256||''))throw Error('Exact member seal required');const row=[n,offset,s.bytes,s.sha256];indexBudget+=new TextEncoder().encode(canonical(row)).length+1;if(indexBudget>LIMITS.index)throw Error('Index byte limit');offset+=s.bytes;if(!Number.isSafeInteger(offset)||offset>LIMITS.expanded)throw Error('Aggregate payload limit');return row});
 const index={schemaVersion:1,kind:KIND,sourceRevision:revision,members:rows,payloadBytes:offset,memberCount:rows.length},bytes=new TextEncoder().encode(canonical(index));
 if(bytes.length>LIMITS.index||16+bytes.length+offset>LIMITS.expanded)throw Error('Aggregate expanded envelope limit');return{index,bytes,total:16+bytes.length+offset};
}
