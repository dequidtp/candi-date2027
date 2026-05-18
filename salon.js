/* ============================================================
   Candi-date 2027 — Salon
   ============================================================ */

const BACKEND_URL = 'https://www.candi-date.fr';

// ── URL / storage helpers ─────────────────────────────────────
const urlParams  = new URLSearchParams(window.location.search);
let   salonCode  = (urlParams.get('code') || '').toUpperCase().trim();

function tokenKey()     { return `salon_${salonCode}_token`; }
function completedKey() { return `salon_${salonCode}_completed`; }

// ── State ─────────────────────────────────────────────────────
let salonData        = null; // full API response
let shuffledPlayers  = [];   // completed players in random display order
let selectedName     = null; // name chip currently selected for assignment
let assignments      = {};   // { player_id: guessed_nickname }
let revealed         = false;

// ── Init ──────────────────────────────────────────────────────
function isValidCode(code) {
  return code && code.length >= 4 && /^[A-Z0-9]+$/.test(code);
}

async function init() {
  if (!isValidCode(salonCode)) { showState('enterCode'); return; }

  const data = await fetchSalonInfo();
  if (!data) { showState('notFound'); return; }
  salonData = data;

  const token     = localStorage.getItem(tokenKey());
  const completed = localStorage.getItem(completedKey());

  if (!token) {
    showJoin();
  } else if (!completed) {
    showWaiting();
  } else {
    showRecap();
  }
}

const STATE_MAP = {
  loading:   'stateLoading',
  enterCode: 'stateEnterCode',
  notFound:  'stateNotFound',
  join:      'stateJoin',
  waiting:   'stateWaiting',
  recap:     'stateRecap'
};

function showState(key) {
  Object.values(STATE_MAP).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === STATE_MAP[key] ? 'flex' : 'none';
  });
}

// ── API ───────────────────────────────────────────────────────
async function fetchSalonInfo() {
  try {
    const r = await fetch(`${BACKEND_URL}/api/salon/info?code=${encodeURIComponent(salonCode)}`);
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ── Enter code (no code in URL) ───────────────────────────────
function goToSalon() {
  const code = document.getElementById('codeInput').value.trim().toUpperCase();
  if (code.length < 4) return;
  window.location.href = `/salon.html?code=${code}`;
}

// ── Join ──────────────────────────────────────────────────────
function showJoin() {
  showState('join');
  document.getElementById('joinCodeBadge').textContent = salonCode;
}

async function joinAndPlay() {
  const nickname = document.getElementById('nicknameInput').value.trim();
  if (!nickname) return;

  const btn = document.querySelector('#stateJoin .btn-primary');
  btn.disabled = true; btn.textContent = 'Connexion…';

  try {
    const r = await fetch(`${BACKEND_URL}/api/salon/join`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: salonCode, nickname })
    });
    if (!r.ok) { alert((await r.json()).error || 'Erreur'); btn.disabled = false; btn.textContent = 'Jouer →'; return; }
    const { token } = await r.json();
    localStorage.setItem(tokenKey(), token);
    sessionStorage.setItem('salonToken', token);
    sessionStorage.setItem('salonCode', salonCode);
    window.location.href = '/';
  } catch { btn.disabled = false; btn.textContent = 'Jouer →'; }
}

// ── Waiting (has token but not completed) ─────────────────────
function showWaiting() {
  showState('waiting');
  document.getElementById('waitingCodeBadge').textContent = salonCode;

  const list = document.getElementById('waitingPlayerList');
  const completed = salonData.players.filter(p => p.completed);
  list.innerHTML = completed.length
    ? `<p class="chips-label">${completed.length} participant(s) ont déjà joué :</p>` +
      completed.map(p => `<span class="player-chip done">✓ ${p.nickname}</span>`).join('')
    : '<p class="chips-label">Aucun participant n\'a encore terminé.</p>';
}

function startPlay() {
  const token = localStorage.getItem(tokenKey());
  sessionStorage.setItem('salonToken', token);
  sessionStorage.setItem('salonCode', salonCode);
  window.location.href = '/';
}

