const express = require('express');
const router = express.Router();
const InterviewSession = require('../models/InterviewSession');
const InterviewPattern = require('../models/InterviewPattern');

// GET history for a user
router.get('/history', async (req, res) => {
  try {
    const { userId, limit = 10, page = 1, type } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });

    const query = { userId };
    if (type) query.interviewType = type;

    const interviews = await InterviewSession.find(query)
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-conversation');

    const total = await InterviewSession.countDocuments(query);

    res.json({
      interviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET patterns analysis
router.get('/stats/patterns', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const analysis = await InterviewSession.getPatternAnalysis(userId);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET count for a user (backward compatibility)
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

// GET recent sessions (backward compatibility)
router.get('/recent', async (req, res) => {
  try {
    const { userId, limit = 3 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const sessions = await InterviewSession.find({ userId })
      .select('interviewType customRole createdAt completedAt overallScore')
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

    // Support both old and new field names if necessary
    const sessionData = {
      userId,
      ...rest,
      completedAt: rest.completedAt || new Date()
    };

    const session = new InterviewSession(sessionData);
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST report cheating
router.post('/cheat-report', async (req, res) => {
  try {
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const sessionData = {
      userId,
      ...rest,
      status: 'cheated',
      cheatPenalty: 100,
      completedAt: new Date()
    };

    const session = new InterviewSession(sessionData);
    await session.save();

    res.status(201).json({
      message: 'Cheating reported and session terminated',
      penaltyApplied: 100,
      newBalance: 0, // Placeholder for actual balance logic if implemented
      status: 'cheated'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST seed patterns
router.post('/patterns/seed', async (req, res) => {
  try {
    await InterviewPattern.seedPatterns();
    res.json({ message: 'Patterns seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
