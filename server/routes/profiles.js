const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const multer = require('multer');
const pdf = require('pdf-parse');
const axios = require('axios');

const upload = multer({ storage: multer.memoryStorage() });

// GET profile by userId
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST/PUT upsert profile
router.post('/', async (req, res) => {
  try {
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { userId, ...rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profiles/analyze-linkedin
router.post('/analyze-linkedin', upload.single('linkedinPdf'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!req.file) return res.status(400).json({ error: 'LinkedIn PDF is required' });

    // Parse PDF
    const data = await pdf(req.file.buffer);
    const profileText = data.text;

    // Prepare Prompt for Gemini
    const prompt = `You are an expert LinkedIn Profile Strategist and Career Coach. 
    Analyze the following LinkedIn profile extracted text and provide a comprehensive, actionable optimization report.

    Rules:
    1. Return ONLY a valid JSON object.
    2. Be critical but constructive.
    3. For 'improved' experience points, use strong action verbs and quantifiable results.
    4. identify matching and missing skills based on high-demand roles.

    Profile Context:
    """${profileText}"""

    Required JSON Structure:
    {
      "overallScore": number (1-100),
      "stats": {
        "keywords": number,
        "actionVerbs": number,
        "missingSections": number
      },
      "sections": {
        "headline": {
          "score": number,
          "current": "string (the profile's current headline)",
          "analysis": "string (short critique)",
          "suggestions": ["suggestion 1", "suggestion 2"]
        },
        "about": {
          "score": number,
          "current": "string (the current summary/about section)",
          "analysis": "string (short critique)",
          "buzzwords": ["list of overused words found"],
          "suggestion": "string (high-level advice)"
        },
        "experience": {
          "score": number,
          "items": [
            {
              "role": "string",
              "original": "string (original bullet point)",
              "improved": "string (rewritten for impact)",
              "impact": "High" | "Medium" | "Low"
            }
          ]
        },
        "skills": {
          "gapAnalysis": ["list of relevant missing skills"],
          "topSkills": ["list of current strong skills"]
        }
      }
    }`;

    // Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }
    );

    const result = JSON.parse(response.data.candidates[0].content.parts[0].text);
    res.json(result);

  } catch (err) {
    console.error('LinkedIn Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze LinkedIn profile' });
  }
});

module.exports = router;
