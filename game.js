/* ============================================================
   Candi-date 2027 — Face à Face
   ============================================================ */

const BACKEND_URL = 'https://www.candi-date.fr';

// ── Wikipedia photo cache ─────────────────────────────────────
const photoCache = {};

async function fetchWikipediaPhoto(name) {
  if (photoCache[name] !== undefined) return photoCache[name];
  photoCache[name] = null;
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
      if (thumb) { photoCache[name] = thumb; return thumb; }
    } catch (e) {}
  }
  return null;
}

// ── Candidates ───────────────────────────────────────────────
const CANDIDATES = [
  // 🔴 Extrême droite
  { name: "Marine Le Pen",               desc: "Dirigeante du RN",                                           cat: "RN",                  color: "#003189",
    bio: "Fille de Jean-Marie Le Pen, fondateur du Front National, elle a transformé le parti en Rassemblement National et l'a hissé au second tour de la présidentielle en 2017 et 2022. Figure centrale de la droite radicale française." },
  { name: "Jordan Bardella",             desc: "Président du RN",                                            cat: "RN",                  color: "#1a3fa0",
    bio: "Président du RN depuis 2022, il incarne le renouveau du parti auprès des jeunes. Député européen, il a failli devenir Premier ministre en 2024 après la dissolution de l'Assemblée nationale." },
  { name: "Nicolas Dupont-Aignan",       desc: "Ancien candidat à la présidentielle",                        cat: "Debout la France",    color: "#1a4fa0",
    bio: "Ancien député et maire de Yerres, il a fondé Debout la France et s'est présenté plusieurs fois à la présidentielle. Souverainiste convaincu, il défend une France indépendante de l'UE et de l'OTAN." },
  { name: "Éric Zemmour",                desc: "Fondateur de Reconquête",                                    cat: "Reconquête",          color: "#8B0000",
    bio: "Ancien journaliste et polémiste, il a créé Reconquête en 2021 et obtenu 7% à la présidentielle 2022. Connu pour ses positions très à droite sur l'immigration et l'identité nationale." },
  { name: "Sarah Knafo",                 desc: "Députée européenne",                                         cat: "Reconquête",          color: "#a00000",
    bio: "Compagne d'Éric Zemmour et ancienne conseillère politique, elle est aujourd'hui députée européenne pour Reconquête. Juriste de formation, elle est l'une des figures montantes de la droite radicale." },
  { name: "Marion Maréchal",             desc: "Présidente d'Identité-Libertés, députée européenne",         cat: "Reconquête",          color: "#c0392b",
    bio: "Petite-fille de Jean-Marie Le Pen, elle fut la plus jeune députée de France en 2012. Après avoir quitté le RN, elle a rejoint Reconquête dont elle préside le mouvement Identité-Libertés." },
  { name: "Robert Ménard",               desc: "Maire de Béziers, co-fondateur de Reporters sans frontières",cat: "Électron libre",      color: "#7f1d1d",
    bio: "Journaliste et co-fondateur de Reporters sans frontières, il est devenu maire de Béziers en 2014 avec le soutien du RN. Connu pour ses positions provocatrices sur l'immigration et la sécurité." },

  // 🔵 Droite
  { name: "Bruno Retailleau",            desc: "Président des LR",                                           cat: "Les Républicains",    color: "#0066cc",
    bio: "Sénateur de Vendée et président du groupe LR au Sénat, il est devenu ministre de l'Intérieur en 2024. Représente l'aile droite des Républicains sur les questions régaliennes." },
  { name: "Valérie Pécresse",            desc: "Présidente de la région Île-de-France",                      cat: "Les Républicains",    color: "#0055bb",
    bio: "Présidente de la région Île-de-France depuis 2015, elle a été la candidate LR à la présidentielle 2022. Ancienne ministre du Budget et de l'Enseignement supérieur." },
  { name: "David Lisnard",               desc: "Maire de Cannes",                                            cat: "Nouvelle Énergie",    color: "#5ba4d4",
    bio: "Maire de Cannes depuis 2014 et président de l'Association des maires de France. Il a fondé le mouvement Nouvelle Énergie pour proposer une droite libérale et décentralisatrice." },
  { name: "Xavier Bertrand",             desc: "Président des Hauts-de-France",                              cat: "Les Républicains",    color: "#004aaa",
    bio: "Président de la région Hauts-de-France depuis 2015, ancien ministre de la Santé et du Travail. Figure de la droite sociale, il a quitté LR avant d'y revenir." },
  { name: "Dominique de Villepin",       desc: "Ancien Premier ministre",                                    cat: "La France Humaniste", color: "#2c3e6b",
    bio: "Ancien Premier ministre de Jacques Chirac (2005-2007), connu pour son discours contre la guerre en Irak à l'ONU en 2003. A fondé La France Humaniste pour une politique plus sociale et internationale." },
  { name: "Michel Barnier",              desc: "Ancien Premier ministre, ex-négociateur Brexit",             cat: "Droite indépendante", color: "#34495e",
    bio: "Ancien commissaire européen et négociateur du Brexit pour l'UE, il a été brièvement Premier ministre en 2024 avant d'être renversé par une motion de censure. Vétéran de la politique française et européenne." },
  { name: "Yaël Braun-Pivet",            desc: "Présidente de l'Assemblée nationale",                        cat: "Renaissance",         color: "#d4a800",
    bio: "Présidente de l'Assemblée nationale depuis 2022, première femme à occuper ce poste. Ancienne avocate, députée Renaissance des Yvelines, proche d'Emmanuel Macron." },
  { name: "Pierre de Villiers",          desc: "Ancien chef d'état-major des armées",                        cat: "Électron libre",      color: "#374151",
    bio: "Ancien chef d'état-major des armées, il a démissionné en 2017 après un désaccord public avec Emmanuel Macron sur le budget de la défense. Depuis, il prône une politique de souveraineté et de réarmement." },

  // ⚪ Centre
  { name: "Édouard Philippe",            desc: "Maire du Havre, ancien Premier ministre",                    cat: "Horizons",            color: "#4db8ff",
    bio: "Premier ministre d'Emmanuel Macron de 2017 à 2020, il est aujourd'hui maire du Havre et président d'Horizons. Régulièrement en tête des sondages pour la présidentielle 2027." },
  { name: "Gabriel Attal",               desc: "Ancien Premier ministre",                                    cat: "Renaissance",         color: "#e6b800",
    bio: "Le plus jeune Premier ministre de la Ve République (2024), ancien porte-parole du gouvernement et ministre de l'Éducation. Aujourd'hui président du groupe des députés Renaissance à l'Assemblée nationale." },
  { name: "Gérald Darmanin",             desc: "Ministre de la Justice",                                     cat: "Renaissance",         color: "#c9a000",
    bio: "Ministre de l'Intérieur de 2020 à 2024, puis ministre de la Justice. Ancien LR rallié à Macron, il représente l'aile droite de la majorité sur les questions sécuritaires." },
  { name: "Élisabeth Borne",             desc: "Ancienne Première ministre",                                 cat: "Indépendante",        color: "#546e7a",
    bio: "Première ministre de 2022 à 2024, première femme à ce poste depuis Édith Cresson. Ingénieure de formation, ancienne ministre du Travail, connue pour sa rigueur et son pragmatisme." },
  { name: "Jean Castex",                 desc: "Ancien Premier ministre",                                    cat: "Indépendant",         color: "#455a64",
    bio: "Premier ministre de 2020 à 2022, il a géré la fin de la crise Covid. Aujourd'hui PDG de la RATP. Proche des territoires, il incarne une droite modérée ralliée au macronisme." },
  { name: "Didier Migaud",               desc: "Ancien président du Conseil constitutionnel",                cat: "Électron libre",      color: "#546e7a",
    bio: "Ancien président de la Cour des comptes et du Conseil constitutionnel, il est aujourd'hui ministre de la Justice. Figure de la gauche modérée reconvertie en haut fonctionnaire indépendant." },
  { name: "François Molins",             desc: "Procureur",                                                  cat: "Électron libre",      color: "#455a64",
    bio: "Ancien procureur de la République de Paris, il a dirigé les enquêtes sur les attentats de 2015. Aujourd'hui procureur général près la Cour de cassation, symbole de l'indépendance judiciaire." },
  { name: "Marc Fesneau",                desc: "Président du groupe MoDem à l'Assemblée",                    cat: "MoDem",               color: "#ff8c00",
    bio: "Député du Loir-et-Cher et figure centrale du MoDem, il a été ministre de l'Agriculture de 2022 à 2024. Proche de François Bayrou, il représente le centre libéral et rural." },
  { name: "Patrick Mignola",             desc: "Ancien président du groupe MoDem à l'Assemblée",             cat: "MoDem",               color: "#e07800",
    bio: "Député de Savoie, il a été maire pendant 16 ans et ministre des Relations avec le Parlement. Ancien président du groupe des députés MoDem à l'Assemblée nationale, il est l'une des figures centrales du mouvement de François Bayrou." },
  { name: "Jean-Noël Barrot",            desc: "Ministre des Affaires étrangères",                           cat: "MoDem",               color: "#d06800",
    bio: "Fils de Jacques Barrot, ancien commissaire européen, il est ministre des Affaires étrangères depuis 2024. Député MoDem spécialisé dans le numérique et les affaires européennes." },

  // 🌹 Gauche
  { name: "Jean-Luc Mélenchon",          desc: "Fondateur de LFI",                                           cat: "LFI",                 color: "#cc0000",
    bio: "Fondateur de La France Insoumise en 2016, il a obtenu 22% à la présidentielle 2022, frôlant le second tour. Figure charismatique et controversée de la gauche radicale française." },
  { name: "Manuel Bompard",              desc: "Coordinateur de LFI",                                        cat: "LFI",                 color: "#bb0000",
    bio: "Coordinateur national de LFI et bras droit de Mélenchon, il a été député des Bouches-du-Rhône. Technicien de la politique, il est l'un des architectes de la stratégie électorale insoumise." },
  { name: "Clémence Guetté",             desc: "Députée LFI",                                                cat: "LFI",                 color: "#aa0000",
    bio: "Députée LFI et co-présidente de l'Institut La Boétie, le think tank de La France Insoumise. Elle est l'une des voix intellectuelles du mouvement insoumis." },
  { name: "Raphaël Glucksmann",          desc: "Député européen, fondateur de Place Publique",               cat: "Place Publique",      color: "#c2006e",
    bio: "Fils du philosophe André Glucksmann, il a fondé Place Publique et mené la liste PS-PP aux européennes 2024 avec un score surprise de 14%. Incarne une gauche pro-européenne et sociale-démocrate." },
  { name: "Marine Tondelier",            desc: "Secrétaire nationale des Écologistes",                       cat: "Les Écologistes",     color: "#2e7d32",
    bio: "Secrétaire nationale des Écologistes depuis 2022, elle a redynamisé le parti après des années de divisions. Ancienne conseillère municipale d'Hénin-Beaumont, connue pour son ton direct et son engagement écologiste." },
  { name: "François Ruffin",             desc: "Réalisateur, député",                                        cat: "Debout !",            color: "#b71c1c",
    bio: "Journaliste et réalisateur (Merci Patron !), ancien député LFI de la Somme, il a fondé son propre mouvement Debout ! après avoir quitté LFI. Défenseur des classes populaires et figure atypique de la gauche." },
  { name: "Clémentine Autain",           desc: "Députée",                                                    cat: "L'Après",             color: "#7b1fa2",
    bio: "Ancienne députée LFI de Seine-Saint-Denis, féministe engagée et figure de la gauche culturelle. Elle a fondé le collectif L'Après pour refonder la gauche au-delà de LFI." },
  { name: "Fabien Roussel",              desc: "Secrétaire national du PCF",                                 cat: "PCF",                 color: "#cc1100",
    bio: "Secrétaire national du PCF depuis 2018 et maire de Saint-Amand-les-Eaux. Il s'est présenté à l'élection présidentielle et défend une gauche populaire attachée au travail, au nucléaire et à la laïcité." },
  { name: "François Hollande",           desc: "Ancien Président de la République",                          cat: "PS",                  color: "#c2185b",
    bio: "Président de la République de 2012 à 2017, il est revenu en politique comme député de Corrèze en 2024. Son quinquennat reste controversé mais il incarne une gauche de gouvernement modérée." },
  { name: "Olivier Faure",               desc: "Premier secrétaire du PS",                                   cat: "PS",                  color: "#d81b60",
    bio: "Premier secrétaire du PS depuis 2018, il a réussi à maintenir le parti en vie malgré des années difficiles. Artisan de l'union de la gauche au sein du NFP aux législatives 2024." },
  { name: "Sandrine Rousseau",           desc: "Députée",                                                    cat: "Les Écologistes",     color: "#388e3c",
    bio: "Députée écologiste de Paris, économiste de formation, elle incarne l'aile féministe et radicale des Verts. Très présente médiatiquement, elle défend une écologie décoloniale et féministe." },
  { name: "Carole Delga",                desc: "Présidente de la région Occitanie",                          cat: "PS",                  color: "#e91e8c",
    bio: "Présidente de la région Occitanie depuis 2015, elle représente l'aile territoriale et modérée du PS. Opposée à la stratégie d'union avec LFI, elle défend un socialisme de gestion." },
  { name: "Guillaume Lacroix",           desc: "Président du Parti radical de gauche",                       cat: "PRG",                 color: "#e8334a",
    bio: "Président du Parti radical de gauche, formation historique de la gauche modérée. Avocat et élu local, il défend une ligne républicaine et laïque entre PS et centre." },
  { name: "Nathalie Arthaud",            desc: "Ancienne candidate à la présidentielle",                     cat: "Lutte Ouvrière",      color: "#8B0000",
    bio: "Porte-parole de Lutte Ouvrière et professeure de sciences économiques, elle se présente à chaque présidentielle depuis 2007. Défend un communisme ouvrier et révolutionnaire intransigeant." },
  { name: "Philippe Poutou",             desc: "Libraire",                                                   cat: "NPA",                 color: "#b71c1c",
    bio: "Ouvrier à l'usine Ford de Bordeaux devenu figure du NPA, il s'est présenté trois fois à la présidentielle. Connu pour ses interventions décalées lors des débats télévisés." },

  // 🎭 Médias / Divertissement
  { name: "Cyril Hanouna",               desc: "Animateur TV",                                               cat: "Électron libre",      color: "#ff6600",
    bio: "Animateur star de C8 avec TPMP, il est l'une des personnalités les plus influentes et controversées des médias français. Proche de certains responsables politiques, il est souvent accusé de mélanger divertissement et politique." },
  { name: "Patrick Sébastien",           desc: "Animateur TV, chanteur",                                     cat: "Électron libre",      color: "#e65100",
    bio: "Animateur emblématique des années 90-2000 sur France 2, chanteur et humoriste. Figure de la France populaire et rurale, il a été écarté de la télévision publique en 2018." },
  { name: "Stéphane Bern",               desc: "Journaliste",                                                cat: "Électron libre",      color: "#8d6e63",
    bio: "Journaliste, animateur et écrivain, grand passionné de monarchies et de patrimoine. Nommé par Macron 'Monsieur Patrimoine', il a lancé le Loto du patrimoine pour sauver des monuments historiques." },
  { name: "Vincent Lindon",              desc: "Acteur",                                                     cat: "Électron libre",      color: "#37474f",
    bio: "Acteur césarisé, figure du cinéma social français (La Loi du marché, En guerre). Engagé politiquement à gauche, il préside régulièrement des jurys de festivals et prend position sur les grandes causes sociales." },
  { name: "Omar Sy",                     desc: "Acteur",                                                     cat: "Électron libre",      color: "#4e342e",
    bio: "Acteur révélé par Intouchables (2011), il est aujourd'hui l'une des stars françaises les plus connues à Hollywood grâce à la série Lupin. Engagé sur les questions sociales et raciales, il a quitté la France pour les États-Unis." },
  { name: "Jamel Debbouze",              desc: "Humoriste",                                                  cat: "Électron libre",      color: "#bf360c",
    bio: "Humoriste et entrepreneur, figure du stand-up français et fondateur du Marrakech du rire. L'un des comiques les plus populaires de France, il a aussi une carrière au cinéma et défend les artistes des quartiers." },
  { name: "Guillaume Meurice",           desc: "Humoriste",                                                  cat: "Électron libre",      color: "#6a1b9a",
    bio: "Humoriste de France Inter, connu pour ses chroniques satiriques mordantes. Son licenciement en 2024 après une blague controversée sur Netanyahou a déclenché un vif débat sur la liberté d'expression dans les médias publics." },
  { name: "Natacha Polony",              desc: "Éditorialiste, directrice de rédaction",                     cat: "Électron libre",      color: "#5c4033",
    bio: "Journaliste et essayiste, directrice de la rédaction de Marianne depuis 2018. Défend une ligne souverainiste de gauche, critique des médias dominants et du libéralisme économique et culturel." },
  { name: "Inoxtag",                     desc: "YouTubeur",                                                  cat: "Électron libre",      color: "#e53935",
    bio: "Youtubeur français avec plus de 20 millions d'abonnés, il a réalisé en 2024 l'ascension de l'Everest documentée dans Kaizen, film visionné par des millions de personnes. Symbole de la nouvelle génération des créateurs de contenu." },
  { name: "Tibo InShape",                desc: "YouTubeur",                                                  cat: "Électron libre",      color: "#d32f2f",
    bio: "Youtubeur spécialisé dans le fitness et le sport avec plus de 20 millions d'abonnés. L'une des personnalités les plus suivies de la plateforme en France, il a diversifié ses activités dans l'entrepreneuriat." },

  // ⚽ Sport
  { name: "Zinédine Zidane",             desc: "Légende du football",                                        cat: "Électron libre",      color: "#1565c0",
    bio: "Triple Ballon d'Or, champion du monde 1998 et champion d'Europe 2000, considéré comme l'un des meilleurs joueurs de l'histoire. Après une carrière d'entraîneur au Real Madrid, il reste la personnalité française la plus aimée dans le monde." },
  { name: "Tony Parker",                 desc: "Champion NBA, entrepreneur",                                 cat: "Électron libre",      color: "#0d47a1",
    bio: "Quadruple champion NBA avec les San Antonio Spurs, MVP des Finales en 2007. Après sa carrière de joueur, il est devenu entrepreneur et propriétaire de clubs sportifs, dont l'ASVEL à Lyon." },
  { name: "Amélie Mauresmo",             desc: "Championne de tennis, dirigeante sportive",                  cat: "Électron libre",      color: "#1976d2",
    bio: "Double championne du Grand Chelem (2006), ancienne numéro 1 mondiale. Elle a ensuite entraîné Andy Murray et Novak Djokovic avant de devenir directrice du tournoi de Roland-Garros." },
  { name: "Teddy Riner",                 desc: "Champion de judo",                                          cat: "Électron libre",      color: "#283593",
    bio: "Recordman de titres mondiaux en judo (11 titres), triple champion olympique. L'un des sportifs français les plus palmés de l'histoire, il a porté la flamme olympique lors des JO de Paris 2024." },

  // 💼 Affaires
  { name: "Christine Lagarde",           desc: "Présidente de la BCE, ex-FMI",                              cat: "Électron libre",      color: "#8B6914",
    bio: "Ancienne ministre de l'Économie sous Sarkozy, puis directrice générale du FMI pendant 8 ans. Aujourd'hui présidente de la Banque centrale européenne, l'une des femmes les plus influentes du monde." },
  { name: "Xavier Niel",                 desc: "Fondateur de Free",                                         cat: "Électron libre",      color: "#455a64",
    bio: "Fondateur de Free qui a révolutionné le marché des télécoms en France. Milliardaire, il a aussi fondé l'école 42, investi dans des centaines de startups et racheté Le Monde." },
  { name: "Bernard Arnault",             desc: "PDG de LVMH",                                               cat: "Électron libre",      color: "#3e2723",
    bio: "PDG de LVMH, le premier groupe mondial de luxe. Régulièrement classé parmi les hommes les plus riches du monde, il symbolise le capitalisme français à la fois admiré et critiqué." },
  { name: "Michel-Édouard Leclerc",      desc: "Président des magasins Leclerc",                            cat: "Électron libre",      color: "#e53935",
    bio: "Président des centres E.Leclerc, il est l'une des voix les plus médiatiques du commerce français. Défenseur du pouvoir d'achat et pourfendeur des marges de la grande distribution." },
  { name: "Jean-Dominique Senard",       desc: "Président de Renault",                                      cat: "Électron libre",      color: "#b71c1c",
    bio: "Président du conseil d'administration de Renault, ancien PDG de Michelin. Représente un capitalisme industriel à la française, attaché aux territoires et au dialogue social." },
  { name: "Laurent Berger",              desc: "Ex-secrétaire général de la CFDT",                          cat: "Électron libre",      color: "#ad1457",
    bio: "Ancien secrétaire général de la CFDT de 2012 à 2023, il a incarné un syndicalisme réformiste et pragmatique. Figure du dialogue social, très impliqué lors de la réforme des retraites de 2023." },
  { name: "Matthieu Pigasse",            desc: "Banquier d'affaires, patron de presse",                     cat: "Électron libre",      color: "#1a237e",
    bio: "Banquier d'affaires chez Lazard, il est aussi actionnaire et administrateur de médias (Le Monde, Les Inrocks). Proche de la gauche, il incarne la figure du financier engagé." },
  { name: "Oussama Ammar",               desc: "Entrepreneur",                                              cat: "Électron libre",      color: "#00695c",
    bio: "Co-fondateur de The Family, accélérateur de startups qui a accompagné des centaines d'entrepreneurs européens. Figure controversée de l'écosystème startup français, il prône un capitalisme entrepreneurial radical." },

  // 🌍 Société civile
  { name: "José Bové",                   desc: "Syndicaliste agricole, altermondialiste",                   cat: "Électron libre",      color: "#4a7c40",
    bio: "Ancien éleveur et syndicaliste agricole, il s'est rendu célèbre en démontant un McDonald's à Millau en 1999. Ancien député européen Europe Écologie, il incarne la résistance altermondialiste et paysanne." },
  { name: "Noël Mamère",                 desc: "Ancien député écologiste, journaliste",                     cat: "Électron libre",      color: "#388e3c",
    bio: "Ancien journaliste de télévision reconverti en politique, il a été maire de Bègles et député écologiste. Premier maire à avoir célébré un mariage homosexuel en France en 2004, avant que cela soit légal." },
  { name: "Rokhaya Diallo",              desc: "Militante",                                                 cat: "Électron libre",      color: "#6a1b9a",
    bio: "Journaliste, réalisatrice et militante antiraciste, elle est l'une des voix les plus connues du féminisme intersectionnel en France. Chroniqueuse dans de nombreux médias, elle est aussi auteure de plusieurs essais sur le racisme." },
  { name: "Jean Lassalle",               desc: "Ancien candidat à l'élection présidentielle",               cat: "Électron libre",      color: "#78350f",
    bio: "Ancien député des Pyrénées-Atlantiques, il s'est illustré par une grève de la faim et une marche à pied à travers la France. Candidat à plusieurs présidentielles, il incarne la France rurale et périphérique avec un style unique." },

  // 🎓 Intellectuels / Experts
  { name: "Jean-Marc Jancovici",         desc: "Fondateur de Carbon4",                                     cat: "Électron libre",      color: "#1b5e20",
    bio: "Ingénieur et consultant, fondateur du cabinet Carbone 4 et co-fondateur du Shift Project. Vulgarisateur reconnu sur les questions énergie-climat, il plaide pour une décroissance énergétique assumée et le retour au nucléaire." },
  { name: "Jean Tirole",                 desc: "Prix Nobel d'économie",                                    cat: "Électron libre",      color: "#004d40",
    bio: "Prix Nobel d'économie 2014, professeur à l'École d'économie de Toulouse. Ses travaux sur la régulation des marchés et les comportements des entreprises font référence dans le monde entier." },
  { name: "François Villeroy de Galhau", desc: "Gouverneur de la Banque de France",                        cat: "Électron libre",      color: "#006064",
    bio: "Gouverneur de la Banque de France depuis 2015 et membre du Conseil des gouverneurs de la BCE. Ancien haut fonctionnaire et banquier, il est l'une des voix les plus écoutées sur la politique monétaire européenne." },
  { name: "Thomas Piketty",              desc: "Économiste",                                               cat: "Électron libre",      color: "#00695c",
    bio: "Économiste mondialement connu pour son livre Le Capital au XXIe siècle (2013), traduit dans 40 langues. Ses travaux sur les inégalités de revenus et de patrimoine ont influencé le débat politique mondial." },
  { name: "Gabriel Zucman",              desc: "Économiste",                                               cat: "Électron libre",      color: "#00796b",
    bio: "Économiste spécialisé dans l'évasion fiscale et les paradis fiscaux, élève de Piketty. Professeur à Berkeley, il a contribué à des rapports européens sur la taxation des ultra-riches." },
  { name: "Aurélien Barrau",             desc: "Astrophysicien",                                           cat: "Électron libre",      color: "#1a237e",
    bio: "Astrophysicien au CNRS, spécialiste des trous noirs et de la cosmologie. Très présent dans le débat public, il allie une carrière scientifique reconnue à un militantisme écologiste radical." },
  { name: "Raphaël Enthoven",            desc: "Chroniqueur philo",                                        cat: "Électron libre",      color: "#4527a0",
    bio: "Philosophe, chroniqueur et animateur d'émissions culturelles, ancien professeur de philosophie en classes préparatoires. Défenseur acharné de la liberté d'expression et critique du politiquement correct." },
  { name: "Philippe Aghion",             desc: "Économiste",                                               cat: "Électron libre",      color: "#0d47a1",
    bio: "Économiste franco-américain, professeur au Collège de France et à la London School of Economics. Spécialiste de la théorie de la croissance et de l'innovation, conseiller de plusieurs gouvernements européens." },
  { name: "Bruno Le Maire",              desc: "Auteur érotique",                                          cat: "Électron libre",      color: "#78716c",
    bio: "Ancien ministre de l'Économie de 2017 à 2024, l'un des ministres les plus longtemps en poste sous Macron. A aussi publié plusieurs romans, dont certains à caractère érotique, ce qui lui a valu quelques quolibets." },
];

