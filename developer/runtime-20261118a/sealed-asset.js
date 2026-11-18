/** Retry one interrupted read; every accepted byte still passes the original seal. */
import{verifySealedBytes}from'./sealed-tar.js';
const wait=signal=>new Promise((resolve,reject)=>{if(signal?.aborted){reject(new DOMException('Aborted','AbortError'));return}const done=()=>{signal?.removeEventListener('abort',abort);resolve()},timer=setTimeout(done,250),abort=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);reject(new DOMException('Aborted','AbortError'))};signal?.addEventListener('abort',abort,{once:true})});
async function readOne({load,seal,signal,onRetry=()=>{},onAttempt=()=>{},pause=wait}={}){
 if(typeof load!=='function'||!Number.isSafeInteger(seal?.bytes)||seal.bytes<1||seal.bytes>16000000||!/^[a-f0-9]{64}$/.test(seal.sha256))throw Error('Bounded sealed asset required');
 for(let attempt=0;attempt<2;attempt++){
  if(signal?.aborted)throw new DOMException('Aborted','AbortError');onAttempt(attempt+1);let bytes;
  try{const response=await load();bytes=new Uint8Array(await response.arrayBuffer())}catch(error){if(attempt||signal?.aborted||error?.name==='AbortError'||!(error?.name==='TypeError'||[429,502,503,504].includes(error?.status)))throw error;onRetry();await pause(signal);continue}
  if(bytes.length<seal.bytes&&!attempt){onRetry();await pause(signal);continue}
  await verifySealedBytes(bytes,seal);return bytes;
 }
 throw Error('Private asset read did not finish');
}

/** Each optional range and the final assembled archive retain independent seals. */
export async function readSealedAsset({load,seal,signal,onRetry=()=>{},onAttempt=()=>{},onBytes=()=>{},pause=wait}={}){
 if(typeof load!=='function')throw Error('Explicit asset loader required');
 if(!seal?.parts){const bytes=await readOne({load:()=>load(undefined,signal),seal,signal,onRetry,onAttempt,pause});onBytes(bytes.length);return bytes}
 if(typeof load!=='function'||!Number.isSafeInteger(seal.bytes)||seal.bytes<1||seal.bytes>16000000||!/^[a-f0-9]{64}$/.test(seal.sha256)||!Array.isArray(seal.parts)||!seal.parts.length||seal.parts.length>64)throw Error('Bounded sealed parts required');
 let offset=0;for(const[ index,part]of seal.parts.entries()){if(part.index!==index||part.offset!==offset||!Number.isSafeInteger(part.bytes)||part.bytes<1||part.bytes>524288||!/^[a-f0-9]{64}$/.test(part.sha256))throw Error('Exact contiguous sealed parts required');offset+=part.bytes}if(offset!==seal.bytes)throw Error('Complete sealed archive coverage required');
 const controller=new AbortController(),abort=()=>controller.abort(),bytes=new Uint8Array(seal.bytes);if(signal?.aborted)controller.abort();signal?.addEventListener('abort',abort,{once:true});let next=0,received=0;
 async function worker(){while(next<seal.parts.length&&!controller.signal.aborted){const index=next++,part=seal.parts[index];try{const raw=await readOne({load:()=>load(index,controller.signal),seal:part,signal:controller.signal,onRetry:()=>onRetry(index),onAttempt:attempt=>onAttempt(attempt,index),pause});bytes.set(raw,part.offset);received+=raw.length;onBytes(received)}catch(error){controller.abort();throw error}}}
 try{await Promise.all([worker(),worker()]);if(controller.signal.aborted)throw new DOMException('Aborted','AbortError');await verifySealedBytes(bytes,seal);return bytes}finally{signal?.removeEventListener('abort',abort)}
}
