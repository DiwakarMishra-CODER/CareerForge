const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    fileName: { type: String },
    jobDescription: { type: String },
    matchScore: { type: Number },
    missingKeywords: [String],
    improvementSuggestions: [String],
    suitableRoles: [String],
    analysisDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
