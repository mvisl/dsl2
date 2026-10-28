/** Legacy read routes backed by consistent private GitHub snapshots. */
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(value,status=200)=>Response.json(value,{status,headers});
export function createRecordAPI({reader,origin,decisionWriter,resourceCapabilities}={}){
 if(typeof reader?.snapshot!=='function'||new URL(origin).origin!==origin)throw Error('Record reader and exact origin required');
 return async request=>{
  const url=new URL(request.url);if(url.origin!==origin)return null;
  const route=url.pathname;
  if(route==='/api/design/resource-capabilities'){
   if(!['GET','HEAD'].includes(request.method))return json({error:'Read-only capability route'},405);
   if(typeof resourceCapabilities!=='function')return json({error:'Selected native resources are not mounted'},404);
   const capabilities=await resourceCapabilities();
   const value={schemaVersion:1,selectedOptionsProfiles:capabilities?.selectedOptionsProfiles===true};
   return request.method==='HEAD'?new Response(null,{headers:{...headers,'Content-Type':'application/json'}}):json(value);
  }
  if(route!=='/api/screens'&&!route.startsWith('/api/screens/')&&route!=='/api/decisions')return null;
  if(request.method==='POST'&&route==='/api/decisions'&&decisionWriter){
   if(request.headers.get('Content-Type')?.split(';')[0]!=='application/json')return json({error:'JSON answer required',saved:false},415);
   let payload;try{const bytes=await request.arrayBuffer();if(bytes.byteLength>1900000)return json({error:'Answer document is too large',saved:false},413);payload=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}catch{return json({error:'Invalid answer JSON',saved:false},400)}
   try{return json(await decisionWriter.save(payload,{signal:request.signal}))}catch(error){return json({error:[400,403,409].includes(error?.status)?error.message:'GitHub save could not be confirmed. Keep your draft and reload.',saved:false},[400,401,403,409,429].includes(error?.status)?error.status:503)}
  }
  if(!['GET','HEAD'].includes(request.method))return json({error:'GitHub record writes are not connected yet. Keep your draft.',saved:false},501);
  try{
   const state=await reader.snapshot({signal:request.signal});let value;
   if(route==='/api/decisions')value=state.decisions;
   else if(route==='/api/screens')value=state.screenStore;
   else{
    let id;try{id=decodeURIComponent(route.slice('/api/screens/'.length))}catch{return json({error:'Invalid screen identity'},400)}
    if(!id||id.includes('/')||id.includes('\\'))return json({error:'Invalid screen identity'},400);
    const screen=state.screenStore.screens.find(record=>record.id===id)||state.archivedScreens?.find(item=>item.record.id===id)?.record;
    if(!screen)return json({error:'Screen not found'},404);
    value={screen,revision:state.screenStore.revision};
   }
   if(request.method==='HEAD')return new Response(null,{headers:{...headers,'Content-Type':'application/json'}});
   return json(value);
  }catch(error){return json({error:'Private GitHub records unavailable; existing work is unchanged'},[401,403,404,429].includes(error?.status)?error.status:503)}
 };
}
