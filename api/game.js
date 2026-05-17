// api/game.js — POST /api/game
// Receives the full game result in one request
// Body: { votes: [{ candidate_name, wins_in_game, is_final_winner }] }

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { votes } = req.body;
  if (!Array.isArray(votes) || votes.length === 0)
    return res.status(400).json({ error: 'Invalid payload' });

  // 1. Create a game record
  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({ played_at: new Date().toISOString() })
    .select('id')
    .single();

  if (gameError) {
    console.error('Game insert error:', gameError);
    return res.status(500).json({ error: 'Database error' });
  }

  // 2. Insert all votes for this game
  const rows = votes.map(v => ({
    game_id:         game.id,
    candidate_name:  v.candidate_name,
    wins_in_game:    v.wins_in_game    || 0,
    is_final_winner: v.is_final_winner || false
  }));

  const { error: votesError } = await supabase
    .from('game_votes')
    .insert(rows);

  if (votesError) {
    console.error('Votes insert error:', votesError);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(200).json({ ok: true, game_id: game.id });
};