// ── Recap ─────────────────────────────────────────────────────
function showRecap() {
  showState('recap');

  document.getElementById('recapCodeBadge').textContent = salonCode;

  const all       = salonData.players;
  const completed = all.filter(p => p.completed && p.frise_segments?.length);
  const pending   = all.filter(p => !p.completed);

  document.getElementById('recapSubtitle').textContent =
    `${completed.length} frise${completed.length > 1 ? 's' : ''} sur ${all.length} participant${all.length > 1 ? 's' : ''}`;

  // Shuffle display order (anonymity)
  shuffledPlayers = shuffle([...completed]);
  assignments = {};
  revealed    = false;

  renderNameChips(all.map(p => p.nickname));
  renderFrisesGrid();
  updateRevealBtn();

  // Pending players
  if (pending.length) {
    document.getElementById('pendingSection').style.display = 'block';
    document.getElementById('pendingList').innerHTML =
      pending.map(p => `<span class="player-chip pending">⏳ ${p.nickname}</span>`).join('');
  }
}

// ── Name chips ────────────────────────────────────────────────
function renderNameChips(allNicknames) {
  const wrap = document.getElementById('nameChips');
  wrap.innerHTML = '';
  allNicknames.forEach(name => {
    const chip = document.createElement('button');
    chip.className = 'name-chip';
    chip.textContent = name;
    chip.dataset.name = name;
    chip.onclick = () => selectNameChip(name);
    wrap.appendChild(chip);
  });
  refreshChips();
}

function selectNameChip(name) {
  if (revealed) return;
  selectedName = selectedName === name ? null : name;
  refreshChips();
}

function refreshChips() {
  const assignedNames = new Set(Object.values(assignments));
  document.querySelectorAll('.name-chip').forEach(chip => {
    const name = chip.dataset.name;
    const isSelected  = name === selectedName;
    const isAssigned  = assignedNames.has(name);
    chip.classList.toggle('selected',  isSelected);
    chip.classList.toggle('assigned',  isAssigned && !isSelected);
    chip.disabled = revealed;
  });
}

// ── Frises grid ───────────────────────────────────────────────
function renderFrisesGrid() {
  const grid = document.getElementById('frisesGrid');
  grid.innerHTML = '';

  shuffledPlayers.forEach((player, idx) => {
    const card = document.createElement('div');
    card.className = 'frise-card';
    card.dataset.playerId = player.id;

    const number = document.createElement('div');
    number.className = 'frise-anon-label';
    number.textContent = `Frise #${idx + 1}`;

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'frise-canvas-wrap';
    const canvas = document.createElement('canvas');
    canvasWrap.appendChild(canvas);

    const footer = document.createElement('div');
    footer.className = 'frise-card-footer';

    const assignSlot = document.createElement('div');
    assignSlot.className = 'frise-assign-slot';
    assignSlot.dataset.playerId = player.id;
    assignSlot.innerHTML = '<span class="assign-placeholder">Appuyez sur un nom puis ici</span>';
    assignSlot.onclick = () => assignToPlayer(player.id, assignSlot);

    const revealBadge = document.createElement('div');
    revealBadge.className = 'frise-reveal-badge';
    revealBadge.dataset.playerId = player.id;
    revealBadge.style.display = 'none';

    footer.appendChild(assignSlot);
    footer.appendChild(revealBadge);
    card.appendChild(number);
    card.appendChild(canvasWrap);
    card.appendChild(footer);
    grid.appendChild(card);

    drawFriseFromSegments(canvas, player.frise_segments, window.innerWidth < 600);
  });
}

function assignToPlayer(playerId, slot) {
  if (revealed || !selectedName) return;

  // Remove this name from any previous assignment
  Object.keys(assignments).forEach(pid => {
    if (assignments[pid] === selectedName) delete assignments[pid];
  });
  assignments[playerId] = selectedName;
  selectedName = null;

  // Refresh all slots
  shuffledPlayers.forEach(p => {
    const s = document.querySelector(`.frise-assign-slot[data-player-id="${p.id}"]`);
    if (!s) return;
    const name = assignments[p.id];
    s.innerHTML = name
      ? `<span class="assign-name">${name} <button class="unassign-btn" onclick="unassign('${p.id}', event)">✕</button></span>`
      : '<span class="assign-placeholder">Appuyez sur un nom puis ici</span>';
  });

  refreshChips();
  updateRevealBtn();
}

