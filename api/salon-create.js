// POST /api/salon/create
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode() {
  return Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    let code;
    for (let attempt = 0; attempt < 10; attempt++) {
      code = generateCode();
      const check = await fetch(
        `${SUPABASE_URL}/rest/v1/salons?code=eq.${code}&select=id`,
        { headers }
      );
      const existing = await check.json();
      if (!existing.length) break;
    }

    const r = await fetch(`${SUPABASE_URL}/rest/v1/salons`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({ code })
    });

    if (!r.ok) return res.status(500).json({ error: await r.text() });

    const [salon] = await r.json();
    return res.status(200).json({ code: salon.code, salon_id: salon.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
