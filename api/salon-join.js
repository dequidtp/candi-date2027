// POST /api/salon/join  — { code, nickname }
const crypto = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const { code, nickname } = req.body || {};

  if (!code || !nickname?.trim()) {
    return res.status(400).json({ error: 'Code et pseudo requis' });
  }

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const salonRes = await fetch(
      `${SUPABASE_URL}/rest/v1/salons?code=eq.${encodeURIComponent(code.toUpperCase())}&select=id,expires_at`,
      { headers }
    );
    const salons = await salonRes.json();
    if (!salons.length) return res.status(404).json({ error: 'Salon introuvable' });

    const salon = salons[0];
    if (new Date(salon.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Ce salon a expiré' });
    }

    const token = crypto.randomUUID();
    const playerRes = await fetch(`${SUPABASE_URL}/rest/v1/salon_players`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        salon_id: salon.id,
        nickname: nickname.trim().slice(0, 30),
        token
      })
    });

    if (!playerRes.ok) return res.status(500).json({ error: await playerRes.text() });

    const [player] = await playerRes.json();
    return res.status(200).json({ token: player.token, player_id: player.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
