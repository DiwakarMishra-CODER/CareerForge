const express = require('express');
const router = express.Router();
const InterviewSession = require('../models/InterviewSession');

// GET count for a user
router.get('/count', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const count = await InterviewSession.countDocuments({ userId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recent sessions
router.get('/recent', async (req, res) => {
  try {
    const { userId, limit = 3 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const sessions = await InterviewSession.find({ userId })
      .select('job_title createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save a session
router.post('/', async (req, res) => {
  try {
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const session = new InterviewSession({ userId, ...rest });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
