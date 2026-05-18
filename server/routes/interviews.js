const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');

// ---------------------------------------------------------------------------
// Map camelCase request body → snake_case DB columns for interview_sessions
// ---------------------------------------------------------------------------
function sessionToDb(data) {
  return {
    user_id:             data.userId,
    interview_type:      data.interviewType,
    custom_role:         data.customRole       || '',
    config:              data.config           || {},
    overall_score:       data.overallScore     || 0,
    scores:              data.scores           || {},
    patterns_asked:      data.patternsAsked    || [],
    conversation:        data.conversation     || [],
    transcript:          data.transcript       || [],
    feedback:            data.feedback         || null,
    problems:            data.problems         || [],
    strengths:           data.strengths        || [],
    weak_points:         data.weakPoints       || [],
    suggestions:         data.suggestions      || [],
    time_taken:          data.timeTaken        || 0,
    questions_attempted: data.questionsAttempted || 0,
    questions_total:     data.questionsTotal   || 0,
    status:              data.status           || 'completed',
    cheat_penalty:       data.cheatPenalty     || 0,
    completed_at:        data.completedAt      || new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Map snake_case DB row → camelCase response (mirrors original Mongoose shape)
// ---------------------------------------------------------------------------
function sessionFromDb(row) {
  if (!row) return null;
  return {
    _id:                row.id,
    id:                 row.id,
    userId:             row.user_id,
    interviewType:      row.interview_type,
    customRole:         row.custom_role,
    config:             row.config,
    overallScore:       row.overall_score,
    scores:             row.scores,
    patternsAsked:      row.patterns_asked,
    conversation:       row.conversation,
    transcript:         row.transcript,
    feedback:           row.feedback,
    problems:           row.problems,
    strengths:          row.strengths,
    weakPoints:         row.weak_points,
    suggestions:        row.suggestions,
    timeTaken:          row.time_taken,
    questionsAttempted: row.questions_attempted,
    questionsTotal:     row.questions_total,
    status:             row.status,
    cheatPenalty:       row.cheat_penalty,
    completedAt:        row.completed_at,
    createdAt:          row.created_at,
    updatedAt:          row.updated_at,
  };
}

// All columns except conversation (mirrors Mongoose .select('-conversation'))
const HISTORY_COLUMNS = [
  'id', 'user_id', 'interview_type', 'custom_role', 'config',
  'overall_score', 'scores', 'patterns_asked', 'transcript', 'feedback',
  'problems', 'strengths', 'weak_points', 'suggestions',
  'time_taken', 'questions_attempted', 'questions_total',
  'status', 'cheat_penalty', 'completed_at', 'created_at', 'updated_at'
].join(', ');

// ---------------------------------------------------------------------------
// GET /api/interviews/history
// ---------------------------------------------------------------------------
router.get('/history', async (req, res) => {
  try {
    const { userId, limit = 10, page = 1, type } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to   = from + parseInt(limit) - 1;

    let query = supabase
      .from('interview_sessions')
      .select(HISTORY_COLUMNS, { count: 'exact' })
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .range(from, to);

    if (type) query = query.eq('interview_type', type);

    const { data: interviews, count, error } = await query;
    if (error) throw error;

    return res.json({
      interviews:  interviews.map(sessionFromDb),
      total:       count,
      page:        parseInt(page),
      totalPages:  Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/interviews/stats/patterns
// Reimplements InterviewSession.getPatternAnalysis() static method in JS
// ---------------------------------------------------------------------------
router.get('/stats/patterns', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const { data: sessions, error } = await supabase
      .from('interview_sessions')
      .select('patterns_asked, problems')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .in('interview_type', ['dsa', 'system-design']);

    if (error) throw error;

    const patternStats = {};

    sessions.forEach(session => {
      (session.patterns_asked || []).forEach(p => {
        if (!patternStats[p.pattern]) {
          patternStats[p.pattern] = { attempts: 0, solved: 0, totalScore: 0 };
        }
        patternStats[p.pattern].attempts++;
        if (p.solved) patternStats[p.pattern].solved++;
        patternStats[p.pattern].totalScore += p.score || 0;
      });
      (session.problems || []).forEach(prob => {
        if (prob.pattern) {
          if (!patternStats[prob.pattern]) {
            patternStats[prob.pattern] = { attempts: 0, solved: 0, totalScore: 0 };
          }
          patternStats[prob.pattern].attempts++;
          if (prob.solved) patternStats[prob.pattern].solved++;
          patternStats[prob.pattern].totalScore += prob.score || 0;
        }
      });
    });

    const analysis = Object.entries(patternStats)
      .map(([pattern, stats]) => ({
        pattern,
        attempts:    stats.attempts,
        successRate: stats.attempts > 0 ? Math.round((stats.solved / stats.attempts) * 100) : 0,
        avgScore:    stats.attempts > 0 ? Math.round(stats.totalScore / stats.attempts) : 0,
      }))
      .sort((a, b) => a.successRate - b.successRate);

    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/interviews/count
// ---------------------------------------------------------------------------
router.get('/count', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const { count, error } = await supabase
      .from('interview_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    if (error) throw error;
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/interviews/recent
// ---------------------------------------------------------------------------
router.get('/recent', async (req, res) => {
  try {
    const { userId, limit = 3 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const { data: sessions, error } = await supabase
      .from('interview_sessions')
      .select('id, interview_type, custom_role, created_at, completed_at, overall_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    if (error) throw error;
    return res.json(
      sessions.map(s => ({
        _id:           s.id,
        id:            s.id,
        interviewType: s.interview_type,
        customRole:    s.custom_role,
        createdAt:     s.created_at,
        completedAt:   s.completed_at,
        overallScore:  s.overall_score,
      }))
    );
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/interviews  — save a completed session
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const dbRow = sessionToDb({ userId, ...rest });
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .insert(dbRow)
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json(sessionFromDb(session));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// ---------------------------------------------------------------------------
// PUT /api/interviews/:id — update a session (e.g. feedback, status)
// ---------------------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, transcript } = req.body;

    const updates = {};
    if (status !== undefined) {
      updates.status = status.replace('-', '_');
    }
    if (feedback !== undefined) updates.feedback = feedback;
    if (transcript !== undefined) updates.transcript = transcript;
    updates.completed_at = new Date().toISOString();

    const { data: session, error } = await supabase
      .from('interview_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json(sessionFromDb(session));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/interviews/cheat-report
// ---------------------------------------------------------------------------
router.post('/cheat-report', async (req, res) => {
  try {
    const { userId, ...rest } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const dbRow = sessionToDb({
      userId,
      ...rest,
      status:       'cheated',
      cheatPenalty: 100,
      completedAt:  new Date().toISOString(),
    });
    const { error } = await supabase.from('interview_sessions').insert(dbRow);
    if (error) throw error;
    return res.status(201).json({
      message:       'Cheating reported and session terminated',
      penaltyApplied: 100,
      newBalance:    0,
      status:        'cheated',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/interviews/patterns/seed
// Upserts the canonical DSA/System Design patterns into interview_patterns
// (mirrors InterviewPattern.seedPatterns() — data already seeded via SQL)
// ---------------------------------------------------------------------------
router.post('/patterns/seed', async (req, res) => {
  try {
    const patterns = [
      { category: 'dsa', name: 'Sliding Window',      slug: 'sliding_window', difficulty: 'medium', description: 'Technique for finding subarrays/substrings that satisfy certain conditions', examples: ['Maximum Sum Subarray of Size K', 'Longest Substring Without Repeating Characters', 'Minimum Window Substring'], tips: ['Identify the window boundaries', 'Expand/shrink based on condition', 'Track window state with hash map'] },
      { category: 'dsa', name: 'Two Pointer',         slug: 'two_pointer',    difficulty: 'easy',   description: 'Using two pointers to traverse array from different positions', examples: ['Two Sum II', 'Container With Most Water', 'Three Sum'], tips: ['Sort array if needed', 'Move pointers based on comparison', 'Handle duplicates carefully'] },
      { category: 'dsa', name: 'Binary Search',       slug: 'binary_search',  difficulty: 'medium', description: 'Divide and conquer search in sorted arrays', examples: ['Search in Rotated Sorted Array', 'Find First and Last Position', 'Median of Two Sorted Arrays'], tips: ['Always check for sorted condition', 'Handle edge cases carefully', 'Consider lower_bound vs upper_bound'] },
      { category: 'dsa', name: 'Dynamic Programming', slug: 'dp',             difficulty: 'hard',   description: 'Breaking problems into overlapping subproblems', examples: ['Climbing Stairs', 'Coin Change', 'Longest Common Subsequence'], tips: ['Define state clearly', 'Write recurrence relation first', 'Consider memoization vs tabulation'] },
      { category: 'dsa', name: 'Graphs',              slug: 'graphs',         difficulty: 'hard',   description: 'Graph traversal and shortest path algorithms', examples: ['Number of Islands', 'Course Schedule', "Dijkstra's Algorithm"], tips: ['Choose BFS for shortest path in unweighted graphs', 'Use DFS for exhaustive search', 'Track visited nodes'] },
      { category: 'dsa', name: 'Trees',               slug: 'trees',          difficulty: 'medium', description: 'Binary tree and BST operations', examples: ['Invert Binary Tree', 'Lowest Common Ancestor', 'Serialize and Deserialize'], tips: ['Consider recursive vs iterative', 'Use level-order for breadth problems', 'Handle null nodes carefully'] },
      { category: 'dsa', name: 'Stack & Queue',       slug: 'stack_queue',    difficulty: 'medium', description: 'LIFO and FIFO data structure problems', examples: ['Valid Parentheses', 'Next Greater Element', 'Implement Queue using Stacks'], tips: ['Stack for matching pairs', 'Monotonic stack for next greater/smaller', 'Queue for BFS'] },
      { category: 'system-design', name: 'Scalability', slug: 'scalability',  difficulty: 'hard',   description: 'Designing for horizontal and vertical scaling', examples: ['Design Twitter', 'Design URL Shortener', 'Design Netflix'], tips: ['Consider read vs write ratio', 'Use caching strategically', 'Partition data effectively'] },
    ];

    const { error } = await supabase
      .from('interview_patterns')
      .upsert(patterns, { onConflict: 'slug' });

    if (error) throw error;
    return res.json({ message: 'Patterns seeded successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