// ── State ─────────────────────────────────────────────────────
let queue          = [];
let leftCandidate  = null;
let rightCandidate = null;
let totalCandidates = 0;
let currentWinner  = null;
let gameVotes      = {};
let history        = [];

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

// ── Photo loading ─────────────────────────────────────────────
const photoPromiseCache = {};

function getPhotoUrl(name) {
  if (!photoPromiseCache[name]) {
    photoPromiseCache[name] = fetchWikipediaPhoto(name);
  }
  return photoPromiseCache[name];
}

function setPhoto(imgEl, avatarEl, candidate) {
  avatarEl.textContent      = initials(candidate.name);
  avatarEl.style.background = candidate.color;
  imgEl.classList.remove('loaded');
  imgEl.src = '';
  getPhotoUrl(candidate.name).then(url => {
    if (!url) return;
    if (imgEl.src === url) { imgEl.classList.add('loaded'); return; }
    imgEl.onload  = () => imgEl.classList.add('loaded');
    imgEl.onerror = () => imgEl.classList.remove('loaded');
    imgEl.src = url;
  });
}

// ── Info popup ────────────────────────────────────────────────
let currentInfoCandidate = null;

function openInfoPopup(candidate, event) {
  event.stopPropagation();
  currentInfoCandidate = candidate;

  const popup = document.getElementById('infoPopup');
  const overlay = document.getElementById('infoOverlay');

  // Set avatar
  const avatarEl = document.getElementById('infoAvatar');
  avatarEl.textContent = initials(candidate.name);
  avatarEl.style.background = candidate.color;

  // Set photo
  const imgEl = document.getElementById('infoImg');
  imgEl.classList.remove('loaded');
  imgEl.src = '';
  getPhotoUrl(candidate.name).then(url => {
    if (!url) return;
    imgEl.onload  = () => imgEl.classList.add('loaded');
    imgEl.onerror = () => imgEl.classList.remove('loaded');
    imgEl.src = url;
  });

  document.getElementById('infoName').textContent = candidate.name;
  document.getElementById('infoSubtitle').textContent = candidate.cat + ' · ' + candidate.desc;
  document.getElementById('infoBio').textContent = candidate.bio || '';

  overlay.style.display = 'flex';
}

