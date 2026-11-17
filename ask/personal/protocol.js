/** Neutral browser/server wire contract; contains no credentials or private records. */
export const GUEST_PROOF_SCOPE='dsl2:guest-conversations:v1';
export const guestBase64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
export function publicGuestKey(jwk){
 if(!jwk||jwk.kty!=='EC'||jwk.crv!=='P-256'||!/^[-\w]{43}$/.test(jwk.x||'')||!/^[-\w]{43}$/.test(jwk.y||'')||'d'in jwk)throw Error('Public browser key required');
 return {kty:'EC',crv:'P-256',x:jwk.x,y:jwk.y};
}
export async function guestProofMessage({method,path,body='',timestamp,nonce},crypto=globalThis.crypto){
 if(!['GET','POST'].includes(method)||typeof path!=='string'||!/^\/guest-conversations(?:\/(?:[a-f0-9-]{36}|claim))?$/.test(path)||typeof body!=='string'||body.length>16384||!Number.isSafeInteger(timestamp)||typeof nonce!=='string'||!/^[-\w]{22,64}$/.test(nonce))throw Error('Invalid guest proof context');
 const hash=guestBase64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body)));
 return [GUEST_PROOF_SCOPE,method,path,hash,timestamp,nonce].join('\n');
}
