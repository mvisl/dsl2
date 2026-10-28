/** Browser-native sealed gzip/USTAR reader. Session memory only; no eval or disk writes. */
const text=new TextDecoder('utf-8',{fatal:true});
const field=(header,start,length)=>text.decode(header.subarray(start,start+length)).replace(/\0.*$/s,'');
const octal=value=>{const trimmed=value.replace(/\0.*$/s,'').trim();if(!/^[0-7]+$/.test(trimmed))throw Error('Invalid archive number');const n=parseInt(trimmed,8);if(!Number.isSafeInteger(n))throw Error('Archive number exceeds bounds');return n};
function safe(name){if(!name||name.startsWith('/')||/[\\%?#\x00-\x1f]/.test(name)||name.split('/').some(v=>!v||v==='.'||v==='..'))throw Error('Unsafe archive member');return name}
export async function verifySealedBytes(bytes,seal,{crypto=globalThis.crypto}={}){
 if(!(bytes instanceof Uint8Array)||!Number.isSafeInteger(seal?.bytes)||bytes.length!==seal.bytes||!/^[a-f0-9]{64}$/.test(seal.sha256))throw Error('Invalid sealed file size or identity');
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');if(hash!==seal.sha256)throw Error('Sealed file checksum mismatch');return bytes;
}
export async function readSealedTarGzip(bytes,{seal,members,maxExpandedBytes=16000000,crypto=globalThis.crypto,onProgress=()=>{}}={}){
 await verifySealedBytes(bytes,seal,{crypto});
 if(!members||typeof members!=='object'||Array.isArray(members)||Object.keys(members).length>2000||!Number.isSafeInteger(maxExpandedBytes)||maxExpandedBytes<1024||maxExpandedBytes>256000000)throw Error('Bounded archive manifest required');
 const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader(),chunks=[];let total=0;
 try{for(;;){const{done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>maxExpandedBytes)throw Error('Expanded archive exceeds bounds');chunks.push(value)}}catch(error){await reader.cancel().catch(()=>{});throw error}
 const raw=new Uint8Array(total);let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.length}
 const result=new Map();offset=0;let ended=false;
 while(offset+512<=raw.length){
  const header=raw.subarray(offset,offset+512);
  if(header.every(v=>v===0)){if(raw.subarray(offset).some(v=>v!==0))throw Error('Data after archive end');ended=true;break}
  let checksum=0;for(let i=0;i<512;i++)checksum+=i>=148&&i<156?32:header[i];
  if(checksum!==octal(field(header,148,8))||field(header,257,6)!=='ustar'||!['0',''].includes(field(header,156,1)))throw Error('Only checked regular USTAR members are allowed');
  const prefix=field(header,345,155),name=safe((prefix?prefix+'/':'')+field(header,0,100)),length=octal(field(header,124,12));
  if(result.has(name)||!Object.hasOwn(members,name)||length>maxExpandedBytes||offset+512+length>raw.length)throw Error('Unexpected, duplicate or truncated archive member');
  const data=raw.slice(offset+512,offset+512+length);await verifySealedBytes(data,members[name],{crypto});result.set(name,data);onProgress({completed:result.size,total:Object.keys(members).length});
  offset+=512+Math.ceil(length/512)*512;
 }
 if(!ended||result.size!==Object.keys(members).length)throw Error('Incomplete sealed archive');return result;
}
