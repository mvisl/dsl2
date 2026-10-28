/** Session-backed private resources. No persistent cache, token or public raw URLs. */
const TYPES={txt:'text/plain; charset=utf-8',html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json; charset=utf-8',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf',ico:'image/x-icon'};
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
export function createPrivateResources({origin,mountPath,transport}={}){
 if(new URL(origin).origin!==origin||!/^\/(?:[-\w]+\/)+$/.test(mountPath))throw Error('Exact origin and private mount required');
 if(typeof transport?.readSource!=='function')throw Error('Pinned repository transport required');
 let closed=false;const pending=new Map();
 return {
  close(){closed=true;pending.clear()},
  async respond(request){
   if(closed)return new Response('GitHub sign-in required',{status:401,headers});
   const url=new URL(request.url);
   if(url.origin!==origin||!url.pathname.startsWith(mountPath))return null;
   if(!['GET','HEAD'].includes(request.method))return new Response('Resource is read only',{status:405,headers});
   if(/%2f|%5c/i.test(url.pathname))return new Response('Invalid resource path',{status:400,headers});
   let path;try{path=decodeURIComponent(url.pathname.slice(mountPath.length));}catch{return new Response('Invalid resource path',{status:400,headers})}
   if(!path||path.endsWith('/'))path+='index.html';
   if(!path||/[\\%?#\x00-\x1f]/.test(path)||path.split('/').some(p=>!p||p==='.'||p==='..'))return new Response('Invalid resource path',{status:400,headers});
   if(!path.split('/').at(-1).includes('.'))path+='/index.html';
   const type=TYPES[path.split('.').at(-1).toLowerCase()];
   if(!type)return new Response('Unsupported runtime resource',{status:415,headers});
   // Deduplicate simultaneous imports only. Private bodies are never stored on disk.
   const repositoryPath='review-workspace/'+path;
   let work=pending.get(repositoryPath);
   if(!work){work=transport.readSource(repositoryPath);pending.set(repositoryPath,work)}
   try{
    const file=await work;if(closed)return new Response('GitHub sign-in required',{status:401,headers});
    return new Response(request.method==='HEAD'?null:file.bytes,{headers:{...headers,'Content-Type':type}});
   }catch(error){return new Response(error?.status===404?'Private resource unavailable':'Private resource could not be loaded',{status:[401,403,404].includes(error?.status)?error.status:502,headers})}
   finally{if(pending.get(repositoryPath)===work)pending.delete(repositoryPath)}
  }
 };
}
