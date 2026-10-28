import{readSealedTarGzip,verifySealedBytes}from'./sealed-tar.js?v=sealed-resources-20261028';
import{createGitHubSession}from'./auth-session.js?v=github-tab-20261028';
const session=createGitHubSession({bridgeOrigin:'https://design-workspace-github-auth.mvisl1.workers.dev'});
const login=document.querySelector('#login'),logout=document.querySelector('#logout'),status=document.querySelector('#status'),resources=document.querySelector('#resources');
let privateFiles=null,resourceEpoch=0,requestController=null;
login.onclick=async()=>{
 login.disabled=true;status.textContent='Завершаем вход через GitHub…';
 try{
  const identity=await session.login(),repository=session.repository();
  const response=await fetch('https://api.github.com/repositories/'+repository.id,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+session.getToken(),'X-GitHub-Api-Version':'2022-11-28'},redirect:'error',cache:'no-store'});
  if(!response.ok)throw Error('Не удалось подтвердить доступ к приватному репозиторию.');
  const actual=await response.json();if(actual.id!==repository.id||actual.private!==true||actual.permissions?.pull!==true)throw Error('Приватный доступ не подтверждён.');
  status.textContent='Вход выполнен: '+identity.user.login+'. Приватный репозиторий доступен'+(identity.canWrite?', запись разрешена.':', только чтение.');
  login.hidden=true;logout.hidden=false;resources.hidden=false;
 }catch(error){session.logout();status.textContent=error.message||'Вход не завершён. Можно повторить.'}finally{login.disabled=false}
};
logout.onclick=()=>{resourceEpoch++;requestController?.abort();privateFiles?.clear();privateFiles=null;session.logout();login.hidden=false;logout.hidden=true;resources.hidden=true;status.textContent='Вы вышли из рабочего стола. Приватные данные и токен в этой вкладке очищены.'};

resources.onclick=async()=>{
 const epoch=++resourceEpoch;requestController?.abort();requestController=new AbortController();const signal=requestController.signal;resources.disabled=true;status.textContent='Проверяем приватные экраны из GitHub…';
 try{
  const load=async(name,seal)=>{const token=session.getToken();if(!token)throw Error('Войдите через GitHub повторно.');const r=await fetch('https://design-workspace-github-auth.mvisl1.workers.dev/assets/'+name,{headers:{Authorization:'Bearer '+token},cache:'no-store',redirect:'error',signal});if(!r.ok)throw Error('Приватные ресурсы недоступны: '+r.status);const bytes=new Uint8Array(await r.arrayBuffer());await verifySealedBytes(bytes,seal);return bytes};
  const manifest=JSON.parse(new TextDecoder().decode(await load('selected-native-manifest',{bytes:885879,sha256:'55f8f28c6523abf25750ffec88828ac73fd68a0ec919610f5ef21fa731cf1647'})));
  if(manifest.kind!=='private-selected-profile-runtime')throw Error('Неизвестный пакет экранов.');
  const files=await readSealedTarGzip(await load('selected-native',manifest.archive),{seal:manifest.archive,members:manifest.members,maxExpandedBytes:128000000});
  if(epoch!==resourceEpoch||!session.identity()){files.clear();return}privateFiles?.clear();privateFiles=files;
  status.textContent='GitHub-вход работает. Проверено '+Object.keys(manifest.profiles).length+' исходных профиля и '+files.size+' файлов. Полный конструктор ещё переносится.';
 }catch(error){if(epoch===resourceEpoch)status.textContent=error.message||'Проверка не завершена.'}finally{if(epoch===resourceEpoch)resources.disabled=false}
};
