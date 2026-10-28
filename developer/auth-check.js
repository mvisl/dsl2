import{createGitHubSession}from'./auth-session.js?v=github-tab-20261028';
const session=createGitHubSession({bridgeOrigin:'https://design-workspace-github-auth.mvisl1.workers.dev'});
const login=document.querySelector('#login'),logout=document.querySelector('#logout'),status=document.querySelector('#status');
login.onclick=async()=>{
 login.disabled=true;status.textContent='Завершаем вход через GitHub…';
 try{
  const identity=await session.login(),repository=session.repository();
  const response=await fetch('https://api.github.com/repositories/'+repository.id,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+session.getToken(),'X-GitHub-Api-Version':'2022-11-28'},redirect:'error',cache:'no-store'});
  if(!response.ok)throw Error('Не удалось подтвердить доступ к приватному репозиторию.');
  const actual=await response.json();if(actual.id!==repository.id||actual.private!==true||actual.permissions?.pull!==true)throw Error('Приватный доступ не подтверждён.');
  status.textContent='Вход выполнен: '+identity.user.login+'. Приватный репозиторий доступен'+(identity.canWrite?', запись разрешена.':', только чтение.');
  login.hidden=true;logout.hidden=false;
 }catch(error){session.logout();status.textContent=error.message||'Вход не завершён. Можно повторить.'}finally{login.disabled=false}
};
logout.onclick=()=>{session.logout();login.hidden=false;logout.hidden=true;status.textContent='Вы вышли из рабочего стола. Приватные данные и токен в этой вкладке очищены.'};
