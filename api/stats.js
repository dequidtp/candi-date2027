// api/stats.js — GET /api/stats
// Uses fetch directly instead of supabase-js to avoid WebSocket issues on Node 20

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/game_votes?select=candidate_name,wins_in_game,is_final_winner`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const data = await response.json();

    // Count total games
    const gamesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/games?select=id`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact',
          'Content-Type': 'application/json'
        }
      }
    );

    const totalGames = parseInt(gamesResponse.headers.get('content-range')?.split('/')[1] || '0');

    // Aggregate
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

  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ error: e.message });
  }
};