function closeInfoPopup() {
  document.getElementById('infoOverlay').style.display = 'none';
}

// ── Render card ───────────────────────────────────────────────
function renderCard(side, candidate) {
  const L = side === 'left';
  const imgEl    = document.getElementById(L ? 'imgLeft'    : 'imgRight');
  const avatarEl = document.getElementById(L ? 'avatarLeft' : 'avatarRight');
  const nameEl   = document.getElementById(L ? 'nameLeft'   : 'nameRight');
  const descEl   = document.getElementById(L ? 'descLeft'   : 'descRight');
  const badgeEl  = document.getElementById(L ? 'badgeLeft'  : 'badgeRight');
  const infoBtn  = document.getElementById(L ? 'infoBtnLeft': 'infoBtnRight');

  setPhoto(imgEl, avatarEl, candidate);
  nameEl.textContent = candidate.name;
  descEl.textContent = candidate.desc;
  badgeEl.textContent = candidate.cat;
  badgeEl.setAttribute('style', getBadgeStyle(candidate.color));

  // Update info button
  if (infoBtn) {
    infoBtn.onclick = (e) => openInfoPopup(candidate, e);
  }
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
  history         = [];
  CANDIDATES.forEach(c => { gameVotes[c.name] = { wins: 0, opponents: [] }; });

  leftCandidate  = queue.shift();
  rightCandidate = queue.shift();

  [leftCandidate, rightCandidate, ...queue.slice(0, 4)].forEach(c => getPhotoUrl(c.name));

  renderCard('left',  leftCandidate);
  renderCard('right', rightCandidate);

  document.getElementById('cardLeft').onclick  = () => handleVote('left');
  document.getElementById('cardRight').onclick = () => handleVote('right');
  updatePrevBtn();
  updateProgress();
}

