// api/stats.js — GET /api/stats
// Uses stats_summary view to avoid the 1000 row limit

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const { origin } = req.query; // 'solo', 'salon', or undefined for all
  const ALLOWED_ORIGINS = ['solo', 'salon'];
  const safeOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : null;

  try {
    // Count games (filtered by origin if specified)
    const originFilter = safeOrigin ? `&origin=eq.${safeOrigin}` : '';
    const gamesRes = await fetch(`${SUPABASE_URL}/rest/v1/games?select=id${originFilter}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact',
        'Range': '0-0'
      }
    });
    const totalGames = parseInt(gamesRes.headers.get('content-range')?.split('/')[1] || '0');

    // Choose view based on origin filter
    const viewName = safeOrigin === 'solo'  ? 'stats_summary_solo'
                   : safeOrigin === 'salon' ? 'stats_summary_salon'
                   : 'stats_summary';

    // Get aggregated stats from view
    const statsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/${viewName}?select=candidate_name,total_wins,final_wins,total_weighted_score`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!statsRes.ok) {
      const err = await statsRes.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const data = await statsRes.json();

    const candidates = data.map(row => ({
      candidate_name:       row.candidate_name,
      total_wins:           row.total_wins            || 0,
      final_wins:           row.final_wins            || 0,
      total_weighted_score: row.total_weighted_score  || 0,
      avg_wins_per_game:    totalGames > 0
        ? parseFloat(((row.total_wins || 0) / totalGames).toFixed(2))
        : 0
    }));

    return res.status(200).json({ totalGames, candidates, origin: safeOrigin || 'all' });

  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ error: e.message });
  }
};
