const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

function mapRoadmap(row) {
  if (!row) return null;
  return {
    ...row,
    _id:       row.id,
    userId:    row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/roadmaps/count  — must be before /:id
router.get('/count', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const { count, error } = await supabase
      .from('career_roadmaps')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/roadmaps/recent  — must be before /:id
router.get('/recent', async (req, res) => {
  try {
    const { userId, limit = 3 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const { data: roadmaps, error } = await supabase
      .from('career_roadmaps')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    if (error) throw error;
    return res.json(roadmaps.map(r => ({ ...r, _id: r.id, createdAt: r.created_at })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/roadmaps  — history list (id, career_goal, createdAt)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const { data: roadmaps, error } = await supabase
      .from('career_roadmaps')
      .select('id, career_goal, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json(
      roadmaps.map(r => ({ _id: r.id, id: r.id, career_goal: r.career_goal, createdAt: r.created_at }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/roadmaps/:id  — single roadmap by id
router.get('/:id', async (req, res) => {
  try {
    const { data: roadmap, error } = await supabase
      .from('career_roadmaps')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    return res.json(mapRoadmap(roadmap));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/roadmaps  — create a roadmap
router.post('/', async (req, res) => {
  try {
    console.log('Roadmap creation request received:', req.body);
    const { userId, _id, __v, id, user_id, created_at, updated_at, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const { data: roadmap, error } = await supabase
      .from('career_roadmaps')
      .insert({ user_id: userId, ...rest })
      .select()
      .single();
    if (error) throw error;
    console.log('Roadmap saved successfully');
    return res.status(201).json(mapRoadmap(roadmap));
  } catch (err) {
    console.error('Roadmap creation error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