// ── History ───────────────────────────────────────────────────
function updatePrevBtn() {
  ['prevBtnDesktop', 'prevBtnMobile'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    if (history.length > 0) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });
}

function goBack() {
  if (history.length === 0) return;
  const prev = history.pop();
  gameVotes[prev.winner.name].wins = Math.max(0, (gameVotes[prev.winner.name].wins || 0) - 1);
  gameVotes[prev.winner.name].opponents.pop();
  leftCandidate  = prev.left;
  rightCandidate = prev.right;
  queue          = prev.queueSnapshot;
  renderCard('left',  leftCandidate);
  renderCard('right', rightCandidate);
  updatePrevBtn();
  updateProgress();
}

// ── Vote ──────────────────────────────────────────────────────
function handleVote(side) {
  const winner      = side === 'left' ? leftCandidate : rightCandidate;
  const loserCardId = side === 'left' ? 'cardRight'   : 'cardLeft';
  const loserCard   = document.getElementById(loserCardId);

  history.push({ left: leftCandidate, right: rightCandidate, winner, queueSnapshot: [...queue] });

  const loser = side === 'left' ? rightCandidate : leftCandidate;
  gameVotes[winner.name].wins = (gameVotes[winner.name].wins || 0) + 1;
  gameVotes[winner.name].opponents.push(loser.name);

  loserCard.classList.add('card-exit');
  document.getElementById('cardLeft').style.pointerEvents  = 'none';
  document.getElementById('cardRight').style.pointerEvents = 'none';

  setTimeout(() => {
    loserCard.classList.remove('card-exit');

    if (queue.length === 0) {
      submitGameResult(winner);
      showVictory(winner);
      return;
    }

    leftCandidate  = winner;
    rightCandidate = queue.shift();

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
    updatePrevBtn();
  }, 300);
}

