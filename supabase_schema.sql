-- ============================================================
-- Présidentielle 2027 — Schéma Supabase v2
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Table 1 : une ligne par partie complète
CREATE TABLE games (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  played_at  TIMESTAMPTZ DEFAULT now()
);

-- Table 2 : une ligne par candidat par partie
CREATE TABLE game_votes (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id         uuid    NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  candidate_name  TEXT    NOT NULL,
  wins_in_game    INTEGER NOT NULL DEFAULT 0,
  is_final_winner BOOLEAN NOT NULL DEFAULT false
);

-- Index pour accélérer les agrégations
CREATE INDEX idx_gv_candidate ON game_votes (candidate_name);
CREATE INDEX idx_gv_game      ON game_votes (game_id);
CREATE INDEX idx_gv_final     ON game_votes (is_final_winner) WHERE is_final_winner = true;

-- Désactiver RLS (accès via clé service_role côté serveur uniquement)
ALTER TABLE games      DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_votes DISABLE ROW LEVEL SECURITY;

-- Vue de synthèse (utile pour consulter dans l'interface Supabase)
CREATE VIEW stats_summary AS
SELECT
  gv.candidate_name,
  SUM(gv.wins_in_game)                                    AS total_wins,
  COUNT(*)  FILTER (WHERE gv.is_final_winner = true)      AS final_wins,
  COUNT(DISTINCT gv.game_id)                              AS games_appeared,
  ROUND(SUM(gv.wins_in_game)::numeric / NULLIF((SELECT COUNT(*) FROM games), 0), 2) AS avg_wins_per_game
FROM game_votes gv
GROUP BY gv.candidate_name
ORDER BY total_wins DESC;
