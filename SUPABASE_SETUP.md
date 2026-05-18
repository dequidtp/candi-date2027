# Configuration Supabase — Fonctionnalité Salons

Ce document décrit les modifications à appliquer dans Supabase pour activer la fonctionnalité multijoueur (salons).

---

## Étapes

### 1. Ouvrir l'éditeur SQL

1. Connecte-toi sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionne le projet **Candi-date 2027**
3. Dans le menu de gauche, clique sur **SQL Editor**
4. Clique sur **New query**

---

### 2. Coller et exécuter le SQL suivant

Copie tout le bloc ci-dessous, colle-le dans l'éditeur et clique sur **Run** (▶️).

```sql
-- ============================================================
-- Salons multijoueur — migration v1
-- ============================================================

-- 1. Ajouter les colonnes origin et salon_player_id sur games
ALTER TABLE games
  ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'solo'
    CHECK (origin IN ('solo','salon')),
  ADD COLUMN IF NOT EXISTS salon_player_id uuid;

-- 2. Table des salons
CREATE TABLE IF NOT EXISTS salons (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + interval '7 days'
);

-- 3. Table des participants
CREATE TABLE IF NOT EXISTS salon_players (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id       uuid        NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  nickname       TEXT        NOT NULL,
  token          TEXT        NOT NULL UNIQUE,
  game_id        uuid        REFERENCES games(id),
  winner_name    TEXT,
  winner_color   TEXT,
  winner_desc    TEXT,
  winner_cat     TEXT,
  frise_segments JSONB,
  joined_at      TIMESTAMPTZ DEFAULT now(),
  completed_at   TIMESTAMPTZ
);

-- 4. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_sp_salon    ON salon_players (salon_id);
CREATE INDEX IF NOT EXISTS idx_sp_token    ON salon_players (token);
CREATE INDEX IF NOT EXISTS idx_salons_code ON salons (code);

-- 5. Désactiver RLS (accès via service_role uniquement)
ALTER TABLE salons        DISABLE ROW LEVEL SECURITY;
ALTER TABLE salon_players DISABLE ROW LEVEL SECURITY;

-- 6. Clé étrangère games → salon_players
ALTER TABLE games
  ADD CONSTRAINT IF NOT EXISTS fk_games_salon_player
  FOREIGN KEY (salon_player_id) REFERENCES salon_players(id);

-- 7. Vues de statistiques
CREATE OR REPLACE VIEW stats_summary AS
SELECT
  gv.candidate_name,
  SUM(gv.wins_in_game)                              AS total_wins,
  COUNT(*) FILTER (WHERE gv.is_final_winner = true) AS final_wins,
  COUNT(DISTINCT gv.game_id)                        AS games_appeared
FROM game_votes gv
GROUP BY gv.candidate_name
ORDER BY total_wins DESC;

CREATE OR REPLACE VIEW stats_summary_solo AS
SELECT
  gv.candidate_name,
  SUM(gv.wins_in_game)                              AS total_wins,
  COUNT(*) FILTER (WHERE gv.is_final_winner = true) AS final_wins,
  COUNT(DISTINCT gv.game_id)                        AS games_appeared
FROM game_votes gv
JOIN games g ON g.id = gv.game_id
WHERE g.origin = 'solo'
GROUP BY gv.candidate_name
ORDER BY total_wins DESC;

CREATE OR REPLACE VIEW stats_summary_salon AS
SELECT
  gv.candidate_name,
  SUM(gv.wins_in_game)                              AS total_wins,
  COUNT(*) FILTER (WHERE gv.is_final_winner = true) AS final_wins,
  COUNT(DISTINCT gv.game_id)                        AS games_appeared
FROM game_votes gv
JOIN games g ON g.id = gv.game_id
WHERE g.origin = 'salon'
GROUP BY gv.candidate_name
ORDER BY total_wins DESC;
```

---

### 3. Vérifier que tout s'est bien passé

Après l'exécution, tu devrais voir `Success. No rows returned` (ou équivalent sans erreur).

Pour vérifier que les tables existent, tu peux lancer cette requête :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('salons', 'salon_players', 'games');
```

Tu dois voir les 3 tables listées.

---

### 4. Ce qu'apporte cette migration

| Élément | Description |
|---|---|
| `games.origin` | `'solo'` ou `'salon'` — permet de filtrer les stats |
| `games.salon_player_id` | Lien vers le joueur du salon qui a joué cette partie |
| Table `salons` | Un salon par code (6 caractères), expire après 7 jours |
| Table `salon_players` | Un participant par salon, avec son token, sa frise et son vainqueur |
| Vue `stats_summary_solo` | Stats filtrées sur les parties solo uniquement |
| Vue `stats_summary_salon` | Stats filtrées sur les parties salon uniquement |

---

### En cas d'erreur

- **"column already exists"** → Normal si la migration a déjà été partiellement appliquée, le `IF NOT EXISTS` protège contre ça.
- **"relation already exists"** → Même chose, pas de problème.
- **"weighted_score does not exist"** → La vue `stats_summary` référençait une colonne inexistante. La version ci-dessus est corrigée (sans `weighted_score`).
- Si une vraie erreur bloque l'exécution, copie le message et partage-le.
