// api/stats.js — GET /api/stats
// Uses Supabase REST API with aggregation to avoid the 1000 row limit

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    // Count total games
    const gamesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/games?select=id`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact',
          'Range': '0-0',
          'Content-Type': 'application/json'
        }
      }
    );
    const totalGames = parseInt(gamesResponse.headers.get('content-range')?.split('/')[1] || '0');

    // Use the stats_summary view which aggregates server-side — no row limit issue
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/stats_summary?select=candidate_name,total_wins,final_wins`,
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

    const candidates = data.map(row => ({
      candidate_name: row.candidate_name,
      total_wins:     row.total_wins     || 0,
      final_wins:     row.final_wins     || 0,
      avg_wins_per_game: totalGames > 0
        ? parseFloat(((row.total_wins || 0) / totalGames).toFixed(2))
        : 0
    }));

    return res.status(200).json({ totalGames, candidates });

  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ error: e.message });
  }
};
