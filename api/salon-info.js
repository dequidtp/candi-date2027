// GET /api/salon/info?code=XXXX
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const { code } = req.query;

  if (!code) return res.status(400).json({ error: 'Code requis' });

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  };

  try {
    const salonRes = await fetch(
      `${SUPABASE_URL}/rest/v1/salons?code=eq.${encodeURIComponent(code.toUpperCase())}&select=id,code,created_at,expires_at`,
      { headers }
    );
    const salons = await salonRes.json();
    if (!salons.length) return res.status(404).json({ error: 'Salon introuvable' });

    const salon = salons[0];

    const playersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/salon_players?salon_id=eq.${salon.id}&select=id,nickname,completed_at,winner_name,winner_color,winner_desc,winner_cat,frise_segments&order=completed_at.asc.nullslast`,
      { headers }
    );
    const players = await playersRes.json();

    return res.status(200).json({
      code: salon.code,
      salon_id: salon.id,
      expires_at: salon.expires_at,
      players: players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        completed: !!p.completed_at,
        winner_name:   p.winner_name,
        winner_color:  p.winner_color,
        winner_desc:   p.winner_desc,
        winner_cat:    p.winner_cat,
        frise_segments: p.frise_segments
      }))
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
