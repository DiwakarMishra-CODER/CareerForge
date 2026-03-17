const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const axios = require('axios');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const Profile = require('../models/Profile');

const upload = multer({ storage: multer.memoryStorage() });

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

// POST /api/resumes/analyze
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { userId, jobDescription } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!req.file) return res.status(400).json({ error: 'Resume file is required' });

    // Parse PDF
    const data = await pdf(req.file.buffer);
    const resumeText = data.text;

    // Fetch user profile for skills
    const profile = await Profile.findOne({ userId });
    const userSkills = profile?.skills?.join(', ') || 'Not specified';

    // Prepare Prompt
    let prompt;
    if (jobDescription && jobDescription.trim()) {
      prompt = `You are an expert HR tech analyst. Analyze the provided resume text against the job description, considering the user's listed skills from their profile.

        - **Job Description**: """${jobDescription}"""
        - **Resume Text**: """${resumeText}"""
        - **User's Profile Skills**: ${userSkills}

        Provide a 'Job Match Score' from 1-100. Also, provide a 'Missing Keywords' array with critical terms from the job description that are not in the resume, an 'Improvement Suggestions' array with 3 actionable pieces of advice on how to better tailor the resume for this role, and a 'suitable_roles' array with 3-4 other job titles that would be a good fit based on the resume.

        Return ONLY a valid JSON object with the structure: { "job_match_score": number, "missing_keywords": ["string"], "improvement_suggestions": ["string"], "suitable_roles": ["string"] }`;
    } else {
      prompt = `You are an expert HR tech analyst. Analyze the following resume and identify the key skills, experiences, and qualifications. Based on this analysis, suggest 5-6 suitable job roles that the person could fit into.

        - **Resume Text**: """${resumeText}"""
        - **User's Profile Skills**: ${userSkills}

        Return ONLY a valid JSON object with the structure: { "suitable_roles": ["string"], "improvement_suggestions": ["string"], "job_match_score": number }`;
    }

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

    // Save Analysis Result
    const analysis = new ResumeAnalysis({
      userId,
      fileName: req.file.originalname,
      jobDescription,
      matchScore: result.job_match_score || 0,
      missingKeywords: result.missing_keywords || [],
      improvementSuggestions: result.improvement_suggestions || [],
      suitableRoles: result.suitable_roles || []
    });
    await analysis.save();

    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

// GET /api/resumes/analyses
router.get('/analyses', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const analyses = await ResumeAnalysis.find({ userId }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
