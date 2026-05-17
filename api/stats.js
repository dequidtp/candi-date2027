// api/stats.js — GET /api/stats
// Returns aggregated stats per candidate + total games

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Total games
  const { count: totalGames, error: gamesError } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true });

  if (gamesError) {
    console.error('Games count error:', gamesError);
    return res.status(500).json({ error: 'Database error' });
  }

  // Aggregate per candidate
  const { data, error } = await supabase
    .from('game_votes')
    .select('candidate_name, wins_in_game, is_final_winner');

  if (error) {
    console.error('Votes fetch error:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  // Aggregate in JS
  const agg = {};
  data.forEach(({ candidate_name, wins_in_game, is_final_winner }) => {
    if (!agg[candidate_name]) agg[candidate_name] = { total_wins: 0, final_wins: 0 };
    agg[candidate_name].total_wins += wins_in_game || 0;
    if (is_final_winner) agg[candidate_name].final_wins += 1;
  });

  const candidates = Object.entries(agg).map(([candidate_name, v]) => ({
    candidate_name,
    total_wins: v.total_wins,
    final_wins: v.final_wins,
    avg_wins_per_game: totalGames > 0
      ? parseFloat((v.total_wins / totalGames).toFixed(2))
      : 0
  }));

  return res.status(200).json({ totalGames, candidates });
};