// ── Submit ────────────────────────────────────────────────────
async function submitGameResult(winner) {
  const votes = CANDIDATES.map(c => ({
    candidate_name:  c.name,
    wins_in_game:    gameVotes[c.name].wins || 0,
    opponents:       gameVotes[c.name].opponents || [],
    is_final_winner: c.name === winner.name
  }));

  const payload = { votes };
  saveLocal(payload, winner);

  try {
    await fetch(`${BACKEND_URL}/api/game`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
  } catch (e) {}
}

// ── Local storage ─────────────────────────────────────────────
function saveLocal(payload, winner) {
  const stored = JSON.parse(localStorage.getItem('bracketStats') || '{"games":0,"votes":{}}');
  stored.games = (stored.games || 0) + 1;
  if (!stored.votes) stored.votes = {};
  payload.votes.forEach(v => {
    if (!stored.votes[v.candidate_name]) stored.votes[v.candidate_name] = { totalWins: 0, finalWins: 0 };
    stored.votes[v.candidate_name].totalWins  += v.wins_in_game;
    stored.votes[v.candidate_name].finalWins  += v.is_final_winner ? 1 : 0;
  });
  localStorage.setItem('bracketStats', JSON.stringify(stored));
}

// ── Frise ─────────────────────────────────────────────────────
let friseSegments = []; // { name, color, wins } built during game

function buildFriseSegments() {
  // Reconstruct segments from history
  // Each entry in history has left+right candidates
  // We track who was the "current winner" (left card) at each duel
  const segs = [];
  let currentName = null;
  let currentColor = null;
  let count = 0;

  history.forEach((entry, i) => {
    // The winner of this duel is entry.winner
    const w = entry.winner;
    if (w.name !== currentName) {
      if (currentName !== null) {
        segs.push({ name: currentName, color: currentColor, wins: count });
      }
      currentName  = w.name;
      currentColor = w.color;
      count = 1;
    } else {
      count++;
    }
  });

  // Add final winner
  if (currentWinner) {
    if (currentWinner.name !== currentName) {
      if (currentName) segs.push({ name: currentName, color: currentColor, wins: count });
      segs.push({ name: currentWinner.name, color: currentWinner.color, wins: 1 });
    } else {
      segs.push({ name: currentName, color: currentColor, wins: count + 1 });
    }
  }

  return segs;
}

function drawFrise(canvas, winner, isMobile) {
  const W = isMobile ? 328 : 580;
  const H = isMobile ? 185 : 200;
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  const segments = buildFriseSegments();
  const totalDuels = segments.reduce((s, seg) => s + seg.wins, 0);

  // Fond blanc
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 12);
  ctx.fill();

  // Titre + sous-titre
  ctx.fillStyle = '#1e1b2e';
  ctx.font = `bold ${isMobile ? 12 : 13}px Georgia, serif`;
  ctx.fillText('Mon parcours', 16, isMobile ? 20 : 22);

  ctx.fillStyle = '#9ca3af';
  ctx.font = `${isMobile ? 9 : 10}px sans-serif`;
  ctx.fillText(`${totalDuels} duels · Candi-date 2027`, 16, isMobile ? 33 : 36);

  // Candidat final (droite)
  const winnerLabel = isMobile ? '🏆 Final' : '🏆 Candidat final';
  const winnerName  = winner.name.split(' ').pop(); // nom de famille seulement sur mobile
  ctx.textAlign = 'right';
  ctx.fillStyle = '#9ca3af';
  ctx.font = `${isMobile ? 9 : 10}px sans-serif`;
  ctx.fillText(winnerLabel, W - 16, isMobile ? 20 : 22);
  ctx.fillStyle = '#1e1b2e';
  ctx.font = `bold ${isMobile ? 11 : 12}px Georgia, serif`;
  ctx.fillText(isMobile ? winnerName : winner.name, W - 16, isMobile ? 33 : 36);
  ctx.textAlign = 'left';

  // Barre
  const barX = 16, barY = isMobile ? 44 : 50;
  const barW = W - 32, barH = isMobile ? 32 : 42;
  const radius = 8;
  const SMALL_THRESHOLD = 55; // px

  let x = barX;
  segments.forEach((seg, i) => {
    const sw = (seg.wins / totalDuels) * barW;
    ctx.fillStyle = seg.color;
    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(x + radius, barY);
      ctx.lineTo(x + sw, barY);
      ctx.lineTo(x + sw, barY + barH);
      ctx.lineTo(x + radius, barY + barH);
      ctx.arcTo(x, barY + barH, x, barY, radius);
      ctx.arcTo(x, barY, x + radius, barY, radius);
      ctx.fill();
    } else if (i === segments.length - 1) {
      ctx.beginPath();
      ctx.moveTo(x, barY);
      ctx.lineTo(x + sw - radius, barY);
      ctx.arcTo(x + sw, barY, x + sw, barY + radius, radius);
      ctx.arcTo(x + sw, barY + barH, x + sw - radius, barY + barH, radius);
      ctx.lineTo(x, barY + barH);
      ctx.fill();
    } else {
      ctx.fillRect(x, barY, sw, barH);
    }
    x += sw;
  });

  // Séparateurs blancs
  x = barX;
  segments.forEach((seg, i) => {
    x += (seg.wins / totalDuels) * barW;
    if (i < segments.length - 1) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, barY);
      ctx.lineTo(x, barY + barH);
      ctx.stroke();
    }
  });

  // Numéros + noms dans la barre / légende
  x = barX;
  let duelCount = 1;
  const bigSegs = [], smallSegs = [];

  segments.forEach((seg) => {
    const sw = (seg.wins / totalDuels) * barW;
    const cx = x + sw / 2;
    const endDuel = duelCount + seg.wins - 1;
    const duelLabel = seg.wins === 1 ? `${duelCount}` : `${duelCount}→${endDuel}`;
    const isLarge = sw >= SMALL_THRESHOLD;

    if (isLarge) {
      // Nom + numéros en blanc dans la barre
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ctx.font = `bold ${isMobile ? 9 : 10}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(seg.name, cx, barY + barH / 2 - 3);
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.font = `${isMobile ? 7 : 8}px sans-serif`;
      ctx.fillText(duelLabel, cx, barY + barH / 2 + 9);
      ctx.restore();
      bigSegs.push({ ...seg, sw, cx, duelLabel });
    } else {
      // Juste numéros si assez large
      if (sw > 16) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.font = `bold ${isMobile ? 6.5 : 7}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(duelLabel, cx, barY + barH / 2 + 3);
        ctx.restore();
      }
      smallSegs.push({ ...seg, sw, cx, duelLabel });
    }

    duelCount += seg.wins;
    x += sw;
  });

  // Légende pour petits segments
  if (smallSegs.length > 0) {
    const legendY = barY + barH + 22;
    ctx.font = `${isMobile ? 7.5 : 8}px sans-serif`;

    const items = smallSegs.map(seg => {
      const label = `${seg.name} (${seg.duelLabel})`;
      const labelW = ctx.measureText(label).width;
      return { ...seg, label, itemW: 10 + 4 + labelW };
    });

    const totalW = items.reduce((s, it) => s + it.itemW, 0) + (items.length - 1) * 10;
    let lx = barX + (barW - totalW) / 2;

    items.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(lx, legendY - 7, 8, 8, 2);
      ctx.fill();
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, lx + 12, legendY);
      lx += item.itemW + 10;
    });
  }

  // Footer
  const footerY = H - 14;
  ctx.strokeStyle = '#f3f4f6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, footerY - 6);
  ctx.lineTo(W - 16, footerY - 6);
  ctx.stroke();

  ctx.fillStyle = '#c4b5fd';
  ctx.font = `italic ${isMobile ? 8 : 9}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('✨ Généré par Candi-date 2027', 16, footerY + 5);

  ctx.fillStyle = '#a78bfa';
  ctx.font = `bold ${isMobile ? 9 : 10}px Georgia, serif`;
  ctx.textAlign = 'right';
  ctx.fillText('candi-date.fr', W - 16, footerY + 5);
}

function shareFrise() {
  const canvas = document.getElementById('friseCanvas');
  const isMobile = window.innerWidth < 769;

  // Redraw at full resolution for sharing
  const shareCanvas = document.createElement('canvas');
  drawFrise(shareCanvas, currentWinner, isMobile);

  shareCanvas.toBlob(blob => {
    const file = new File([blob], 'mon-parcours-candi-date.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: 'Mon parcours — Candi-date 2027',
        text: buildShareText(),
        files: [file]
      }).catch(() => downloadFrise(shareCanvas));
    } else {
      downloadFrise(shareCanvas);
    }
  }, 'image/png');
}

function downloadFrise(canvas) {
  const a = document.createElement('a');
  a.download = 'mon-parcours-candi-date.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
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
  document.getElementById('progressFill').style.width  = '100%';
  document.getElementById('progressLabel').textContent = '✓ Tous les duels terminés';

  // Draw frise
  const friseCanvas = document.getElementById('friseCanvas');
  const isMobile = window.innerWidth < 769;
  drawFrise(friseCanvas, winner, isMobile);

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
    return `J'ai joué à Candi-date 2027 !\nMon candidat idéal : ${currentWinner.name}\nEt toi, qui choisirais-tu ? ${url}`;
  return `J'ai joué à Candi-date 2027 !\nJ'ai mon candidat idéal mais je t'influence pas ;)\n${url}`;
}

