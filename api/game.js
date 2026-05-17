// api/game.js — POST /api/game
// Uses fetch directly instead of supabase-js to avoid WebSocket issues on Node 20

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const { votes } = req.body;

  if (!Array.isArray(votes) || votes.length === 0)
    return res.status(400).json({ error: 'Invalid payload' });

  try {
    // 1. Create game record
    const gameRes = await fetch(`${SUPABASE_URL}/rest/v1/games`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ played_at: new Date().toISOString() })
    });

    if (!gameRes.ok) {
      const err = await gameRes.text();
      console.error('Game insert error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const games = await gameRes.json();
    const gameId = games[0]?.id;

    if (!gameId) return res.status(500).json({ error: 'No game ID returned' });

    // 2. Insert votes
    const rows = votes.map(v => ({
      game_id: gameId,
      candidate_name: v.candidate_name,
      wins_in_game: v.wins_in_game || 0,
      is_final_winner: v.is_final_winner || false,
      opponents: v.opponents || []
    }));

    const votesRes = await fetch(`${SUPABASE_URL}/rest/v1/game_votes`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(rows)
    });

    if (!votesRes.ok) {
      const err = await votesRes.text();
      console.error('Votes insert error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ ok: true, game_id: gameId });

  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ error: e.message });
  }
};
