const JOIN_CODE = "ajyydz";
const POLL_MS = 2000;
const ENDPOINTS = [
  `https://frontend.cfx-services.net/api/servers/single/${JOIN_CODE}`
];

const $ = s => document.querySelector(s);
const onlineEl = $("#online"), playersEl = $("#players"), searchEl = $("#search");
const updatedEl = $("#updated"), errorEl = $("#error"), refreshBtn = $("#refresh");
let allPlayers = [], loading = false;

function normalizePlayers(data){
  const d = data?.Data || data?.data || data || {};
  const list = d.players || d.Players || [];
  return Array.isArray(list) ? list.map(p => ({
    id: p.id ?? p.serverId ?? p.server_id ?? "?",
    name: p.name ?? p.playerName ?? "Unknown",
    ping: p.ping ?? "?"
  })) : [];
}
function escapeHtml(v){return v.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));}
function render(){
  const q=searchEl.value.trim().toLowerCase();
  const filtered=allPlayers.filter(p=>String(p.id).toLowerCase().includes(q)||String(p.name).toLowerCase().includes(q));
  playersEl.innerHTML=filtered.length?filtered.map(p=>`<div class="player"><span class="id">#${escapeHtml(String(p.id))}</span><span class="name">${escapeHtml(String(p.name))}</span><span class="ping">${escapeHtml(String(p.ping))} ms</span></div>`).join(""):'<div class="empty">Niciun jucător găsit.</div>';
}
async function fetchLive(){
  if(loading)return; loading=true;
  try{
    const res=await fetch(ENDPOINTS[0],{cache:"no-store"});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const json=await res.json(), data=json?.Data||json?.data||json||{};
    allPlayers=normalizePlayers(json);
    onlineEl.textContent=data.clients??data.Clients??allPlayers.length;
    updatedEl.textContent="Actualizat: "+new Date().toLocaleTimeString("ro-RO");
    errorEl.classList.add("hidden"); render();
  }catch(err){
    console.error(err);
    errorEl.textContent="Endpoint-ul Cfx.re nu poate fi citit direct din acest browser. Următorul pas este proxy server-side.";
    errorEl.classList.remove("hidden");
  }finally{loading=false}
}
searchEl.addEventListener("input",render);
refreshBtn.addEventListener("click",fetchLive);
fetchLive(); setInterval(fetchLive,POLL_MS);