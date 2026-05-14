/* ============================================================
   Présidentielle 2027 — Face à Face
   ============================================================ */

const BACKEND_URL = 'YOUR_VERCEL_URL_HERE';

// ── Wikipedia photo cache ─────────────────────────────────────
// Photos are loaded dynamically via the Wikipedia API (fr + en)
// This avoids hardcoded URLs that break — the API always returns the correct image
const photoCache = {}; // { name: url | null }

async function fetchWikipediaPhoto(name) {
  if (photoCache[name] !== undefined) return photoCache[name];
  photoCache[name] = null; // mark as fetching

  // Try French Wikipedia first, then English
  const wikis = [
    `https://fr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&piprop=thumbnail&pithumbsize=240&format=json&origin=*`,
    `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&piprop=thumbnail&pithumbsize=240&format=json&origin=*`
  ];

  for (const url of wikis) {
    try {
      const res  = await fetch(url);
      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) continue;
      const page = Object.values(pages)[0];
      const thumb = page?.thumbnail?.source;
      if (thumb) {
        photoCache[name] = thumb;
        return thumb;
      }
    } catch (e) { /* try next */ }
  }
  return null;
}

// ── Candidates ───────────────────────────────────────────────
// No hardcoded photo URLs — loaded dynamically via Wikipedia API
const CANDIDATES = [
  // 🔴 Extrême droite
  { name: "Marine Le Pen",               desc: "Dirigeante du RN",                                      cat: "RN",                  color: "#003189" },
  { name: "Jordan Bardella",             desc: "Président du RN",                                       cat: "RN",                  color: "#1a3fa0" },
  { name: "Nicolas Dupont-Aignan",       desc: "Ancien candidat à la présidentielle",                   cat: "Debout la France",    color: "#1a4fa0" },
  { name: "Éric Zemmour",                desc: "Fondateur de Reconquête",                               cat: "Reconquête",          color: "#8B0000" },
  { name: "Sarah Knafo",                 desc: "Députée européenne",                                    cat: "Reconquête",          color: "#a00000" },
  { name: "Marion Maréchal",             desc: "Présidente d'Identité-Libertés, députée européenne",    cat: "Reconquête",          color: "#c0392b" },
  { name: "Robert Ménard",               desc: "Maire de Béziers, co-fondateur de Reporters sans frontières", cat: "Électron libre",   color: "#7f1d1d" },

  // 🔵 Droite
  { name: "Bruno Retailleau",            desc: "Président des LR",                                      cat: "Les Républicains",    color: "#0066cc" },
  { name: "Valérie Pécresse",            desc: "Présidente de la région Île-de-France",                 cat: "Les Républicains",    color: "#0055bb" },
  { name: "David Lisnard",               desc: "Maire de Cannes",                                       cat: "Nouvelle Énergie",    color: "#5ba4d4" },
  { name: "Xavier Bertrand",             desc: "Président des Hauts-de-France",                         cat: "Les Républicains",    color: "#004aaa" },
  { name: "Dominique de Villepin",       desc: "Ancien Premier ministre",                               cat: "La France Humaniste", color: "#2c3e6b" },
  { name: "Michel Barnier",              desc: "Ancien Premier ministre, ex-négociateur Brexit",        cat: "Droite indépendante", color: "#34495e" },
  { name: "Yaël Braun-Pivet",            desc: "Présidente de l'Assemblée nationale",                   cat: "Renaissance",         color: "#d4a800" },
  { name: "Pierre de Villiers",          desc: "Ancien chef d'état-major des armées",                   cat: "Électron libre",      color: "#374151" },

  // ⚪ Centre
  { name: "Édouard Philippe",            desc: "Maire du Havre, ancien Premier ministre",               cat: "Horizons",            color: "#4db8ff" },
  { name: "Gabriel Attal",               desc: "Ancien Premier ministre",                               cat: "Renaissance",         color: "#e6b800" },
  { name: "Gérald Darmanin",             desc: "Ministre de la Justice",                                cat: "Renaissance",         color: "#c9a000" },
  { name: "Élisabeth Borne",             desc: "Ancienne Première ministre",                            cat: "Indépendante",        color: "#546e7a" },
  { name: "Jean Castex",                 desc: "Ancien Premier ministre",                               cat: "Indépendant",         color: "#455a64" },
  { name: "Didier Migaud",               desc: "Ancien président du Conseil constitutionnel",           cat: "Électron libre",      color: "#546e7a" },
  { name: "François Molins",             desc: "Procureur",                                             cat: "Électron libre",      color: "#455a64" },
  { name: "Marc Fesneau",                desc: "Président du groupe MoDem à l'Assemblée",               cat: "MoDem",               color: "#ff8c00" },
  { name: "Patrick Mignola",             desc: "Porte-parole du MoDem",                                 cat: "MoDem",               color: "#e07800" },
  { name: "Jean-Noël Barrot",            desc: "Ministre des Affaires étrangères",                      cat: "MoDem",               color: "#d06800" },

  // 🌹 Gauche
  { name: "Jean-Luc Mélenchon",          desc: "Fondateur de LFI",                                      cat: "LFI",                 color: "#cc0000" },
  { name: "Manuel Bompard",              desc: "Coordinateur de LFI",                                   cat: "LFI",                 color: "#bb0000" },
  { name: "Clémence Guettée",          desc: "Députée LFI",                                           cat: "LFI",                 color: "#aa0000" },
  { name: "Raphaël Glucksmann",          desc: "Député européen, fondateur de Place Publique",          cat: "Place Publique",      color: "#c2006e" },
  { name: "Marine Tondelier",            desc: "Secrétaire nationale des Écologistes",                  cat: "Les Écologistes",     color: "#2e7d32" },
  { name: "François Ruffin",             desc: "Réalisateur, député",                                   cat: "Debout !",            color: "#b71c1c" },
  { name: "Clémentine Autain",           desc: "Députée",                                               cat: "L'Après",             color: "#7b1fa2" },
  { name: "Fabien Roussel",              desc: "Secrétaire national du PCF",                            cat: "PCF",                 color: "#cc1100" },
  { name: "François Hollande",           desc: "Ancien Président de la République",                     cat: "PS",                  color: "#c2185b" },
  { name: "Olivier Faure",               desc: "Premier secrétaire du PS",                              cat: "PS",                  color: "#d81b60" },
  { name: "Sandrine Rousseau",           desc: "Députée",                                               cat: "Les Écologistes",     color: "#388e3c" },
  { name: "Carole Delga",                desc: "Présidente de la région Occitanie",                     cat: "PS",                  color: "#e91e8c" },
  { name: "Guillaume Lacroix",           desc: "Président du Parti radical de gauche",                  cat: "PRG",                 color: "#e8334a" },
  { name: "Nathalie Arthaud",            desc: "Ancienne candidate à la présidentielle",                cat: "Lutte Ouvrière",      color: "#8B0000" },
  { name: "Philippe Poutou",             desc: "Libraire",                                              cat: "NPA",                 color: "#b71c1c" },

  // 🎭 Médias / Divertissement
  { name: "Cyril Hanouna",               desc: "Animateur TV",                                          cat: "Électron libre",      color: "#ff6600" },
  { name: "Patrick Sébastien",           desc: "Animateur TV, chanteur",                                cat: "Électron libre",      color: "#e65100" },
  { name: "Stéphane Bern",               desc: "Journaliste",                                           cat: "Électron libre",      color: "#8d6e63" },
  { name: "Vincent Lindon",              desc: "Acteur",                                                cat: "Électron libre",      color: "#37474f" },
  { name: "Omar Sy",                     desc: "Acteur",                                                cat: "Électron libre",      color: "#4e342e" },
  { name: "Jamel Debbouze",              desc: "Humoriste",                                             cat: "Électron libre",      color: "#bf360c" },
  { name: "Guillaume Meurice",           desc: "Humoriste",                                             cat: "Électron libre",      color: "#6a1b9a" },
  { name: "Natacha Polony",              desc: "Éditorialiste, directrice de rédaction",                cat: "Électron libre",      color: "#5c4033" },
  { name: "Inoxtag",                     desc: "YouTubeur",                                             cat: "Électron libre",      color: "#e53935" },
  { name: "Tibo InShape",                desc: "YouTubeur",                                             cat: "Électron libre",      color: "#d32f2f" },

  // ⚽ Sport
  { name: "Zinédine Zidane",             desc: "Légende du football",                                   cat: "Électron libre",      color: "#1565c0" },
  { name: "Tony Parker",                 desc: "Champion NBA, entrepreneur",                            cat: "Électron libre",      color: "#0d47a1" },
  { name: "Amélie Mauresmo",             desc: "Championne de tennis, dirigeante sportive",             cat: "Électron libre",      color: "#1976d2" },
  { name: "Teddy Riner",                 desc: "Champion de judo",                                      cat: "Électron libre",      color: "#283593" },

  // 💼 Affaires
  { name: "Christine Lagarde",           desc: "Présidente de la BCE, ex-FMI",                         cat: "Électron libre",      color: "#8B6914" },
  { name: "Xavier Niel",                 desc: "Fondateur de Free",                                     cat: "Électron libre",      color: "#455a64" },
  { name: "Bernard Arnault",             desc: "PDG de LVMH",                                           cat: "Électron libre",      color: "#3e2723" },
  { name: "Michel-Édouard Leclerc",      desc: "Président des magasins Leclerc",                        cat: "Électron libre",      color: "#e53935" },
  { name: "Jean-Dominique Senard",       desc: "Président de Renault",                                  cat: "Électron libre",      color: "#b71c1c" },
  { name: "Laurent Berger",              desc: "Ex-secrétaire général de la CFDT",                     cat: "Électron libre",      color: "#ad1457" },
  { name: "Matthieu Pigasse",            desc: "Banquier d'affaires, patron de presse",                 cat: "Électron libre",      color: "#1a237e" },
  { name: "Oussama Ammar",                desc: "Entrepreneur",                                          cat: "Électron libre",      color: "#00695c" },

  // 🌍 Société civile
  { name: "José Bové",                   desc: "Syndicaliste agricole, altermondialiste",               cat: "Électron libre",      color: "#4a7c40" },
  { name: "Noël Mamère",                 desc: "Ancien député écologiste, journaliste",                 cat: "Électron libre",      color: "#388e3c" },
  { name: "Rokhaya Diallo",              desc: "Militante",                                             cat: "Électron libre",      color: "#6a1b9a" },
  { name: "Jean Lassalle",               desc: "Ancien candidat à l'élection présidentielle",           cat: "Électron libre",      color: "#78350f" },

  // 🎓 Intellectuels / Experts
  { name: "Jean-Marc Jancovici",         desc: "Fondateur de Carbon4",                                 cat: "Électron libre",      color: "#1b5e20" },
  { name: "Jean Tirole",                 desc: "Prix Nobel d'économie",                                cat: "Électron libre",      color: "#004d40" },
  { name: "François Villeroy de Galhau", desc: "Gouverneur de la Banque de France",                    cat: "Électron libre",      color: "#006064" },
  { name: "Thomas Piketty",              desc: "Économiste",                                            cat: "Électron libre",      color: "#00695c" },
  { name: "Gabriel Zucman",              desc: "Économiste",                                            cat: "Électron libre",      color: "#00796b" },
  { name: "Aurélien Barrau",             desc: "Astrophysicien",                                        cat: "Électron libre",      color: "#1a237e" },
  { name: "Raphaël Enthoven",            desc: "Chroniqueur philo",                                     cat: "Électron libre",      color: "#4527a0" },
  { name: "Philippe Aghion",             desc: "Économiste",                                           cat: "Électron libre",      color: "#0d47a1" },
  { name: "Bruno Le Maire",              desc: "Auteur érotique",                                      cat: "Électron libre",      color: "#78716c" },
];

