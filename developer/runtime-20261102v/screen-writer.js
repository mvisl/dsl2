/** Append immutable native variants in a new store; original imports stay untouched. */
import{validateNativeRecipe}from'./native-recipe-validator.js';
import{validateCopyProvenance}from'./copy-provenance.js';
const CREATED='design-workspace/records/screens-created.json',INDEX='design-workspace/records/index.json';
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const canonical=v=>Array.isArray(v)?v.map(canonical):plain(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status,writer:true})};
/** Fixed, secret-free Save diagnostics: the stage that failed and a reason class. Never a message, path,
 * stack or content. writeOutcome: not_started before the record write is called; unknown from that call on,
 * including any exception it raises (the ref update may have applied and only its response been lost);
 * confirmed only once the write returned its receipt. unknown never claims that nothing was written. */
export const WRITE_OUTCOMES=Object.freeze(['not_started','unknown','confirmed']);
export const SAVE_STAGES=Object.freeze(['snapshot','authority','validation','commit']);
export const SAVE_REASONS=Object.freeze(['rejected','conflict','inconsistent','status-401','status-403','status-404','status-409','status-422','status-429','status-5xx','status-other','network','aborted','malformed','exception']);
export function saveReason(error){
 if(error?.name==='AbortError')return'aborted';
 if(error?.writer===true)return error.status===409?'conflict':error.status>=500?'inconsistent':'rejected';
 if(error?.code==='network')return'network';
 const status=error?.status;
 if(Number.isInteger(status))return[401,403,404,409,422,429].includes(status)?'status-'+status:status>=500&&status<600?'status-5xx':'status-other';
 return error instanceof SyntaxError?'malformed':'exception';
}
function diagnosed(error,stage,writeOutcome){
 const diagnostic=Object.freeze({stage,reason:saveReason(error),writeOutcome});
 try{Object.defineProperty(error,'saveDiagnostic',{value:diagnostic,enumerable:false,configurable:true});return error}
 catch{return Object.assign(Error('Variant save failed'),{status:error?.status,saveDiagnostic:diagnostic})}
}
async function digest(value){const bytes=new TextEncoder().encode(value);return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('')}
export function createScreenWriter({reader,transport,canWrite=()=>false,authorityFor,validateOtherRecipe,uuid=()=>crypto.randomUUID(),now=()=>new Date().toISOString()}={}){
 if(typeof reader?.snapshot!=='function'||typeof transport?.writeRecords!=='function'||typeof authorityFor!=='function')throw Error('Native screen writer dependencies required');
 // mark(stage) records the current Save stage: authority read/load, then validation of its result.
 async function validateSource(value,{signal,mark=()=>{}}={}){
  if(value?.context?.nativeProfile){mark('authority');const authority=await authorityFor(value,{signal});mark('validation');let recipe;try{recipe=validateNativeRecipe(value,authority)}catch(error){fail(error.message)}const entry=authority.profiles[recipe.context.nativeProfile].entry;return{recipe,sourceURL:'https://www.figma.com/design/'+entry.fileKey+'/?node-id='+entry.nodeId.replace(':','-')}}
  if(typeof validateOtherRecipe!=='function')fail('This source has no connected Save validator');
  // The other-source validator loads its runtime and validates in one call; it marks its own validation errors.
  mark('authority');let result;try{result=await validateOtherRecipe(structuredClone(value),{signal})}catch(error){if(error?.saveStage==='validation')mark('validation');throw error}
  mark('validation');if(!plain(result.recipe)||!same(result.recipe,value))fail('Source validation changed the proposed recipe; keep your draft');return result;
 }
 return {async save(payload,{signal}={}){
  let stage='validation',writeOutcome='not_started';const mark=next=>{stage=next};
  try{return await saveStages(payload,{signal,mark,write:outcome=>{writeOutcome=outcome}})}catch(error){throw diagnosed(error,stage,writeOutcome)}
 }};
 async function saveStages(payload,{signal,mark,write}){
  if(!await canWrite())fail('This GitHub session cannot save variants',403);
  if(!plain(payload)||Object.keys(payload).some(k=>!['idempotencyKey','expectedRevision','title','parentScreenId','sourceRefs','recipe'].includes(k))||!Number.isSafeInteger(payload.expectedRevision)||payload.expectedRevision<0||typeof payload.idempotencyKey!=='string'||!/^[-\w]{1,100}$/.test(payload.idempotencyKey)||typeof payload.title!=='string'||!payload.title.trim()||Array.from(payload.title).length>100||/[\x00-\x1f\x7f]/.test(payload.title)||new TextEncoder().encode(JSON.stringify(payload)).length>500000)fail('Invalid native variant document');
  mark('snapshot');const state=await reader.snapshot({signal}),key=await digest(payload.idempotencyKey),fingerprint=await digest(JSON.stringify(canonical(payload))),prior=state.screenStore.creationReceipts[key];
  if(prior){if(prior.fingerprint!==fingerprint)fail('Idempotency key already used for another variant',409);const screen=state.screenStore.screens.find(s=>s.id===prior.screenId);if(!screen)fail('Original variant receipt is unavailable',503);return{revision:prior.revision,screen:structuredClone(screen)}}
  if(payload.expectedRevision!==state.screenStore.revision)fail('Screen library changed. Reload before saving; your draft is unchanged.',409);
  if(state.screenStore.screens.length>=2000)fail('Screen library capacity reached');
  mark('validation');let parent=null;if(payload.parentScreenId!==undefined){if(typeof payload.parentScreenId!=='string'||!/^[-\w:;.]{1,100}$/.test(payload.parentScreenId))fail('Invalid parent identity');parent=state.screenStore.screens.find(s=>s.id===payload.parentScreenId);if(!parent)fail('Parent screen is unavailable')}
  const{recipe,sourceURL,componentStudy}=await validateSource(payload.recipe,{signal,mark});
  const newStudy=recipe.schemaVersion===1&&!parent;
  if(newStudy&&(!plain(componentStudy)||componentStudy.schemaVersion!==1||componentStudy.kind!=='verified-component-stack'||!Array.isArray(componentStudy.sourceRefs)||!componentStudy.sourceRefs.length||!recipe.items?.length))fail('A new component study requires verified component source authority');
  try{await validateCopyProvenance(recipe,[...state.screenStore.screens,...(state.archivedScreens||[]).map(x=>x.record)],{validateSource:r=>validateSource(r,{signal,mark})})}catch(error){fail(error.message)}
  if(parent&&(!same(parent.recipe.context,recipe.context)||parent.recipe.screenType!==recipe.screenType||parent.recipe.generation!==recipe.generation))fail('Variant must preserve its parent source context');
  let refs=payload.sourceRefs??parent?.sourceRefs??(newStudy?componentStudy.sourceRefs:[{label:'Native '+recipe.generation+' source',url:sourceURL}]);
  if(!Array.isArray(refs)||refs.length>20||refs.some(r=>!plain(r)||Object.keys(r).some(k=>!['label','url'].includes(k))||typeof r.label!=='string'||r.label.length>200||typeof r.url!=='string'||r.url.length>2000))fail('Invalid source references');
  if(!parent&&(newStudy?!same(refs,componentStudy.sourceRefs):!refs.length||refs.some(r=>r.url!==sourceURL))||parent&&!same(refs,parent.sourceRefs))fail('Source references must preserve the exact native source');
  const screen={id:uuid(),title:payload.title.trim(),status:parent?'variant':'draft',readOnly:true,parentScreenId:parent?.id??null,sourceRefs:structuredClone(refs),recipe,updatedAt:now()};
  const index=structuredClone(state.index),revision=state.screenStore.revision+1;index.revision=revision;
  let created={schemaVersion:1,revision:0,screens:[],creationReceipts:{}};
  const existing=index.screenSources.find(s=>s.path===CREATED);
  // Reading the created store at the snapshot commit belongs to the snapshot stage.
  if(existing){mark('snapshot');if(existing.includeIds!==null)fail('Created variant store needs explicit reconciliation',503);const file=await transport.readRecordAtCommit(CREATED,state.commit,{signal});created=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(file.bytes));if(created.schemaVersion!==1||!Array.isArray(created.screens)||!plain(created.creationReceipts))fail('Created variant store unavailable',503)}else index.screenSources.push({path:CREATED,includeIds:null});
  created.revision=revision;created.screens.push(screen);created.creationReceipts[key]={fingerprint,screenId:screen.id,revision};
  mark('commit');write('unknown');const receipt=await transport.writeRecords([{path:CREATED,value:created},{path:INDEX,value:index}],{expectedCommit:state.commit,message:newStudy?'Save immutable component study':'Save immutable native screen variant',signal});if(typeof receipt?.commit==='string'&&/^[a-f0-9]{40}$/.test(receipt.commit))write('confirmed');
  for(const[path,expected]of [[CREATED,created],[INDEX,index]]){const file=await transport.readRecordAtCommit(path,receipt.commit,{signal});if(!same(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(file.bytes)),expected))fail('Variant save could not be verified; retry the original operation',503)}
  return{revision,screen};
 }
}
