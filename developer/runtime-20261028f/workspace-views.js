/** Keep constructor and review DOMs alive across mode switches; never store auth. */
export function mountWorkspaceViews({mount,editorFrame,questionsFrame,window:win=globalThis.window,storage=globalThis.localStorage,initialEditorPath='editor/',onMode=()=>{}}={}){
 if(typeof mount?.entryURL!=='function'||!editorFrame||!questionsFrame)throw Error('Private mount and two workspace views required');
 const base=new URL(mount.baseURL),key='dsl2-github:workspace-view',children=new Set();let mode='constructor',editorPath=initialEditorPath,started=new Set();
 function safePath(value){try{const url=new URL(value,base);if(url.origin!==base.origin||url.pathname!==base.pathname+'editor/'&&url.pathname!==base.pathname+'editor/index.html')return null;const query=new URLSearchParams();for(const name of ['screen','workingCopy','profile','optionsSheet']){const values=url.searchParams.getAll(name);if(values.length>1)return null;if(values.length){if(!/^[-\w:;.]{1,160}$/.test(values[0]))return null;query.set(name,values[0])}}return'editor/'+(query.size?'?'+query:'')}catch{return null}}
 const initial=safePath(editorPath);if(!initial)throw Error('Exact editor entry required');editorPath=initial;
 try{const saved=JSON.parse(storage.getItem(key));if(saved?.version===1&&['constructor','questions'].includes(saved.mode)){mode=saved.mode;editorPath=safePath(saved.editorPath)||editorPath}}catch{}
 function persist(){try{storage.setItem(key,JSON.stringify({version:1,mode,editorPath}))}catch{}}
 function start(which){if(started.has(which))return;const frame=which==='constructor'?editorFrame:questionsFrame;frame.src=mount.entryURL(which==='constructor'?editorPath:'index.html');started.add(which)}
 function setMode(next){if(!['constructor','questions'].includes(next))throw Error('Unknown workspace mode');mode=next;start(mode);editorFrame.hidden=mode!=='constructor';questionsFrame.hidden=mode!=='questions';persist();onMode(mode)}
 function ready(){editorFrame.contentWindow?.postMessage({type:'dsl2-workspace-host-ready'},base.origin)}
 async function receive(event){if(event.origin!==base.origin||event.source!==editorFrame.contentWindow)return;const data=event.data;
  if(data?.type==='dsl2-workspace-open-prototype'){
   try{const url=new URL(data.url,base);if(url.origin!==base.origin||url.username||url.password||url.hash||!['prototype/','prototype/index.html'].some(p=>url.pathname===base.pathname+p))return;
    const query=new URLSearchParams(),allowed=new Set(['screen','workingCopy','profile','optionsSheet','nativeTrades','f1Trades','map','view']);
    for(const[key,value]of url.searchParams){if(key==='_mount')continue;if(!allowed.has(key)||query.has(key)||!/^[-\w:;.]{1,160}$/.test(value))return;query.set(key,value)}
    const urlToOpen=await mount.openEntryURL('prototype/'+(query.size?'?'+query:''));const child=win.open(urlToOpen,'_blank');if(child)children.add(child);
   }catch{}return;
  }
  if(data?.type==='dsl2-workspace-switch'&&data.mode==='questions')setMode('questions');
  if(data?.type==='dsl2-workspace-location'){const next=safePath(data.url);if(next){editorPath=next;persist()}}
 }
 editorFrame.addEventListener('load',ready);win.addEventListener('message',receive);setMode(mode);
 return{setMode,getMode:()=>mode,destroy(){editorFrame.removeEventListener('load',ready);win.removeEventListener('message',receive);editorFrame.src='about:blank';questionsFrame.src='about:blank';started.clear();for(const child of children)try{child.close()}catch{}children.clear()}};
}