// ── State ─────────────────────────────────────────────────────
let queue          = [];
let leftCandidate  = null;
let rightCandidate = null;
let totalCandidates = 0;
let currentWinner  = null;
let gameVotes      = {}; // { candidateName: winsInThisGame }

// ── Helpers ───────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initials(name) {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function softBg(hex)     { return hex + '1a'; }
function softBorder(hex) { return hex + '44'; }
function getBadgeStyle(color) {
  return `background:${softBg(color)};color:${color};border:1px solid ${softBorder(color)};`;
}

// ── Photo loading via Wikipedia API with fallback ────────────
const photoPromiseCache = {};

function getPhotoUrl(name) {
  if (!photoPromiseCache[name]) {
    photoPromiseCache[name] = fetchWikipediaPhoto(name);
  }
  return photoPromiseCache[name];
}

function setPhoto(imgEl, avatarEl, candidate) {
  // Show avatar immediately (always visible as base layer via z-index)
  avatarEl.textContent      = initials(candidate.name);
  avatarEl.style.background = candidate.color;

  // Reset photo — remove loaded class, clear src
  imgEl.classList.remove('loaded');
  imgEl.src = '';

  // Fetch and display photo
  getPhotoUrl(candidate.name).then(url => {
    if (!url) return;
    // If src is already this URL (cached), just add loaded
    if (imgEl.src === url) {
      imgEl.classList.add('loaded');
      return;
    }
    imgEl.onload  = () => imgEl.classList.add('loaded');
    imgEl.onerror = () => imgEl.classList.remove('loaded');
    imgEl.src = url;
  });
}

