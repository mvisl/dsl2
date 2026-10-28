/** Append immutable native variants in a new store; original imports stay untouched. */
import{validateNativeRecipe}from'./native-recipe-validator.js';
import{validateCopyProvenance}from'./copy-provenance.js';
const CREATED='design-workspace/records/screens-created.json',INDEX='design-workspace/records/index.json';
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const canonical=v=>Array.isArray(v)?v.map(canonical):plain(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
async function digest(value){const bytes=new TextEncoder().encode(value);return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('')}
export function createScreenWriter({reader,transport,canWrite=()=>false,authorityFor,validateOtherRecipe,uuid=()=>crypto.randomUUID(),now=()=>new Date().toISOString()}={}){
 if(typeof reader?.snapshot!=='function'||typeof transport?.writeRecords!=='function'||typeof authorityFor!=='function')throw Error('Native screen writer dependencies required');
 async function validateSource(value,{signal}={}){
  if(value?.context?.nativeProfile){const authority=await authorityFor(value,{signal});let recipe;try{recipe=validateNativeRecipe(value,authority)}catch(error){fail(error.message)}const entry=authority.profiles[recipe.context.nativeProfile].entry;return{recipe,sourceURL:'https://www.figma.com/design/'+entry.fileKey+'/?node-id='+entry.nodeId.replace(':','-')}}
  if(typeof validateOtherRecipe!=='function')fail('This source has no connected Save validator');
  const result=await validateOtherRecipe(structuredClone(value),{signal});if(!plain(result.recipe)||!same(result.recipe,value))fail('Source validation changed the proposed recipe; keep your draft');return result;
 }
 return {async save(payload,{signal}={}){
  if(!await canWrite())fail('This GitHub session cannot save variants',403);
  if(!plain(payload)||Object.keys(payload).some(k=>!['idempotencyKey','expectedRevision','title','parentScreenId','sourceRefs','recipe'].includes(k))||!Number.isSafeInteger(payload.expectedRevision)||payload.expectedRevision<0||typeof payload.idempotencyKey!=='string'||!/^[-\w]{1,100}$/.test(payload.idempotencyKey)||typeof payload.title!=='string'||!payload.title.trim()||Array.from(payload.title).length>100||/[\x00-\x1f\x7f]/.test(payload.title)||new TextEncoder().encode(JSON.stringify(payload)).length>500000)fail('Invalid native variant document');
  const state=await reader.snapshot({signal}),key=await digest(payload.idempotencyKey),fingerprint=await digest(JSON.stringify(canonical(payload))),prior=state.screenStore.creationReceipts[key];
  if(prior){if(prior.fingerprint!==fingerprint)fail('Idempotency key already used for another variant',409);const screen=state.screenStore.screens.find(s=>s.id===prior.screenId);if(!screen)fail('Original variant receipt is unavailable',503);return{revision:prior.revision,screen:structuredClone(screen)}}
  if(payload.expectedRevision!==state.screenStore.revision)fail('Screen library changed. Reload before saving; your draft is unchanged.',409);
  if(state.screenStore.screens.length>=2000)fail('Screen library capacity reached');
  let parent=null;if(payload.parentScreenId!==undefined){if(typeof payload.parentScreenId!=='string'||!/^[-\w:;.]{1,100}$/.test(payload.parentScreenId))fail('Invalid parent identity');parent=state.screenStore.screens.find(s=>s.id===payload.parentScreenId);if(!parent)fail('Parent screen is unavailable')}
  const{recipe,sourceURL}=await validateSource(payload.recipe,{signal});
  if(recipe.schemaVersion===1&&!parent)fail('A component study requires an existing saved parent');
  try{await validateCopyProvenance(recipe,[...state.screenStore.screens,...(state.archivedScreens||[]).map(x=>x.record)],{validateSource:r=>validateSource(r,{signal})})}catch(error){fail(error.message)}
  if(parent&&(!same(parent.recipe.context,recipe.context)||parent.recipe.screenType!==recipe.screenType||parent.recipe.generation!==recipe.generation))fail('Variant must preserve its parent source context');
  let refs=payload.sourceRefs??parent?.sourceRefs??[{label:'Native '+recipe.generation+' source',url:sourceURL}];
  if(!Array.isArray(refs)||refs.length>20||refs.some(r=>!plain(r)||Object.keys(r).some(k=>!['label','url'].includes(k))||typeof r.label!=='string'||r.label.length>200||typeof r.url!=='string'||r.url.length>2000))fail('Invalid source references');
  if(!parent&&(!refs.length||refs.some(r=>r.url!==sourceURL))||parent&&!same(refs,parent.sourceRefs))fail('Source references must preserve the exact native source');
  const screen={id:uuid(),title:payload.title.trim(),status:parent?'variant':'draft',readOnly:true,parentScreenId:parent?.id??null,sourceRefs:structuredClone(refs),recipe,updatedAt:now()};
  const index=structuredClone(state.index),revision=state.screenStore.revision+1;index.revision=revision;
  let created={schemaVersion:1,revision:0,screens:[],creationReceipts:{}};
  const existing=index.screenSources.find(s=>s.path===CREATED);
  if(existing){if(existing.includeIds!==null)fail('Created variant store needs explicit reconciliation',503);const file=await transport.readRecordAtCommit(CREATED,state.commit,{signal});created=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(file.bytes));if(created.schemaVersion!==1||!Array.isArray(created.screens)||!plain(created.creationReceipts))fail('Created variant store unavailable',503)}else index.screenSources.push({path:CREATED,includeIds:null});
  created.revision=revision;created.screens.push(screen);created.creationReceipts[key]={fingerprint,screenId:screen.id,revision};
  const receipt=await transport.writeRecords([{path:CREATED,value:created},{path:INDEX,value:index}],{expectedCommit:state.commit,message:'Save immutable native screen variant',signal});
  for(const[path,expected]of [[CREATED,created],[INDEX,index]]){const file=await transport.readRecordAtCommit(path,receipt.commit,{signal});if(!same(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(file.bytes)),expected))fail('Variant save could not be verified; retry the original operation',503)}
  return{revision,screen};
 }};
}
