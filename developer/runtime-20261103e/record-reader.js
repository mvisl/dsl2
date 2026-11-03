/** Consistent private records at one Git commit; preserves legacy identities/context. */
const PREFIX='design-workspace/records/';
function path(value){if(typeof value!=='string'||!value.startsWith(PREFIX)||!value.endsWith('.json')||/[\\%?#]/.test(value)||value.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('Invalid record reference');return value}
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
export function createRecordReader({transport,indexPath=PREFIX+'index.json'}={}){
 let cached=null;
 path(indexPath);if(typeof transport?.readDataHead!=='function'||typeof transport?.readRecordAtCommit!=='function')throw Error('Pinned record transport required');
 let activeDocuments=0;const documentQueue=[];
 function pumpDocuments(){while(activeDocuments<3&&documentQueue.length){const item=documentQueue.shift();activeDocuments++;(async()=>{try{const file=await transport.readRecordAtCommit(item.path,item.commit,{signal:item.signal});item.resolve(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(file.bytes)))}catch(error){item.reject(error)}finally{activeDocuments--;pumpDocuments()}})()}}
 function document(pathName,commit,signal){const name=path(pathName);return new Promise((resolve,reject)=>{documentQueue.push({path:name,commit,signal,resolve,reject});pumpDocuments()})}
 return {async snapshot({signal}={}){
  const commit=await transport.readDataHead({signal});if(cached?.commit===commit)return structuredClone(cached);
  const index=await document(indexPath,commit,signal);
  if(index.schemaVersion!==1||!Number.isSafeInteger(index.revision)||index.revision<0||!Array.isArray(index.screenSources)||!index.screenSources.length||index.screenSources.length>10||typeof index.decisionsPath!=='string')throw Error('Invalid workspace index');
  // Independent indexed documents belong to this exact head. Fetch at most three
  // together; all existing identity/schema checks still complete before caching.
  const required=[...new Set([...index.screenSources.map(source=>{
   if(!source||typeof source.path!=='string'||source.includeIds!==null&&(!Array.isArray(source.includeIds)||source.includeIds.some(id=>typeof id!=='string')||new Set(source.includeIds).size!==source.includeIds.length))throw Error('Invalid screen selection');
   return path(source.path);
  }),path(index.decisionsPath),...(index.inboxPath===undefined?[]:[path(index.inboxPath)]),...(index.attachmentsPath===undefined?[]:[path(index.attachmentsPath)])])];
  const documents=new Map();let nextDocument=0,failed=false;
  async function loadDocuments(){while(!failed&&nextDocument<required.length){const name=required[nextDocument++];try{documents.set(name,await document(name,commit,signal))}catch(error){failed=true;throw error}}}
  await Promise.all(Array.from({length:Math.min(3,required.length)},loadDocuments));
  const readDocument=name=>documents.has(name)?documents.get(name):document(name,commit,signal);
  const screens=[],seen=new Map(),receipts={};
  for(const source of index.screenSources){
   if(!source||typeof source.path!=='string'||source.includeIds!==null&&(!Array.isArray(source.includeIds)||source.includeIds.some(id=>typeof id!=='string')||new Set(source.includeIds).size!==source.includeIds.length))throw Error('Invalid screen selection');
   const store=await readDocument(source.path);
   if(store.schemaVersion!==1||!Number.isSafeInteger(store.revision)||!Array.isArray(store.screens)||typeof store.creationReceipts!=='object'||!store.creationReceipts||Array.isArray(store.creationReceipts))throw Error('Invalid source screen registry');
   const wanted=source.includeIds===null?null:new Set(source.includeIds),sourceIds=new Set();
   for(const record of store.screens){
    if(!record||typeof record.id!=='string'||!record.id||sourceIds.has(record.id)||!record.recipe||typeof record.recipe!=='object')throw Error('Invalid source screen identity');
    sourceIds.add(record.id);if(wanted&&!wanted.has(record.id))continue;
    if(seen.has(record.id))throw Error('Duplicate screen identity; select one unchanged source');
    seen.set(record.id,record);screens.push(record);
   }
   if(wanted&&[...wanted].some(id=>!sourceIds.has(id)))throw Error('Selected source screen is missing');
   for(const[key,receipt]of Object.entries(store.creationReceipts)){
    if(!receipt||typeof receipt.screenId!=='string'||!sourceIds.has(receipt.screenId))throw Error('Broken creation receipt');
    if(wanted&&!wanted.has(receipt.screenId))continue;
    if(Object.hasOwn(receipts,key))throw Error('Duplicate creation receipt; explicit reconciliation required');
    receipts[key]=receipt;
   }
  }
  for(const record of screens)if(record.parentScreenId&&!seen.has(record.parentScreenId))throw Error('Parent screen missing from workspace');
  const archivedScreens=[];
  if(index.presentationDuplicates!==undefined){
   if(!Array.isArray(index.presentationDuplicates)||index.presentationDuplicates.length>2000)throw Error('Invalid duplicate presentation index');
   const archivedIds=new Set();
   for(const duplicate of index.presentationDuplicates){
    if(!duplicate||typeof duplicate.id!=='string'||seen.has(duplicate.id)||archivedIds.has(duplicate.id)||!seen.has(duplicate.canonicalPresentationId))throw Error('Invalid preserved duplicate identity');
    const original=await readDocument(duplicate.sourcePath);
    if(!Array.isArray(original.screens))throw Error('Invalid duplicate source');
    const matches=original.screens.filter(record=>record.id===duplicate.id),target=seen.get(duplicate.canonicalPresentationId);
    if(matches.length!==1||!same(matches[0].recipe,target.recipe)||!same(matches[0].sourceRefs,target.sourceRefs))throw Error('Duplicate presentation must preserve exact recipe and sources');
    archivedIds.add(duplicate.id);archivedScreens.push({record:matches[0],canonicalPresentationId:duplicate.canonicalPresentationId});
   }
  }
  const decisions=await readDocument(index.decisionsPath);
  if(decisions.schemaVersion!==1||!Number.isSafeInteger(decisions.revision)||decisions.revision<0||!decisions.decisions||typeof decisions.decisions!=='object'||Array.isArray(decisions.decisions))throw Error('Invalid design decisions');
  let inboxStore,attachmentsStore;
  if(index.inboxPath!==undefined){
   inboxStore=await readDocument(index.inboxPath);
   if(inboxStore?.schemaVersion!==1||!Number.isSafeInteger(inboxStore.revision)||inboxStore.revision<0||!Array.isArray(inboxStore.requests)||inboxStore.requests.length>5000||!inboxStore.operations||typeof inboxStore.operations!=='object'||Array.isArray(inboxStore.operations))throw Error('Invalid preserved Inbox store');
   const ids=new Set();for(const row of inboxStore.requests){if(!row||typeof row.id!=='string'||ids.has(row.id)||!Number.isSafeInteger(row.revision)||row.revision<1||!['new','investigating','needs-design-decision','answered'].includes(row.status)||typeof row.author!=='string'||typeof row.accessScope!=='string'||!Array.isArray(row.messages)||!row.messages.length)throw Error('Invalid preserved Inbox request');ids.add(row.id)}
  }
  if(index.attachmentsPath!==undefined){attachmentsStore=await readDocument(index.attachmentsPath);if(attachmentsStore?.schemaVersion!==1||!Number.isSafeInteger(attachmentsStore.revision)||attachmentsStore.revision<0||!attachmentsStore.attachments||typeof attachmentsStore.attachments!=='object'||Array.isArray(attachmentsStore.attachments)||!attachmentsStore.operations||typeof attachmentsStore.operations!=='object'||Array.isArray(attachmentsStore.operations))throw Error('Invalid preserved attachment store')}
  cached={commit,index,archivedScreens,...(inboxStore?{inboxStore}:{}),...(attachmentsStore?{attachmentsStore}:{}),screenStore:{schemaVersion:1,revision:index.revision,screens,creationReceipts:receipts},decisions};return structuredClone(cached);
 }};
}
