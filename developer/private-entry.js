import{sourceEntryTarget}from'./entry-target.js';
import{stagePrototypeCopy}from'./prototype-copy-continuation.js';
const scope=new URL('./',import.meta.url),target=sourceEntryTarget(location.href,scope),link=document.getElementById('workspace-entry');
const entry=new URL('workspace-preview.html',scope);if(target)entry.searchParams.set('returnTo',target.returnPath);
try{if(target?.returnPath.startsWith('private/prototype/')&&stagePrototypeCopy({search:location.search,local:localStorage,session:sessionStorage})){entry.searchParams.set('resumeCopy','1');const notice=document.querySelector('p');if(notice)notice.textContent='После входа откроется локальный черновик на этом устройстве.'}}catch{/* Existing source-only entry remains available. */}
link.href=entry.href;
