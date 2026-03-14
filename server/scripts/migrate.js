/**
 * Migration Script: Supabase → MongoDB
 * 
 * Usage:
 *   1. Fill in your Supabase credentials below (or use a .env file).
 *   2. Ensure MONGO_URI is set in server/.env
 *   3. Run: node server/scripts/migrate.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');

// --- Configure these ---
const SUPABASE_URL = 'https://jghydbzyidsctmzgsstu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnaHlkYnp5aWRzY3Rtemdzc3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTkxOTAsImV4cCI6MjA3MjYzNTE5MH0.jhkKnksZYZIogLNyhoE5iOT2AMpuPxn3KK7B1CmEMf8';
// -------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mongoose Models
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const CareerRoadmap = require('../models/CareerRoadmap');
const InterviewSession = require('../models/InterviewSession');

async function migrateTable(tableName, Model, mapFn) {
  console.log(`\n📋 Migrating table: ${tableName}...`);
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`  ❌ Error fetching ${tableName}:`, error.message);
    return;
  }
  if (!data || data.length === 0) {
    console.log(`  ⚠️  No data found in ${tableName}. Skipping.`);
    return;
  }
  console.log(`  Found ${data.length} records.`);
  const mapped = data.map(mapFn);
  try {
    // Use insertMany with ordered:false to continue past duplicates
    await Model.insertMany(mapped, { ordered: false });
    console.log(`  ✅ Inserted ${mapped.length} records into MongoDB.`);
  } catch (err) {
    if (err.code === 11000) {
      console.log(`  ⚠️  Some records already exist (duplicate key). Continuing.`);
    } else {
      console.error(`  ❌ Error inserting ${tableName}:`, err.message);
    }
  }
}

async function migrate() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set. Please create server/.env with your MongoDB URI.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Profiles: Supabase uses `id` (UUID) as PK; we map it to `userId`
  await migrateTable('profiles', Profile, (row) => ({
    userId: row.id,
    profile_picture_url: row.profile_picture_url || '',
    full_name: row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    location: row.location || '',
    linkedin: row.linkedin || '',
    career_goals: row.career_goals || '',
    current_role: row.current_role || '',
    experience_level: row.experience_level || 'entry',
    industry: row.industry || '',
    skills: row.skills || [],
    certifications: row.certifications || [],
    education_degree: row.education_degree || '',
    education_field: row.education_field || '',
    education_university: row.education_university || '',
    education_graduation_year: row.education_graduation_year || null,
    preferred_learning_style: row.preferred_learning_style || 'visual',
    availability_hours_per_week: row.availability_hours_per_week || null,
  }));

  // Resumes
  await migrateTable('resumes', Resume, (row) => ({
    userId: row.user_id,
    title: row.title || 'My Resume',
    template: row.template || 'modern',
    personal_info: row.personal_info || {},
    summary: row.summary || '',
    experience: row.experience || [],
    education: row.education || [],
    skills: row.skills || [],
    projects: row.projects || [],
    certifications: row.certifications || [],
  }));

  // Career Roadmaps
  await migrateTable('career_roadmaps', CareerRoadmap, (row) => ({
    userId: row.user_id,
    career_goal: row.career_goal || '',
    title: row.title || '',
    timeline_months: row.timeline_months || 0,
    milestones: row.milestones || [],
    ai_generated: row.ai_generated ?? true,
    progress_percentage: row.progress_percentage || 0,
    completed_resources: row.completed_resources || [],
  }));

  // Interview Sessions
  await migrateTable('interview_sessions', InterviewSession, (row) => ({
    userId: row.user_id,
    job_title: row.job_title || '',
    transcript: row.transcript || [],
    feedback: row.feedback || null,
  }));

  console.log('\n🎉 Migration complete!');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
