/* ============================================================
   Présidentielle 2027 — Stats page
   ============================================================ */

const PASSWORD = 'pierre_messmer1450';

function checkPassword() {
  const input = document.getElementById('passwordInput');
  const error = document.getElementById('passwordError');
  if (input.value === PASSWORD) {
    sessionStorage.setItem('statsUnlocked', 'true');
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('statsPage').style.display = 'block';
    loadStats();
  } else {
    error.textContent = 'Mot de passe incorrect';
    input.classList.add('shake');
    input.value = '';
    setTimeout(() => input.classList.remove('shake'), 500);
  }
}

function toggleEye() {
  const input = document.getElementById('passwordInput');
  const btn   = document.getElementById('eyeBtn');
  input.type  = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

// ── Load stats ────────────────────────────────────────────────
async function loadStats() {
  let globalData = null;
  const indicator = document.getElementById('syncIndicator');

  try {
    const res = await fetch(`${BACKEND_URL}/api/stats`);
    if (res.ok) {
      globalData = await res.json();
      indicator.textContent = '🟢 Global';
      indicator.style.color = '#166534';
    }
  } catch (e) {
    indicator.textContent = '🔴 Local';
    indicator.style.color = '#991b1b';
  }

  // Fallback to local
  const local = JSON.parse(localStorage.getItem('bracketStats') || '{"games":0,"votes":{}}');

  // Build merged data
  // Structure: { totalGames, perCandidate: { name: { totalWins, finalWins } } }
  let totalGames = 0;
  const perCandidate = {};
  CANDIDATES.forEach(c => { perCandidate[c.name] = { totalWins: 0, finalWins: 0 }; });

  if (globalData) {
    totalGames = globalData.totalGames || 0;
    (globalData.candidates || []).forEach(r => {
      if (perCandidate[r.candidate_name]) {
        perCandidate[r.candidate_name].totalWins = r.total_wins   || 0;
        perCandidate[r.candidate_name].finalWins = r.final_wins   || 0;
      }
    });
  } else {
    // Use local only
    totalGames = local.games || 0;
    Object.entries(local.votes || {}).forEach(([name, v]) => {
      if (perCandidate[name]) {
        perCandidate[name].totalWins = v.totalWins || 0;
        perCandidate[name].finalWins = v.finalWins || 0;
      }
    });
  }

  if (totalGames === 0) {
    document.getElementById('emptyState').style.display   = 'block';
    document.getElementById('statsSummary').style.display = 'none';
    document.getElementById('section1').style.display     = 'none';
    document.getElementById('section2').style.display     = 'none';
    return;
  }

  // Show summary cards
  document.getElementById('statsSummary').style.display = 'grid';
  document.getElementById('sumGames').textContent = totalGames.toLocaleString('fr-FR');
  const totalDuels = Object.values(perCandidate).reduce((s, v) => s + v.totalWins, 0);
  document.getElementById('sumVotes').textContent = totalDuels.toLocaleString('fr-FR');

  // Most chosen = most final wins
  const topFinal = CANDIDATES
    .map(c => ({ name: c.name, finals: perCandidate[c.name].finalWins }))
    .sort((a, b) => b.finals - a.finals)[0];
  document.getElementById('sumWinner').textContent = topFinal?.finals > 0 ? topFinal.name.split(' ').pop() : '—';

  renderWinsTable(perCandidate, totalGames);
  renderFinalsTable(perCandidate, totalGames);
}

// ── Table 1 — full ranking ─────────────────────────────────────
function renderWinsTable(perCandidate, totalGames) {
  const rows = CANDIDATES.map(c => ({
    ...c,
    totalWins: perCandidate[c.name].totalWins,
    finalWins: perCandidate[c.name].finalWins,
    avg: totalGames > 0
      ? (perCandidate[c.name].totalWins / totalGames).toFixed(2)
      : '0.00'
  })).sort((a, b) => b.totalWins - a.totalWins);

  const maxWins = rows[0]?.totalWins || 1;
  const tbody   = document.getElementById('winsBody');
  tbody.innerHTML = '';

  rows.forEach((c, i) => {
    const barPct = (c.totalWins / maxWins) * 100;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="stat-rank">${i + 1}</td>
      <td>
        <div class="stat-candidate">
          <div class="stat-photo-wrap" style="background:${c.color}" id="spw-${i}">
            <img class="stat-photo hidden" id="spi-${i}" alt="${c.name}" loading="lazy" />
            <div class="stat-avatar">${initials(c.name)}</div>
          </div>
          <div>
            <div class="stat-name">${c.name}</div>
            <div class="stat-desc">${c.desc}</div>
          </div>
        </div>
      </td>
      <td><span class="card-badge" style="${getBadgeStyle(c.color)}">${c.cat}</span></td>
      <td class="stat-num">${c.totalWins}</td>
      <td class="stat-avg">${c.avg}</td>
      <td class="stat-num">${c.finalWins}</td>
      <td class="stat-bar-wrap">
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width:${barPct}%"></div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
    // Load photo async via Wikipedia API
    fetchWikipediaPhoto(c.name).then(url => {
      if (!url) return;
      const img = document.getElementById(`spi-${i}`);
      if (!img) return;
      img.onload  = () => img.classList.remove('hidden');
      img.onerror = () => img.classList.add('hidden');
      img.src = url;
    });
  });
}

// ── Table 2 — finals only ─────────────────────────────────────
function renderFinalsTable(perCandidate, totalGames) {
  const rows = CANDIDATES
    .map(c => ({ ...c, finalWins: perCandidate[c.name].finalWins }))
    .filter(c => c.finalWins > 0)
    .sort((a, b) => b.finalWins - a.finalWins);

  if (rows.length === 0) {
    document.getElementById('section2').style.display = 'none';
    return;
  }

  const maxFinals = rows[0].finalWins || 1;
  const tbody     = document.getElementById('finalsBody');
  tbody.innerHTML  = '';

  rows.forEach((c, i) => {
    const barPct = (c.finalWins / maxFinals) * 100;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="stat-rank">${i + 1}</td>
      <td>
        <div class="stat-candidate">
          <div class="stat-photo-wrap" style="background:${c.color}">
            <img class="stat-photo hidden" id="fpi-${i}" alt="${c.name}" loading="lazy" />
            <div class="stat-avatar">${initials(c.name)}</div>
          </div>
          <div>
            <div class="stat-name">${c.name}</div>
            <div class="stat-desc">${c.desc}</div>
          </div>
        </div>
      </td>
      <td><span class="card-badge" style="${getBadgeStyle(c.color)}">${c.cat}</span></td>
      <td class="stat-num">${c.finalWins}</td>
      <td class="stat-bar-wrap">
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width:${barPct}%;background:linear-gradient(90deg,#f59e0b,#f9a8d4)"></div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
    fetchWikipediaPhoto(c.name).then(url => {
      if (!url) return;
      const img = document.getElementById(`fpi-${i}`);
      if (!img) return;
      img.onload  = () => img.classList.remove('hidden');
      img.onerror = () => img.classList.add('hidden');
      img.src = url;
    });
  });
}

// ── Export CSV ────────────────────────────────────────────────
async function exportCSV() {
  let globalData = null;
  try { const r = await fetch(`${BACKEND_URL}/api/stats`); if (r.ok) globalData = await r.json(); } catch (e) {}

  const local = JSON.parse(localStorage.getItem('bracketStats') || '{"games":0,"votes":{}}');
  let totalGames = 0;
  const perCandidate = {};
  CANDIDATES.forEach(c => { perCandidate[c.name] = { totalWins: 0, finalWins: 0 }; });

  if (globalData) {
    totalGames = globalData.totalGames || 0;
    (globalData.candidates || []).forEach(r => {
      if (perCandidate[r.candidate_name]) {
        perCandidate[r.candidate_name].totalWins = r.total_wins || 0;
        perCandidate[r.candidate_name].finalWins = r.final_wins || 0;
      }
    });
  } else {
    totalGames = local.games || 0;
    Object.entries(local.votes || {}).forEach(([name, v]) => {
      if (perCandidate[name]) {
        perCandidate[name].totalWins = v.totalWins || 0;
        perCandidate[name].finalWins = v.finalWins || 0;
      }
    });
  }

  const rows = [
    ['Candidat','Description','Catégorie','Total duels gagnés','Moy. duels / partie','Victoires finales'],
    ...CANDIDATES
      .map(c => ({
        ...c,
        totalWins: perCandidate[c.name].totalWins,
        finalWins: perCandidate[c.name].finalWins,
        avg: totalGames > 0 ? (perCandidate[c.name].totalWins / totalGames).toFixed(2) : '0.00'
      }))
      .sort((a, b) => b.totalWins - a.totalWins)
      .map(c => [c.name, c.desc, c.cat, c.totalWins, c.avg, c.finalWins])
  ];

  const csv  = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const date = new Date().toISOString().split('T')[0];
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: `bracket_stats_${date}.csv` }).click();
  URL.revokeObjectURL(url);
}

function resetStats() {
  if (confirm('Réinitialiser toutes les statistiques locales ? Cette action est irréversible.')) {
    localStorage.removeItem('bracketStats');
    location.reload();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('statsUnlocked') === 'true') {
    document.getElementById('passwordModal').style.display = 'none';
    document.getElementById('statsPage').style.display     = 'block';
    loadStats();
  }
});
