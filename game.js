/* ============================================================
   Présidentielle 2027 — Face à Face
   ============================================================ */

const BACKEND_URL = 'https://candi-date2027.vercel.app';

// ── Candidates ───────────────────────────────────────────────
// photo: Wikipedia Commons URL (thumb 240px) — fallback to initials if broken
const CANDIDATES = [
  // 🔴 Extrême droite
  { name: "Marine Le Pen",            desc: "Dirigeante du RN",                                      cat: "RN",                  color: "#003189",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Le_Pen%2C_Marine-9586_%28cropped%29.jpg/240px-Le_Pen%2C_Marine-9586_%28cropped%29.jpg" },
  { name: "Jordan Bardella",          desc: "Président du RN",                                       cat: "RN",                  color: "#1a3fa0",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/forty/Jordan_Bardella_2022.jpg/240px-Jordan_Bardella_2022.jpg" },
  { name: "Nicolas Dupont-Aignan",    desc: "Ancien candidat à la présidentielle",                                         cat: "Debout la France",    color: "#1a4fa0",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nicolas_Dupont-Aignan_2012.jpg/240px-Nicolas_Dupont-Aignan_2012.jpg" },
  { name: "Éric Zemmour",             desc: "Fondateur de Reconquête",                               cat: "Reconquête",          color: "#8B0000",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/%C3%89ric_Zemmour_%28cropped%29.jpg/240px-%C3%89ric_Zemmour_%28cropped%29.jpg" },
  { name: "Sarah Knafo",              desc: "Députée européenne",         cat: "Reconquête",          color: "#a00000",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Sarah_Knafo_%28cropped%29.jpg/240px-Sarah_Knafo_%28cropped%29.jpg" },
  { name: "Marion Maréchal",          desc: "Présidente d'Identité-Libertés, députée européenne",    cat: "Reconquête",          color: "#c0392b",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Marion_Mar%C3%A9chal-Le_Pen_2017_%28cropped%29.jpg/240px-Marion_Mar%C3%A9chal-Le_Pen_2017_%28cropped%29.jpg" },
  { name: "Robert Ménard",            desc: "Maire de Béziers, co-fondateur de reporters sans frontières",                           cat: "Électron libre",      color: "#7f1d1d",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Robert_M%C3%A9nard_%28cropped%29.jpg/240px-Robert_M%C3%A9nard_%28cropped%29.jpg" },

  // 🔵 Droite
  { name: "Bruno Retailleau",         desc: "Président des LR",                                      cat: "Les Républicains",    color: "#0066cc",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Bruno_Retailleau_2022_%28cropped%29.jpg/240px-Bruno_Retailleau_2022_%28cropped%29.jpg" },
  { name: "Valérie Pécresse",         desc: "Présidente de la région Île-de-France",                 cat: "Les Républicains",    color: "#0055bb",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Val%C3%A9rie_P%C3%A9cresse_%28cropped%29.jpg/240px-Val%C3%A9rie_P%C3%A9cresse_%28cropped%29.jpg" },
  { name: "David Lisnard",            desc: "Maire de Cannes",                                       cat: "Nouvelle Énergie",    color: "#5ba4d4",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/David_Lisnard_%28cropped%29.jpg/240px-David_Lisnard_%28cropped%29.jpg" },
  { name: "Xavier Bertrand",          desc: "Président des Hauts-de-France",                         cat: "Les Républicains",    color: "#004aaa",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Xavier_Bertrand_%28cropped%29.jpg/240px-Xavier_Bertrand_%28cropped%29.jpg" },
  { name: "Dominique de Villepin",    desc: "Ancien Premier ministre",                    cat: "La France Humaniste", color: "#2c3e6b",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Dominique_de_Villepin_%28cropped%29.jpg/240px-Dominique_de_Villepin_%28cropped%29.jpg" },
  { name: "Michel Barnier",           desc: "Ancien Premier ministre, ex-négociateur Brexit",        cat: "Droite indépendante", color: "#34495e",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Michel_Barnier_%28cropped%29.jpg/240px-Michel_Barnier_%28cropped%29.jpg" },
  { name: "Yaël Braun-Pivet",         desc: "Présidente de l'Assemblée nationale",                   cat: "Renaissance",         color: "#d4a800",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ya%C3%ABl_Braun-Pivet_%28cropped%29.jpg/240px-Ya%C3%ABl_Braun-Pivet_%28cropped%29.jpg" },
  { name: "Pierre de Villiers",       desc: "Ancien chef d'état-major des armées",                   cat: "Électron libre",      color: "#374151",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Pierre_de_Villiers_%28cropped%29.jpg/240px-Pierre_de_Villiers_%28cropped%29.jpg" },

  // ⚪ Centre
  { name: "Édouard Philippe",         desc: "Maire du Havre, ancien Premier ministre",               cat: "Horizons",            color: "#4db8ff",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/%C3%89douard_Philippe_-_Gouvernement_Philippe_%282017%29.jpg/240px-%C3%89douard_Philippe_-_Gouvernement_Philippe_%282017%29.jpg" },
  { name: "Gabriel Attal",            desc: "Ancien Premier ministre",                               cat: "Renaissance",         color: "#e6b800",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Gabriel_Attal_%28cropped%29.jpg/240px-Gabriel_Attal_%28cropped%29.jpg" },
  { name: "Gérald Darmanin",          desc: "Ministre de la Justice",                                cat: "Renaissance",         color: "#c9a000",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/G%C3%A9rald_Darmanin_%28cropped%29.jpg/240px-G%C3%A9rald_Darmanin_%28cropped%29.jpg" },
  { name: "Élisabeth Borne",          desc: "Ancienne Première ministre",                            cat: "Indépendante",        color: "#546e7a",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/%C3%89lisabeth_Borne_%28cropped%29.jpg/240px-%C3%89lisabeth_Borne_%28cropped%29.jpg" },
  { name: "Jean Castex",              desc: "Ancien Premier ministre",                               cat: "Indépendant",         color: "#455a64",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Jean_Castex_%28cropped%29.jpg/240px-Jean_Castex_%28cropped%29.jpg" },
  { name: "Didier Migaud",            desc: "Ancien président du Conseil constitutionnel",           cat: "Électron libre",      color: "#546e7a",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Didier_Migaud_%28cropped%29.jpg/240px-Didier_Migaud_%28cropped%29.jpg" },
  { name: "François Molins",          desc: "Procureur",                             cat: "Électron libre",      color: "#455a64",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Fran%C3%A7ois_Molins_%28cropped%29.jpg/240px-Fran%C3%A7ois_Molins_%28cropped%29.jpg" },

  // 🌹 Gauche
  { name: "Jean-Luc Mélenchon",       desc: "Fondateur de LFI",                                      cat: "LFI",                 color: "#cc0000",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/forty/Jean-Luc_M%C3%A9lenchon_%28cropped%29.jpg/240px-Jean-Luc_M%C3%A9lenchon_%28cropped%29.jpg" },
  { name: "Raphaël Glucksmann",       desc: "Député européen, fondateur de Place Publique",          cat: "Place Publique",      color: "#c2006e",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Rapha%C3%ABl_Glucksmann_%28cropped%29.jpg/240px-Rapha%C3%ABl_Glucksmann_%28cropped%29.jpg" },
  { name: "Marine Tondelier",         desc: "Secrétaire nationale des Écologistes",                  cat: "Les Écologistes",     color: "#2e7d32",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Marine_Tondelier_%28cropped%29.jpg/240px-Marine_Tondelier_%28cropped%29.jpg" },
  { name: "François Ruffin",          desc: "Réalisateur, député",                        cat: "Debout !",            color: "#b71c1c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Fran%C3%A7ois_Ruffin_%28cropped%29.jpg/240px-Fran%C3%A7ois_Ruffin_%28cropped%29.jpg" },
  { name: "Clémentine Autain",        desc: "Députée",                                  cat: "L'Après",             color: "#7b1fa2",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Cl%C3%A9mentine_Autain_%28cropped%29.jpg/240px-Cl%C3%A9mentine_Autain_%28cropped%29.jpg" },
  { name: "Fabien Roussel",           desc: "Secrétaire national du PCF",                            cat: "PCF",                 color: "#cc1100",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Fabien_Roussel_%28cropped%29.jpg/240px-Fabien_Roussel_%28cropped%29.jpg" },
  { name: "François Hollande",        desc: "Ancien Président de la République",                     cat: "PS",                  color: "#c2185b",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Fran%C3%A7ois_Hollande_%28cropped%29.jpg/240px-Fran%C3%A7ois_Hollande_%28cropped%29.jpg" },
  { name: "Olivier Faure",            desc: "Premier secrétaire du PS",                              cat: "PS",                  color: "#d81b60",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Olivier_Faure_%28cropped%29.jpg/240px-Olivier_Faure_%28cropped%29.jpg" },
  { name: "Sandrine Rousseau",        desc: "Députée",                                  cat: "Les Écologistes",     color: "#388e3c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Sandrine_Rousseau_%28cropped%29.jpg/240px-Sandrine_Rousseau_%28cropped%29.jpg" },
  { name: "Carole Delga",             desc: "Présidente de la région Occitanie",                     cat: "PS",                  color: "#e91e8c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Carole_Delga_%28cropped%29.jpg/240px-Carole_Delga_%28cropped%29.jpg" },
  { name: "Nathalie Arthaud",         desc: "Ancienne candidate à la présidentielle",                             cat: "Lutte Ouvrière",      color: "#8B0000",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Nathalie_Arthaud_%28cropped%29.jpg/240px-Nathalie_Arthaud_%28cropped%29.jpg" },
  { name: "Philippe Poutou",          desc: "Libraire",                                              cat: "NPA",                 color: "#b71c1c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Philippe_Poutou_%28cropped%29.jpg/240px-Philippe_Poutou_%28cropped%29.jpg" },

  // 🎭 Médias / Divertissement
  { name: "Cyril Hanouna",            desc: "Animateur TV",                             cat: "Électron libre",      color: "#ff6600",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Cyril_Hanouna_%28cropped%29.jpg/240px-Cyril_Hanouna_%28cropped%29.jpg" },
  { name: "Patrick Sébastien",        desc: "Animateur TV, chanteur",                            cat: "Électron libre",      color: "#e65100",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Patrick_S%C3%A9bastien_%28cropped%29.jpg/240px-Patrick_S%C3%A9bastien_%28cropped%29.jpg" },
  { name: "Stéphane Bern",            desc: "Journaliste",                  cat: "Électron libre",      color: "#8d6e63",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/St%C3%A9phane_Bern_%28cropped%29.jpg/240px-St%C3%A9phane_Bern_%28cropped%29.jpg" },
  { name: "Vincent Lindon",           desc: "Acteur",                                cat: "Électron libre",      color: "#37474f",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Vincent_Lindon_%28cropped%29.jpg/240px-Vincent_Lindon_%28cropped%29.jpg" },
  { name: "Omar Sy",                  desc: "Acteur",                           cat: "Électron libre",      color: "#4e342e",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Omar_Sy_%28cropped%29.jpg/240px-Omar_Sy_%28cropped%29.jpg" },
  { name: "Jamel Debbouze",           desc: "Humoriste",                               cat: "Électron libre",      color: "#bf360c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Florence_Foresti_%28cropped%29.jpg/240px-Florence_Foresti_%28cropped%29.jpg" },
  { name: "Guillaume Meurice",        desc: "Humoriste",                                             cat: "Électron libre",      color: "#6a1b9a",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Guillaume_Meurice_%28cropped%29.jpg/240px-Guillaume_Meurice_%28cropped%29.jpg" },
  { name: "Natacha Polony",           desc: "Éditorialiste, directrice de rédaction",                cat: "Électron libre",      color: "#5c4033",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Natacha_Polony_%28cropped%29.jpg/240px-Natacha_Polony_%28cropped%29.jpg" },
  { name: "Inoxtag",                  desc: "YouTubeur",                                             cat: "Électron libre",      color: "#e53935",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Inoxtag_%28cropped%29.jpg/240px-Inoxtag_%28cropped%29.jpg" },
  { name: "Tibo InShape",             desc: "YouTubeur",                                             cat: "Électron libre",      color: "#d32f2f",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Tibo_InShape_%28cropped%29.jpg/240px-Tibo_InShape_%28cropped%29.jpg" },

  // ⚽ Sport
  { name: "Zinédine Zidane",          desc: "Légende du football",                           cat: "Électron libre",      color: "#1565c0",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Zinedine_Zidane_2019_%28cropped%29.jpg/240px-Zinedine_Zidane_2019_%28cropped%29.jpg" },
  { name: "Tony Parker",              desc: "Champion NBA, entrepreneur",                            cat: "Électron libre",      color: "#0d47a1",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Tony_Parker_%28cropped%29.jpg/240px-Tony_Parker_%28cropped%29.jpg" },
  { name: "Amélie Mauresmo",          desc: "Championne de tennis, dirigeante sportive",             cat: "Électron libre",      color: "#1976d2",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Am%C3%A9lie_Mauresmo_%28cropped%29.jpg/240px-Am%C3%A9lie_Mauresmo_%28cropped%29.jpg" },
  { name: "Teddy Riner",              desc: "Champion de judo",                         cat: "Électron libre",      color: "#283593",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Teddy_Riner_%28cropped%29.jpg/240px-Teddy_Riner_%28cropped%29.jpg" },

  // 💼 Affaires
  { name: "Christine Lagarde",        desc: "Présidente de la BCE, ex-FMI",                         cat: "Électron libre",      color: "#8B6914",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Christine_Lagarde_%28cropped%29.jpg/240px-Christine_Lagarde_%28cropped%29.jpg" },
  { name: "Xavier Niel",              desc: "Fondateur de Free",                  cat: "Électron libre",      color: "#455a64",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Xavier_Niel_%28cropped%29.jpg/240px-Xavier_Niel_%28cropped%29.jpg" },
  { name: "Bernard Arnault",          desc: "PDG de LVMHe",             cat: "Électron libre",      color: "#3e2723",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/sixty/Bernard_Arnault_%28cropped%29.jpg/240px-Bernard_Arnault_%28cropped%29.jpg" },
  { name: "Michel-Édouard Leclerc",   desc: "Président des magasins Leclerc",                      cat: "Électron libre",      color: "#e53935",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Michel-%C3%89douard_Leclerc_%28cropped%29.jpg/240px-Michel-%C3%89douard_Leclerc_%28cropped%29.jpg" },
  { name: "Jean-Dominique Senard",    desc: "Président de Renault",                                  cat: "Électron libre",      color: "#b71c1c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Jean-Dominique_Senard_%28cropped%29.jpg/240px-Jean-Dominique_Senard_%28cropped%29.jpg" },
  { name: "Laurent Berger",           desc: "Ex-secrétaire général de la CFDT",                     cat: "Électron libre",      color: "#ad1457",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Laurent_Berger_%28cropped%29.jpg/240px-Laurent_Berger_%28cropped%29.jpg" },
  { name: "Matthieu Pigasse",         desc: "Banquier d'affaires, patron de presse",                 cat: "Électron libre",      color: "#1a237e",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Matthieu_Pigasse_%28cropped%29.jpg/240px-Matthieu_Pigasse_%28cropped%29.jpg" },
  { name: "Oussama Amar",             desc: "Entrepreneur",                                          cat: "Électron libre",      color: "#00695c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Oussama_Amar_%28cropped%29.jpg/240px-Oussama_Amar_%28cropped%29.jpg" },

  // 🌍 Société civile
  { name: "José Bové",                desc: "Syndicaliste agricole, altermondialiste",               cat: "Électron libre",      color: "#4a7c40",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Jos%C3%A9_Bov%C3%A9_%28cropped%29.jpg/240px-Jos%C3%A9_Bov%C3%A9_%28cropped%29.jpg" },
  { name: "Noël Mamère",              desc: "Ancien député écologiste, journaliste",                 cat: "Électron libre",      color: "#388e3c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/No%C3%ABl_Mam%C3%A8re_%28cropped%29.jpg/240px-No%C3%ABl_Mam%C3%A8re_%28cropped%29.jpg" },
  { name: "Rokhaya Diallo",           desc: "Militante",                    cat: "Électron libre",      color: "#6a1b9a",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Rokhaya_Diallo_%28cropped%29.jpg/240px-Rokhaya_Diallo_%28cropped%29.jpg" },
  { name: "Jean Lassalle",            desc: "Ancien candidat à l'élection présidentielle",           cat: "Électron libre",      color: "#78350f",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Jean_Lassalle_%28cropped%29.jpg/240px-Jean_Lassalle_%28cropped%29.jpg" },

  // 🎓 Intellectuels / Experts
  { name: "Jean-Marc Jancovici",      desc: "Fondateur de Carbon4",                             cat: "Électron libre",      color: "#1b5e20",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jean-Marc_Jancovici_%28cropped%29.jpg/240px-Jean-Marc_Jancovici_%28cropped%29.jpg" },
  { name: "Jean Tirole",              desc: "Prix Nobel d'économie",                                cat: "Électron libre",      color: "#004d40",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Jean_Tirole_%28cropped%29.jpg/240px-Jean_Tirole_%28cropped%29.jpg" },
  { name: "François Villeroy de Galhau", desc: "Gouverneur de la Banque de France",                 cat: "Électron libre",      color: "#006064",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Fran%C3%A7ois_Villeroy_de_Galhau_%28cropped%29.jpg/240px-Fran%C3%A7ois_Villeroy_de_Galhau_%28cropped%29.jpg" },
  { name: "Thomas Piketty",           desc: "Économiste",               cat: "Électron libre",      color: "#00695c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Thomas_Piketty_%28cropped%29.jpg/240px-Thomas_Piketty_%28cropped%29.jpg" },
  { name: "Gabriel Zucman",           desc: "Économiste",         cat: "Électron libre",      color: "#00796b",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Gabriel_Zucman_%28cropped%29.jpg/240px-Gabriel_Zucman_%28cropped%29.jpg" },
  { name: "Aurélien Barrau",          desc: "Astrophysiciene",                  cat: "Électron libre",      color: "#1a237e",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Aur%C3%A9lien_Barrau_%28cropped%29.jpg/240px-Aur%C3%A9lien_Barrau_%28cropped%29.jpg" },
  { name: "Raphaël Enthoven",         desc: "Chroniqueur philo",                              cat: "Électron libre",      color: "#4527a0",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Rapha%C3%ABl_Enthoven_%28cropped%29.jpg/240px-Rapha%C3%ABl_Enthoven_%28cropped%29.jpg" },
  { name: "Philippe Aghion",          desc: "Économiste",                                           cat: "Électron libre",      color: "#0d47a1",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Philippe_Aghion_%28cropped%29.jpg/240px-Philippe_Aghion_%28cropped%29.jpg" },
  { name: "Bruno Le Maire",           desc: "Auteur érotique",                                      cat: "Électron libre",      color: "#78716c",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Bruno_Le_Maire_%28cropped%29.jpg/240px-Bruno_Le_Maire_%28cropped%29.jpg" },
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

// ── Photo loading with fallback ───────────────────────────────
function setPhoto(imgEl, avatarEl, candidate) {
  avatarEl.textContent   = initials(candidate.name);
  avatarEl.style.background = candidate.color;

  if (candidate.photo) {
    imgEl.src = candidate.photo;
    imgEl.alt = candidate.name;
    imgEl.classList.remove('hidden');

    imgEl.onload  = () => { imgEl.classList.remove('hidden'); };
    imgEl.onerror = () => {
      imgEl.classList.add('hidden');
      // avatar already visible underneath
    };
  } else {
    imgEl.classList.add('hidden');
  }
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
