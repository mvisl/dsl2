/** Owner answers only. Source-processing metadata and submitted answers are immutable here. */
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const canonical=v=>Array.isArray(v)?v.map(canonical):plain(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const allowed=new Set(['variants','comment','status','responseIntent','selectedVariantIds','attachments','submissionId','submittedAt','processing']);
export function createDecisionWriter({reader,transport,canWrite=()=>false,questionIds}={}){
 if(typeof reader?.snapshot!=='function'||typeof transport?.writeRecords!=='function'||typeof transport?.readRecordAtCommit!=='function'||typeof canWrite!=='function'||!(questionIds instanceof Set))throw Error('Explicit decision writer dependencies required');
 return {async save(payload,{signal}={}){
  if(!await canWrite())fail('This GitHub session cannot save answers',403);
  if(!plain(payload)||payload.schemaVersion!==1||!Number.isSafeInteger(payload.revision)||!plain(payload.decisions)||new TextEncoder().encode(JSON.stringify(payload)).length>1900000)fail('Invalid decisions document');
  const state=await reader.snapshot({signal}),old=state.decisions;
  if(payload.revision!==old.revision)fail('Answers changed; reload before saving',409);
  for(const id of Object.keys(old.decisions))if(!Object.hasOwn(payload.decisions,id))fail('Existing answers cannot be removed');
  for(const[id,value]of Object.entries(payload.decisions)){
   const previous=old.decisions[id];if(same(previous,value))continue;
   if(!questionIds.has(id)||!plain(value))fail('Unknown question or invalid answer');
   if(previous?.status==='decided')fail('Submitted answers must be preserved');
   for(const key of Object.keys(value))if(!allowed.has(key)&&!same(value[key],previous?.[key]))fail('Answer metadata cannot be changed');
   for(const key of Object.keys(previous||{}))if(!allowed.has(key)&&!Object.hasOwn(value,key))fail('Answer metadata must be preserved');
   if(!plain(value.variants)||Object.values(value.variants).some(v=>!['keep','archive','unify','rework','pending'].includes(v))||typeof value.comment!=='string'||value.comment.length>100000||!['pending','decided'].includes(value.status))fail('Invalid answer fields');
   if(value.responseIntent!==undefined&&value.responseIntent!==null&&(typeof value.responseIntent!=='string'||value.responseIntent.length>100))fail('Invalid response intent');
   if(value.selectedVariantIds!==undefined&&(!Array.isArray(value.selectedVariantIds)||value.selectedVariantIds.some(v=>typeof v!=='string'||v.length>160)))fail('Invalid selected variants');
   // Attachments need their own validated upload transaction. Preserve existing files only.
   if(!same(value.attachments||[],previous?.attachments||[]))fail('Upload attachments before submitting');
   if(value.status==='decided'){
    if(typeof value.submissionId!=='string'||!/^[a-f0-9-]{36}$/i.test(value.submissionId)||typeof value.submittedAt!=='string'||!Number.isFinite(Date.parse(value.submittedAt))||!same(value.processing,{status:'unread'}))fail('Explicit submission identity and unread processing required');
   }else if(!same(value.processing,previous?.processing)||!same(value.submissionId,previous?.submissionId)||!same(value.submittedAt,previous?.submittedAt))fail('Draft cannot change submission metadata');
  }
  if(same(payload.decisions,old.decisions))return structuredClone(old);
  const next={schemaVersion:1,revision:old.revision+1,decisions:structuredClone(payload.decisions)};
  const path=state.index.decisionsPath;
  const receipt=await transport.writeRecords([{path,value:next}],{expectedCommit:state.commit,message:'Save design review answer',signal});
  const reopened=await transport.readRecordAtCommit(path,receipt.commit,{signal});
  const actual=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(reopened.bytes));
  if(!same(actual,next))fail('Save receipt could not be verified; keep your draft and reload',503);
  return actual;
 }};
}
