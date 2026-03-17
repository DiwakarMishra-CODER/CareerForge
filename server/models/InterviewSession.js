const mongoose = require('mongoose');

const InterviewSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  interviewType: {
    type: String,
    enum: ['dsa', 'system-design', 'dbms', 'os', 'cn', 'hr', 'custom'],
    required: true
  },
  customRole: {
    type: String,
    default: ''
  },

  // Configuration used
  config: {
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    companyTarget: {
      type: String,
      enum: ['faang', 'product', 'service', 'startup'],
      default: 'product'
    },
    techStack: {
      type: String,
      default: 'javascript'
    },
    duration: {
      type: Number,
      default: 30
    }
  },

  // Results
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  scores: {
    problemSolving: { type: Number, min: 0, max: 100, default: 0 },
    communication: { type: Number, min: 0, max: 100, default: 0 },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    accuracy: { type: Number, min: 0, max: 100, default: 0 }
  },

  // Pattern tracking for DSA/System Design
  patternsAsked: [{
    pattern: String,
    score: { type: Number, min: 0, max: 100 },
    solved: Boolean
  }],

  // Conversation history
  conversation: [{
    role: { type: String, enum: ['ai', 'user'] },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // For backward compatibility with existing CareerForge code if needed
  transcript: { type: mongoose.Schema.Types.Mixed, default: [] },
  feedback: { type: mongoose.Schema.Types.Mixed, default: null },

  // Problems solved (for DSA)
  problems: [{
    title: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    solved: Boolean,
    score: { type: Number, min: 0, max: 100 },
    optimized: Boolean,
    pattern: String
  }],

  // Feedback
  strengths: [String],
  weakPoints: [String],
  suggestions: [String],

  // Timing
  timeTaken: { type: Number, default: 0 }, // in seconds
  questionsAttempted: { type: Number, default: 0 },
  questionsTotal: { type: Number, default: 0 },

  // Status
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned', 'cheated'],
    default: 'completed'
  },

  // Anti-cheat penalty (if cheated)
  cheatPenalty: {
    type: Number,
    default: 0
  },

  completedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for efficient querying
InterviewSessionSchema.index({ userId: 1, completedAt: -1 });
InterviewSessionSchema.index({ userId: 1, interviewType: 1 });

// Static method for getting pattern analysis
InterviewSessionSchema.statics.getPatternAnalysis = async function (userId) {
  const interviews = await this.find({
    userId,
    status: 'completed',
    interviewType: { $in: ['dsa', 'system-design'] }
  }).select('patternsAsked problems');

  const patternStats = {};

  interviews.forEach(interview => {
    interview.patternsAsked?.forEach(p => {
      if (!patternStats[p.pattern]) {
        patternStats[p.pattern] = { attempts: 0, solved: 0, totalScore: 0 };
      }
      patternStats[p.pattern].attempts++;
      if (p.solved) patternStats[p.pattern].solved++;
      patternStats[p.pattern].totalScore += p.score || 0;
    });

    interview.problems?.forEach(prob => {
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

  const analysis = Object.entries(patternStats).map(([pattern, stats]) => ({
    pattern,
    attempts: stats.attempts,
    successRate: stats.attempts > 0 ? Math.round((stats.solved / stats.attempts) * 100) : 0,
    avgScore: stats.attempts > 0 ? Math.round(stats.totalScore / stats.attempts) : 0
  }));

  analysis.sort((a, b) => a.successRate - b.successRate);
  return analysis;
};

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema);
