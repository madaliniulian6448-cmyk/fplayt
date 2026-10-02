const POLL_MS = 4000;
const API = "https://serverloop.dev/api/v1/servers/fplayt-romania-ajyydz/players";

const $ = s => document.querySelector(s);
const onlineEl=$("#online"), playersEl=$("#players"), searchEl=$("#search");
const updatedEl=$("#updated"), errorEl=$("#error"), refreshBtn=$("#refresh");
let allPlayers=[], loading=false;

function escapeHtml(v){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
function normalize(json){
  const d=json?.data ?? json;
  const list=Array.isArray(d) ? d : (d?.players ?? d?.roster ?? []);
  return Array.isArray(list) ? list.map(p=>({
    id:p.slot ?? p.id ?? p.serverId ?? "?",
    name:p.name ?? p.displayName ?? "Unknown",
    ping:p.ping ?? "?"
  })) : [];
}
function render(){
  const q=searchEl.value.trim().toLowerCase();
  const filtered=allPlayers.filter(p=>String(p.id).toLowerCase().includes(q)||String(p.name).toLowerCase().includes(q));
  playersEl.innerHTML=filtered.length ? filtered.map(p=>`
    <div class="player">
      <span class="id">#${escapeHtml(p.id)}</span>
      <span class="name">${escapeHtml(p.name)}</span>
      <span class="ping">${escapeHtml(p.ping)} ms</span>
    </div>`).join("") : '<div class="empty">Niciun jucător găsit.</div>';
}
async function fetchLive(){
  if(loading)return;
  loading=true;
  try{
    const res=await fetch(API,{cache:"no-store",headers:{"Accept":"application/json"}});
    if(!res.ok) throw new Error("HTTP "+res.status);
    const json=await res.json();
    allPlayers=normalize(json);
    onlineEl.textContent=json?.meta?.count ?? json?.data?.count ?? allPlayers.length;
    updatedEl.textContent="Actualizat: "+new Date().toLocaleTimeString("ro-RO")+" · la 4 secunde";
    errorEl.classList.add("hidden");
    render();
  }catch(err){
    console.error(err);
    errorEl.textContent="API-ul live nu a răspuns ("+err.message+"). Se reîncearcă automat.";
    errorEl.classList.remove("hidden");
  }finally{loading=false;}
}
searchEl.addEventListener("input",render);
refreshBtn.addEventListener("click",fetchLive);
fetchLive();
setInterval(fetchLive,POLL_MS);