// ── Render card ───────────────────────────────────────────────
function renderCard(side, candidate) {
  const L = side === 'left';
  const imgEl    = document.getElementById(L ? 'imgLeft'    : 'imgRight');
  const avatarEl = document.getElementById(L ? 'avatarLeft' : 'avatarRight');
  const nameEl   = document.getElementById(L ? 'nameLeft'   : 'nameRight');
  const descEl   = document.getElementById(L ? 'descLeft'   : 'descRight');
  const badgeEl  = document.getElementById(L ? 'badgeLeft'  : 'badgeRight');

  setPhoto(imgEl, avatarEl, candidate);
  nameEl.textContent = candidate.name;
  descEl.textContent = candidate.desc;
  badgeEl.textContent = candidate.cat;
  badgeEl.setAttribute('style', getBadgeStyle(candidate.color));
}

// ── Progress ──────────────────────────────────────────────────
function updateProgress() {
  const remaining  = queue.length + 2;
  const eliminated = totalCandidates - remaining;
  const pct        = Math.max(0, (eliminated / (totalCandidates - 1)) * 100);
  document.getElementById('progressFill').style.width  = pct + '%';
  document.getElementById('progressLabel').textContent =
    remaining <= 2 ? '⚡ Duel final !' : `${remaining} candidats restants`;
}

