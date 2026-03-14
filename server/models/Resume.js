const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'My Resume' },
  template: { type: String, default: 'modern' },
  personal_info: {
    full_name: String,
    title: String,
    email: String,
    phone: String,
    location: String,
  },
  summary: { type: String, default: '' },
  experience: { type: mongoose.Schema.Types.Mixed, default: [] },
  education: { type: mongoose.Schema.Types.Mixed, default: [] },
  skills: { type: [String], default: [] },
  projects: { type: mongoose.Schema.Types.Mixed, default: [] },
  certifications: { type: mongoose.Schema.Types.Mixed, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
