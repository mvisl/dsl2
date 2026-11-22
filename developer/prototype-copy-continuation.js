/** Same-tab hints contain no draft content and confer no access. */
const KEY='dsl2-prototype-copy-continuation-v1',DRAFT='dsl2-nested-working-copy:',MAX_AGE_MS=15*60*1000;
const tokenPattern=/^[A-Za-z0-9-]{1,100}$/,valuePattern=/^[-\w:;.]{1,160}$/;
const ALLOWED=new Set(['screen','workingCopy','profile','optionsSheet','nativeTrades','f1Trades','map','view','depositContext','_mount']);
function target(search,{allowCopy=false}={}){
 const q=new URLSearchParams(search);if([...q.keys()].some(k=>!ALLOWED.has(k)||q.getAll(k).length!==1))return null;
 if(q.has('workingCopy')&&!allowCopy||q.has('record')||q.getAll('screen').length!==1)return null;
 for(const [k,v] of q)if(k!=='_mount'&&k!=='workingCopy'&&!valuePattern.test(v))return null;
 if(q.has('depositContext')&&!['current28','historical11'].includes(q.get('depositContext')))return null;
 q.delete('_mount');q.delete('workingCopy');q.sort();return q.toString();
}
function readLocal(storage,token,screen){
 if(typeof token!=='string'||!tokenPattern.test(token)||!valuePattern.test(screen))return false;
 try{const raw=storage.getItem(DRAFT+token);if(raw===null)return false;const data=JSON.parse(raw);return !!data&&data.workingCopyId===token&&data.recipe?.screenType===screen}catch{return false}
}
export function shouldResumePrototypeCopy(requested,values){return Boolean(requested)&&values.length===1&&values[0]==='1'}
export function stagePrototypeCopy({search,local,session,now=Date.now()}){
 try{session.removeItem(KEY)}catch{return false}
 const q=new URLSearchParams(search),identity=target(search,{allowCopy:true}),tokens=q.getAll('workingCopy'),screen=q.get('screen');
 if(identity===null||tokens.length!==1||!readLocal(local,tokens[0],screen)||!Number.isSafeInteger(now))return false;
 try{session.setItem(KEY,JSON.stringify({version:1,target:identity,token:tokens[0],createdAt:now}));return true}catch{return false}
}
/** Only the exact same-tab target may consume a fresh hint; missing local data never substitutes a source. */
export function consumePrototypeCopy({search,local,session,now=Date.now()}){
 let raw;try{raw=session.getItem(KEY);session.removeItem(KEY)}catch{return null}if(!raw)return null;
 try{const v=JSON.parse(raw),identity=target(search),screen=new URLSearchParams(search).get('screen');if(identity===null||v?.version!==1||v.target!==identity||!Number.isSafeInteger(now)||!Number.isSafeInteger(v.createdAt)||v.createdAt>now||now-v.createdAt>MAX_AGE_MS||!readLocal(local,v.token,screen))return null;return v.token}catch{return null}
}
