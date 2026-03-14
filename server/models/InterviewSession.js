const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  job_title: { type: String, default: '' },
  transcript: { type: mongoose.Schema.Types.Mixed, default: [] },
  feedback: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
