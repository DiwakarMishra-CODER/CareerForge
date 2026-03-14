const express = require('express');
const router = express.Router();
const CareerRoadmap = require('../models/CareerRoadmap');

// GET all roadmaps for a user (history list)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const roadmaps = await CareerRoadmap.find({ userId })
      .select('id career_goal createdAt')
      .sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET count of roadmaps for a user
router.get('/count', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const count = await CareerRoadmap.countDocuments({ userId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recent roadmaps (limited)
router.get('/recent', async (req, res) => {
  try {
    const { userId, limit = 3 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const roadmaps = await CareerRoadmap.find({ userId })
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single roadmap by id
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await CareerRoadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a roadmap
router.post('/', async (req, res) => {
  try {
    console.log('Roadmap creation request received:', req.body);
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const roadmap = new CareerRoadmap({ userId, ...rest });
    await roadmap.save();
    console.log('Roadmap saved successfully');
    res.status(201).json(roadmap);
  } catch (err) {
    console.error('Roadmap creation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
