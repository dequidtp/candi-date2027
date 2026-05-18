// POST /api/salon/complete — { token, game_id, frise_segments, winner_name, winner_color, winner_desc, winner_cat }
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const { token, game_id, frise_segments, winner_name, winner_color, winner_desc, winner_cat } = req.body || {};

  if (!token || !game_id || !Array.isArray(frise_segments)) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const playerRes = await fetch(
      `${SUPABASE_URL}/rest/v1/salon_players?token=eq.${encodeURIComponent(token)}&select=id,salon_id,completed_at`,
      { headers }
    );
    const players = await playerRes.json();
    if (!players.length) return res.status(404).json({ error: 'Joueur introuvable' });

    const player = players[0];
    if (player.completed_at) {
      return res.status(200).json({ ok: true, already_completed: true });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/salon_players?id=eq.${player.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        game_id,
        winner_name,
        winner_color,
        winner_desc,
        winner_cat,
        frise_segments,
        completed_at: new Date().toISOString()
      })
    });

    await fetch(`${SUPABASE_URL}/rest/v1/games?id=eq.${encodeURIComponent(game_id)}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ origin: 'salon', salon_player_id: player.id })
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
