const JOIN_CODE = "ajyydz";
const POLL_MS = 1000;
const ENDPOINTS = [
  `https://servers-frontend.fivem.net/api/servers/single/${JOIN_CODE}`,
  `https://servers-frontend.fivem.net/api/servers/single/${JOIN_CODE}?locale=ro-RO`
];

const $ = s => document.querySelector(s);
const onlineEl = $("#online");
const playersEl = $("#players");
const searchEl = $("#search");
const updatedEl = $("#updated");
const errorEl = $("#error");
const refreshBtn = $("#refresh");

let allPlayers = [];
let loading = false;

function normalizePlayers(data){
  const d = data?.Data || data?.data || data || {};
  const list = d.players || d.Players || [];
  return Array.isArray(list) ? list.map(p => ({
    id: p.id ?? p.serverId ?? p.server_id ?? "?",
    name: p.name ?? p.playerName ?? "Unknown",
    ping: p.ping ?? "?"
  })) : [];
}

function render(){
  const q = searchEl.value.trim().toLowerCase();
  const filtered = allPlayers.filter(p =>
    String(p.id).toLowerCase().includes(q) ||
    String(p.name).toLowerCase().includes(q)
  );

  if (!filtered.length){
    playersEl.innerHTML = '<div class="empty">Niciun jucător găsit.</div>';
    return;
  }

  playersEl.innerHTML = filtered.map(p => `
    <div class="player">
      <span class="id">#${escapeHtml(String(p.id))}</span>
      <span class="name">${escapeHtml(String(p.name))}</span>
      <span class="ping">${escapeHtml(String(p.ping))} ms</span>
    </div>`
  ).join("");
}

function escapeHtml(v){
  return v.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

async function fetchLive(){
  if (loading) return;
  loading = true;
  try{
    let lastErr;
    for (const url of ENDPOINTS){
      try{
        const res = await fetch(url, {cache:"no-store"});
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        allPlayers = normalizePlayers(json);
        const data = json?.Data || json?.data || json || {};
        onlineEl.textContent = data.clients ?? data.Clients ?? allPlayers.length;
        updatedEl.textContent = "Actualizat: " + new Date().toLocaleTimeString("ro-RO");
        errorEl.classList.add("hidden");
        render();
        loading = false;
        return;
      }catch(e){ lastErr = e; }
    }
    throw lastErr || new Error("Nu am putut încărca serverul.");
  }catch(err){
    errorEl.textContent = "Nu pot accesa direct API-ul FiveM din browser. Dacă apare constant, trebuie activat proxy-ul serverless.";
    errorEl.classList.remove("hidden");
  }finally{
    loading = false;
  }
}

searchEl.addEventListener("input", render);
refreshBtn.addEventListener("click", fetchLive);

fetchLive();
setInterval(fetchLive, POLL_MS);