function shareWhatsApp() {
  if (shareMode === 'reveal') {
    // Génère la frise et partage avec le texte
    const shareCanvas = document.createElement('canvas');
    const isMobile = window.innerWidth < 769;
    drawFrise(shareCanvas, currentWinner, isMobile);

    shareCanvas.toBlob(blob => {
      const file = new File([blob], 'mon-parcours-candi-date.png', { type: 'image/png' });
      const text = buildShareText();
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: 'Mon parcours — Candi-date 2027',
          text,
          files: [file]
        }).catch(() => {
          // Fallback : télécharge la frise puis ouvre WhatsApp avec le texte
          downloadFrise(shareCanvas);
          setTimeout(() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'), 500);
        });
      } else {
        // Télécharge la frise puis ouvre WhatsApp
        downloadFrise(shareCanvas);
        setTimeout(() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'), 500);
      }
    }, 'image/png');
  } else {
    // Secret : juste le texte sur WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText())}`, '_blank');
  }
}

function copyLink() {
  navigator.clipboard.writeText(buildShareText()).then(() => {
    const el = document.getElementById('copyConfirm');
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 2500);
  });
}

function shareNative() {
  if (shareMode === 'reveal') {
    const shareCanvas = document.createElement('canvas');
    const isMobile = window.innerWidth < 769;
    drawFrise(shareCanvas, currentWinner, isMobile);
    shareCanvas.toBlob(blob => {
      const file = new File([blob], 'mon-parcours-candi-date.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ title: 'Candi-date 2027', text: buildShareText(), files: [file] })
          .catch(() => copyLink());
      } else {
        downloadFrise(shareCanvas);
      }
    }, 'image/png');
  } else {
    if (navigator.share) navigator.share({ title: 'Candi-date 2027', text: buildShareText(), url: window.location.href });
    else copyLink();
  }
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cardLeft')) startGame();
});