function unassign(playerId, event) {
  event.stopPropagation();
  delete assignments[playerId];
  const slot = document.querySelector(`.frise-assign-slot[data-player-id="${playerId}"]`);
  if (slot) slot.innerHTML = '<span class="assign-placeholder">Appuyez sur un nom puis ici</span>';
  refreshChips();
  updateRevealBtn();
}

function updateRevealBtn() {
  const btn  = document.getElementById('revealAllBtn');
  const hint = document.getElementById('revealHint');
  const total     = shuffledPlayers.length;
  const assigned  = Object.keys(assignments).length;
  const remaining = total - assigned;

  if (remaining > 0 && !revealed) {
    hint.textContent = `${assigned}/${total} assigné${assigned > 1 ? 's' : ''}`;
  } else {
    hint.textContent = '';
  }
  btn.disabled = revealed;
}

// ── Reveal ────────────────────────────────────────────────────
function revealAll() {
  if (revealed) return;
  revealed = true;

  let correct = 0;
  const total = shuffledPlayers.length;

  shuffledPlayers.forEach(player => {
    const guessed  = assignments[player.id];
    const isRight  = guessed && guessed === player.nickname;
    if (isRight) correct++;

    const slot  = document.querySelector(`.frise-assign-slot[data-player-id="${player.id}"]`);
    const badge = document.querySelector(`.frise-reveal-badge[data-player-id="${player.id}"]`);
    const card  = document.querySelector(`.frise-card[data-player-id="${player.id}"]`);

    if (slot)  slot.style.display = 'none';
    if (badge) {
      badge.style.display = 'flex';
      badge.innerHTML = player.nickname;
      badge.classList.add(guessed ? (isRight ? 'correct' : 'wrong') : 'unguessed');
      if (guessed && !isRight) badge.title = `Vous aviez répondu : ${guessed}`;
    }
    if (card) card.classList.add(guessed ? (isRight ? 'card-correct' : 'card-wrong') : 'card-unguessed');
  });

  // Score banner
  const hint = document.getElementById('revealHint');
  const btn  = document.getElementById('revealAllBtn');
  hint.textContent = `${correct} bonne${correct > 1 ? 's' : ''} réponse${correct > 1 ? 's' : ''} sur ${total} ! 🎉`;
  btn.textContent  = '✓ Révélé';
  btn.disabled     = true;

  refreshChips();
}

// ── Refresh ───────────────────────────────────────────────────
async function refreshSalon() {
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true; btn.textContent = '…';
  const data = await fetchSalonInfo();
  if (data) { salonData = data; showRecap(); }
  btn.disabled = false; btn.textContent = '↻ Rafraîchir';
}

// ── Copy link ─────────────────────────────────────────────────
function copySalonLink() {
  const url = `${window.location.origin}/salon.html?code=${salonCode}`;
  navigator.clipboard.writeText(url).then(() => {
    const toast = document.getElementById('copyToast');
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2000);
  });
}

