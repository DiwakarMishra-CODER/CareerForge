const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const axios = require('axios');
const supabase = require('../lib/supabase');

const upload = multer({ storage: multer.memoryStorage() });

function mapResume(row) {
  if (!row) return null;
  return {
    ...row,
    _id:       row.id,
    userId:    row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAnalysis(row) {
  if (!row) return null;
  return {
    ...row,
    _id:                    row.id,
    userId:                 row.user_id,
    fileName:               row.file_name,
    jobDescription:         row.job_description,
    matchScore:             row.match_score,
    missingKeywords:        row.missing_keywords,
    improvementSuggestions: row.improvement_suggestions,
    suitableRoles:          row.suitable_roles,
    analysisDate:           row.analysis_date,
    createdAt:              row.created_at,
  };
}

// GET /api/resumes/count  — must be before /:id
router.get('/count', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const { count, error } = await supabase
      .from('resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resumes/recent  — must be before /:id
router.get('/recent', async (req, res) => {
  try {
    const { userId, limit = 3 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    if (error) throw error;
    return res.json(resumes.map(r => ({ ...r, _id: r.id, createdAt: r.created_at })));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resumes/analyses  — must be before /:id
router.get('/analyses', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const { data: analyses, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json(analyses.map(mapAnalysis));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resumes  — all resumes for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json(resumes.map(mapResume));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resumes  — create a resume
router.post('/', async (req, res) => {
  try {
    const { userId, _id, __v, id, user_id, created_at, updated_at, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const { data: resume, error } = await supabase
      .from('resumes')
      .insert({ user_id: userId, ...rest })
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json(mapResume(resume));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resumes/analyze  — AI analysis, logic UNCHANGED
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { userId, jobDescription } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!req.file) return res.status(400).json({ error: 'Resume file is required' });

    const data = await pdf(req.file.buffer);
    const resumeText = data.text;

    // Fetch user profile skills from Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills')
      .eq('user_id', userId)
      .maybeSingle();
    const userSkills = profile?.skills?.join(', ') || 'Not specified';

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

    const apiKey = process.env.OPENROUTER_API_KEY;
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const result = JSON.parse(response.data.choices[0].message.content);

    // Save analysis to Supabase
    const { error: saveErr } = await supabase
      .from('resume_analyses')
      .insert({
        user_id:                 userId,
        file_name:               req.file.originalname,
        job_description:         jobDescription,
        match_score:             result.job_match_score || 0,
        missing_keywords:        result.missing_keywords || [],
        improvement_suggestions: result.improvement_suggestions || [],
        suitable_roles:          result.suitable_roles || [],
      });
    if (saveErr) console.error('Failed to save analysis:', saveErr.message);

    return res.json(result);
  } catch (err) {
    console.error('Analysis error:', err.response ? err.response.data : err);
    return res.status(500).json({ error: 'Failed to analyze resume', details: err.response ? err.response.data : err.message });
  }
});

module.exports = router;