// ── Game start ────────────────────────────────────────────────
function startGame() {
  document.getElementById('victoryScreen').style.display = 'none';
  document.getElementById('shareOverlay').style.display  = 'none';
  queue           = shuffle(CANDIDATES);
  totalCandidates = queue.length;
  gameVotes       = {};
  CANDIDATES.forEach(c => { gameVotes[c.name] = 0; });

  leftCandidate  = queue.shift();
  rightCandidate = queue.shift();

  // Preload photos for first 6 candidates
  [leftCandidate, rightCandidate, ...queue.slice(0, 4)].forEach(c => getPhotoUrl(c.name));

  renderCard('left',  leftCandidate);
  renderCard('right', rightCandidate);

  document.getElementById('cardLeft').onclick  = () => handleVote('left');
  document.getElementById('cardRight').onclick = () => handleVote('right');
  updateProgress();
}

// ── Vote ──────────────────────────────────────────────────────
function handleVote(side) {
  const winner      = side === 'left' ? leftCandidate : rightCandidate;
  const loserCardId = side === 'left' ? 'cardRight'   : 'cardLeft';
  const loserCard   = document.getElementById(loserCardId);

  // Track win for this game
  gameVotes[winner.name] = (gameVotes[winner.name] || 0) + 1;

  loserCard.classList.add('card-exit');
  document.getElementById('cardLeft').style.pointerEvents  = 'none';
  document.getElementById('cardRight').style.pointerEvents = 'none';

  setTimeout(() => {
    loserCard.classList.remove('card-exit');

    if (queue.length === 0) {
      // Game over — send single API call
      submitGameResult(winner);
      showVictory(winner);
      return;
    }

    leftCandidate  = winner;
    rightCandidate = queue.shift();

    // Preload the one after next
    if (queue.length > 0) getPhotoUrl(queue[0].name);

    renderCard('left', leftCandidate);
    const winCard = document.getElementById('cardLeft');
    winCard.classList.add('card-winner');
    setTimeout(() => winCard.classList.remove('card-winner'), 700);

    renderCard('right', rightCandidate);
    const challengerCard = document.getElementById('cardRight');
    challengerCard.classList.add('card-enter');
    setTimeout(() => challengerCard.classList.remove('card-enter'), 400);

    document.getElementById('cardLeft').style.pointerEvents  = '';
    document.getElementById('cardRight').style.pointerEvents = '';
    updateProgress();
  }, 300);
}