// ── Canvas: draw frise from stored segments ───────────────────
function drawFriseFromSegments(canvas, segments, isMobile) {
  if (!segments || !segments.length) return;

  const dpr = Math.max(window.devicePixelRatio || 1, 2);
  const W   = isMobile ? 300 : 520;
  const barH = isMobile ? 34 : 42;
  const legendEstimate = 36;
  const H = isMobile ? 100 + legendEstimate : 110 + legendEstimate;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const totalWins = segments.reduce((s, seg) => s + seg.wins, 0);
  const barX = 0, barY = isMobile ? 16 : 18;
  const barW = W;
  const radius = 8;
  const SMALL_THRESHOLD = 60;

  ctx.fillStyle = '#f9f9f9';
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 10); ctx.fill();

  ctx.fillStyle = '#1e1b2e';
  ctx.font = `bold ${isMobile ? 10 : 12}px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.fillText('Parcours', 0, isMobile ? 12 : 13);

  // Draw colored bar segments
  let x = barX;
  segments.forEach((seg, i) => {
    const sw = (seg.wins / totalWins) * barW;
    ctx.fillStyle = seg.color;
    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(x + radius, barY); ctx.lineTo(x + sw, barY);
      ctx.lineTo(x + sw, barY + barH); ctx.lineTo(x + radius, barY + barH);
      ctx.arcTo(x, barY + barH, x, barY, radius);
      ctx.arcTo(x, barY, x + radius, barY, radius);
      ctx.fill();
    } else if (i === segments.length - 1) {
      ctx.beginPath();
      ctx.moveTo(x, barY); ctx.lineTo(x + sw - radius, barY);
      ctx.arcTo(x + sw, barY, x + sw, barY + radius, radius);
      ctx.arcTo(x + sw, barY + barH, x + sw - radius, barY + barH, radius);
      ctx.lineTo(x, barY + barH); ctx.fill();
    } else {
      ctx.fillRect(x, barY, sw, barH);
    }
    x += sw;
  });

  // Dividers
  x = barX;
  segments.forEach((seg, i) => {
    x += (seg.wins / totalWins) * barW;
    if (i < segments.length - 1) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, barY); ctx.lineTo(x, barY + barH); ctx.stroke();
    }
  });

  // Labels inside bar + legend for small segments
  const smallSegs = [];
  x = barX;
  let duelCount = 1;

  segments.forEach(seg => {
    const sw = (seg.wins / totalWins) * barW;
    const cx = x + sw / 2;
    const endDuel   = duelCount + seg.wins - 1;
    const duelLabel = seg.wins === 1 ? `${duelCount}` : `${duelCount}→${endDuel}`;
    const isLarge   = sw >= SMALL_THRESHOLD;

    if (isLarge) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.font = `bold ${isMobile ? 9 : 10}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(seg.name, cx, barY + barH / 2 - 3);
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.font = `${isMobile ? 7 : 8}px sans-serif`;
      ctx.fillText(duelLabel, cx, barY + barH / 2 + 8);
      ctx.restore();
    } else {
      if (sw > 16) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.font = `bold ${isMobile ? 6 : 7}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(duelLabel, cx, barY + barH / 2 + 3);
        ctx.restore();
      }
      smallSegs.push({ ...seg, sw, cx, duelLabel });
    }
    duelCount += seg.wins;
    x += sw;
  });

  // Legend for small segments
  if (smallSegs.length > 0) {
    const fs = isMobile ? 7 : 8;
    ctx.font = `${fs}px sans-serif`;
    const lineH = fs + 5, colGap = 8;
    const legendBaseY = barY + barH + 12;
    const items = smallSegs.map(seg => {
      const label = `${seg.name} (${seg.duelLabel})`;
      return { ...seg, label, itemW: 10 + ctx.measureText(label).width };
    });
    const lines = []; let line = [], lw = 0;
    items.forEach(it => {
      if (lw + it.itemW > barW && line.length > 0) { lines.push(line); line = []; lw = 0; }
      line.push(it); lw += it.itemW + colGap;
    });
    if (line.length > 0) lines.push(line);
    lines.forEach((ln, li) => {
      const totalW = ln.reduce((s, it) => s + it.itemW, 0) + (ln.length - 1) * colGap;
      let lx = (barW - totalW) / 2;
      ln.forEach(it => {
        const ly = legendBaseY + li * lineH;
        ctx.fillStyle = it.color;
        ctx.beginPath(); ctx.roundRect(lx, ly - 6, 7, 7, 2); ctx.fill();
        ctx.fillStyle = '#374151'; ctx.textAlign = 'left';
        ctx.fillText(it.label, lx + 9, ly);
        lx += it.itemW + colGap;
      });
    });
  }

  const footerY = H - 5;
  ctx.strokeStyle = '#ececec'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, footerY - 7); ctx.lineTo(W, footerY - 7); ctx.stroke();
  ctx.fillStyle = '#a78bfa';
  ctx.font = `bold ${isMobile ? 7 : 8}px Georgia, serif`;
  ctx.textAlign = 'right';
  ctx.fillText('candi-date.fr', W, footerY);
}

// ── Shuffle ───────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
