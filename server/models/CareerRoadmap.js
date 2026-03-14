const mongoose = require('mongoose');

const careerRoadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  career_goal: { type: String, default: '' },
  title: { type: String, default: '' },
  timeline_months: { type: Number, default: 0 },
  milestones: { type: mongoose.Schema.Types.Mixed, default: [] },
  ai_generated: { type: Boolean, default: true },
  progress_percentage: { type: Number, default: 0 },
  completed_resources: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('CareerRoadmap', careerRoadmapSchema);
