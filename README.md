# Candi-date 2027

> Jeu de matching présidentiel : pour qui voteriez-vous parmi 75 personnalités françaises ?

Site en production : **[candi-date.fr](https://www.candi-date.fr)**

---

## Présentation

Candi-date 2027 est un jeu de type « duel par élimination » (bracket tournament) où les joueurs choisissent entre deux candidats à chaque tour, jusqu'à désigner leur candidat idéal. Le résultat est affiché sous forme d'une **frise colorée** représentant les victoires de chaque candidat, partageable sur les réseaux.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | HTML / CSS / JavaScript vanilla |
| Backend | Vercel Serverless Functions (Node.js) |
| Base de données | Supabase (PostgreSQL via API REST) |
| Photos | Wikipedia API (cache client) |
| Déploiement | Vercel (CD automatique depuis GitHub) |

---

## Structure des fichiers

```
/
├── index.html          — Page principale du jeu (duel + victoire + partage)
├── salon.html          — Page salon multijoueur (rejoindre, attendre, récap)
├── game.js             — Logique du jeu (duels, scoring, frise, salon)
├── salon.js            — Logique de la page salon (join, recap, guessing, reveal)
├── style.css           — Tous les styles (jeu + salon + overlays)
├── vercel.json         — Config Vercel (routes, builds, headers)
├── supabase_schema.sql — Schéma SQL de référence (à jour)
├── SUPABASE_SETUP.md   — Guide de migration Supabase (à lire avant de déployer)
└── api/
    ├── game.js         — POST /api/game — enregistre une partie
    ├── stats.js        — GET /api/stats — statistiques globales/solo/salon
    ├── salon-create.js — POST /api/salon/create — crée un salon
    ├── salon-join.js   — POST /api/salon/join — rejoint un salon
    ├── salon-complete.js — POST /api/salon/complete — soumet le résultat d'un joueur
    └── salon-info.js   — GET /api/salon/info?code=XXXX — état complet d'un salon
```

---

## Variables d'environnement (Vercel)

Configurer dans les Settings du projet Vercel :

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase (ex: `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Clé `service_role` Supabase (jamais exposée côté client) |

---

## Fonctionnalités

### Mode Solo

1. Le joueur choisit **Solo** au démarrage
2. Il passe 74 duels (tournoi complet sur 75 candidats)
3. Un écran de victoire affiche son candidat + sa frise
4. Il peut partager (WhatsApp, copier le lien, autres apps)

### Mode Multijoueur (Salons)

Le salon fonctionne de façon **asynchrone** : pas besoin que tout le monde soit connecté en même temps.

#### Créer un salon

- Depuis l'écran de démarrage → **Multijoueur** → saisir un pseudo → **Créer et jouer**
- Ou depuis l'écran de victoire solo → **Partager** → option **Créer un salon**

#### Rejoindre un salon

- Via le lien partagé par le créateur (ex: `candi-date.fr/salon.html?code=ABC123`)
- Ou en allant sur `salon.html` et en saisissant le code à 6 caractères

#### Déroulement

1. Chaque joueur joue sa partie sur `index.html` indépendamment
2. Dès qu'une partie est terminée, la frise apparaît anonymement dans le récap du salon
3. Les joueurs peuvent revenir plus tard grâce à leur **token** stocké en localStorage (pas besoin de rejouer)
4. Sur la page salon, les frises sont affichées **dans un ordre aléatoire** sans les noms
5. Chaque joueur peut **deviner** quel ami se cache derrière chaque frise (tap-to-assign)
6. Clic sur **Révéler toutes les réponses** → les noms apparaissent + score de guessing

#### Codes salon

- 6 caractères alphanumériques sans ambiguïté (charset `ABCDEFGHJKMNPQRSTUVWXYZ23456789`)
- Expire automatiquement après **7 jours**

---

## API

### `POST /api/salon/create`

Crée un nouveau salon.

**Réponse :** `{ code: "ABC123", salon_id: "uuid" }`

---

### `POST /api/salon/join`

Rejoint un salon existant.

**Corps :** `{ code: "ABC123", nickname: "Alice" }`

**Réponse :** `{ token: "uuid", player_id: "uuid" }`

Le `token` est stocké en localStorage (`salon_token_ABC123`) pour permettre un retour sans rejouer.

---

### `POST /api/salon/complete`

Soumet le résultat d'un joueur à la fin de sa partie.

**Corps :**
```json
{
  "token": "uuid",
  "game_id": "uuid",
  "frise_segments": [{ "name": "Édouard Philippe", "color": "#4db8ff", "wins": 5 }, ...],
  "winner_name": "Édouard Philippe",
  "winner_color": "#4db8ff",
  "winner_desc": "Maire du Havre, ancien Premier ministre",
  "winner_cat": "Horizons"
}
```

**Réponse :** `{ ok: true }` (ou `{ ok: true, already_completed: true }` si déjà soumis)

---

### `GET /api/salon/info?code=ABC123`

Retourne l'état complet d'un salon (liste des joueurs, frises, vainqueurs).

**Réponse :**
```json
{
  "code": "ABC123",
  "salon_id": "uuid",
  "expires_at": "2026-05-25T...",
  "players": [
    {
      "id": "uuid",
      "nickname": "Alice",
      "completed": true,
      "winner_name": "Édouard Philippe",
      "winner_color": "#4db8ff",
      "winner_desc": "...",
      "winner_cat": "Horizons",
      "frise_segments": [...]
    }
  ]
}
```

---

### `GET /api/stats?origin=solo|salon`

Statistiques globales des candidats.

- Sans paramètre → toutes les parties
- `?origin=solo` → parties solo uniquement
- `?origin=salon` → parties via salon uniquement

---

## Base de données

Voir [supabase_schema.sql](supabase_schema.sql) pour le schéma complet.

Tables principales :

| Table | Description |
|---|---|
| `games` | Une ligne par partie complète |
| `game_votes` | Une ligne par candidat par partie (wins, is_final_winner) |
| `salons` | Un salon par code, avec date d'expiration |
| `salon_players` | Un participant par salon, avec token, frise et vainqueur |

Vues :

| Vue | Description |
|---|---|
| `stats_summary` | Stats toutes parties confondues |
| `stats_summary_solo` | Stats parties solo uniquement |
| `stats_summary_salon` | Stats parties salon uniquement |

---

## Déploiement

Le déploiement est automatique via Vercel à chaque push sur `main`.

Pour tester localement :
```bash
npm install -g vercel
vercel dev
```

---

## Tâches restantes / prochaines étapes

Voir section [Roadmap](#roadmap) ci-dessous.

---

## Roadmap

### Bloquant (à faire avant de tester les salons)

- [ ] **Appliquer le SQL Supabase** — suivre [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
  - Sans ça, toute création/rejointe de salon retourne une erreur 500

### Tests à effectuer après la migration SQL

- [ ] Créer un salon depuis le mode multijoueur au démarrage
- [ ] Partager le lien et le rejoindre depuis un autre appareil
- [ ] Vérifier que la frise apparaît dans le récap après avoir joué
- [ ] Tester le guessing et la révélation
- [ ] Vérifier que le retour au salon (via localStorage) fonctionne sans rejouer
- [ ] Tester `/api/stats?origin=solo` et `?origin=salon`

### Améliorations futures possibles

- [ ] Page salon : bouton "Rafraîchir" ou polling auto pour voir les nouvelles frises sans recharger
- [ ] Afficher le nombre de joueurs en attente / ayant terminé
- [ ] Limiter le nombre de joueurs par salon (optionnel)
- [ ] Nettoyage automatique des salons expirés (Supabase cron ou Edge Function)
- [ ] Stats admin : tableau de bord avec filtres date + origine
