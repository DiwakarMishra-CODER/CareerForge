const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  profile_picture_url: { type: String, default: '' },
  full_name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  career_goals: { type: String, default: '' },
  current_role: { type: String, default: '' },
  experience_level: { type: String, default: 'entry' },
  industry: { type: String, default: '' },
  skills: { type: [String], default: [] },
  certifications: { type: [String], default: [] },
  education_degree: { type: String, default: '' },
  education_field: { type: String, default: '' },
  education_university: { type: String, default: '' },
  education_graduation_year: { type: Number, default: null },
  preferred_learning_style: { type: String, default: 'visual' },
  availability_hours_per_week: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