// ── Submit — ONE request per completed game ───────────────────
async function submitGameResult(winner) {
  // Build payload
  const votes = CANDIDATES.map(c => ({
    candidate_name: c.name,
    wins_in_game:   gameVotes[c.name] || 0,
    is_final_winner: c.name === winner.name
  }));

  const payload = { votes };

  // Save locally first
  saveLocal(payload, winner);

  // Then try remote
  try {
    await fetch(`${BACKEND_URL}/api/game`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
  } catch (e) {
    // Silently fail — local data is saved
  }
}

// ── Local storage ─────────────────────────────────────────────
function saveLocal(payload, winner) {
  const stored = JSON.parse(localStorage.getItem('bracketStats') || '{"games":0,"votes":{}}');
  stored.games = (stored.games || 0) + 1;
  if (!stored.votes) stored.votes = {};

  payload.votes.forEach(v => {
    if (!stored.votes[v.candidate_name]) {
      stored.votes[v.candidate_name] = { totalWins: 0, finalWins: 0 };
    }
    stored.votes[v.candidate_name].totalWins  += v.wins_in_game;
    stored.votes[v.candidate_name].finalWins  += v.is_final_winner ? 1 : 0;
  });

  localStorage.setItem('bracketStats', JSON.stringify(stored));
}

// ── Victory ───────────────────────────────────────────────────
function showVictory(winner) {
  currentWinner = winner;
  document.getElementById('victoryScreen').style.display = 'flex';

  const imgEl    = document.getElementById('victoryImg');
  const avatarEl = document.getElementById('victoryAvatar');
  setPhoto(imgEl, avatarEl, winner);

  document.getElementById('victoryName').textContent = winner.name;
  document.getElementById('victoryDesc').textContent = winner.desc;

  const badge = document.getElementById('victoryBadge');
  badge.textContent = winner.cat;
  badge.setAttribute('style', getBadgeStyle(winner.color) + ' margin:0 auto 1.5rem; display:inline-block;');

  document.getElementById('progressFill').style.width       = '100%';
  document.getElementById('progressLabel').textContent      = '✓ Tous les duels terminés';

  launchConfetti();
}

// ── Confetti ──────────────────────────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#a78bfa','#f9a8d4','#86efac','#fcd34d','#93c5fd','#fca5a5'];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'2px'};animation-duration:${2+Math.random()*2}s;animation-delay:${Math.random()}s;opacity:${.6+Math.random()*.4};`;
    container.appendChild(p);
  }
}

// ── Restart ───────────────────────────────────────────────────
function restartGame() { startGame(); }

// ── Share ─────────────────────────────────────────────────────
let shareMode = 'reveal';

function openSharePanel() {
  if (!currentWinner) return;
  shareMode = 'reveal';

  const imgEl    = document.getElementById('sharePreviewImg');
  const avatarEl = document.getElementById('sharePreviewAvatar');
  setPhoto(imgEl, avatarEl, currentWinner);
  avatarEl.style.width  = '22px';
  avatarEl.style.height = '22px';
  avatarEl.style.fontSize = '8px';
  document.getElementById('previewName').textContent = currentWinner.name;

  selectShareOption('reveal');
  document.getElementById('shareOverlay').style.display = 'flex';
  document.getElementById('copyConfirm').classList.remove('visible');
}

function closeSharePanel() { document.getElementById('shareOverlay').style.display = 'none'; }
function closeSharePanelOutside(e) { if (e.target === document.getElementById('shareOverlay')) closeSharePanel(); }

function selectShareOption(mode) {
  shareMode = mode;
  ['optReveal','optSecret'].forEach(id => document.getElementById(id).classList.remove('selected'));
  ['radioReveal','radioSecret'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active');
    el.innerHTML = '';
  });
  const sel   = mode === 'reveal' ? 'optReveal'   : 'optSecret';
  const radio = mode === 'reveal' ? 'radioReveal' : 'radioSecret';
  document.getElementById(sel).classList.add('selected');
  const r = document.getElementById(radio);
  r.classList.add('active');
  r.innerHTML = '<div class="share-option-dot"></div>';
}

function buildShareText() {
  const url = window.location.origin + window.location.pathname;
  if (shareMode === 'reveal' && currentWinner)
    return `🗳️ J'ai joué à Présidentielle 2027 — Face à Face !\nMon candidat idéal : ${currentWinner.name}\nEt toi, qui choisirais-tu ? 👉 ${url}`;
  return `🗳️ J'ai joué à Présidentielle 2027 — Face à Face !\nJ'ai mon candidat idéal mais c'est mon secret 🙈\nEt toi, qui choisirais-tu ? 👉 ${url}`;
}

function shareWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank'); }
function copyLink() {
  navigator.clipboard.writeText(buildShareText()).then(() => {
    const el = document.getElementById('copyConfirm');
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 2500);
  });
}
function shareNative() {
  if (navigator.share) navigator.share({ title: 'Présidentielle 2027 — Face à Face', text: buildShareText(), url: window.location.href });
  else copyLink();
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cardLeft')) startGame();
});
