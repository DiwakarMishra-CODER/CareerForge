const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');

// GET all resumes for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET count of resumes for a user
router.get('/count', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const count = await Resume.countDocuments({ userId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a resume
router.post('/', async (req, res) => {
  try {
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const resume = new Resume({ userId, ...rest });
    await resume.save();
    res.status(201).json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recent resumes (limited)
router.get('/recent', async (req, res) => {
  try {
    const { userId, limit = 3 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const resumes = await Resume.find({ userId })
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
