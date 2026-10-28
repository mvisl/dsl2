import{sourceEntryTarget}from'./entry-target.js';
const scope=new URL('./',import.meta.url),target=sourceEntryTarget(location.href,scope),link=document.getElementById('workspace-entry');
const entry=new URL('workspace-preview.html',scope);if(target)entry.searchParams.set('returnTo',target.returnPath);link.href=entry.href;
