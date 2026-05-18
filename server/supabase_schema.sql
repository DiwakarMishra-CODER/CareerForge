-- =============================================================
-- CareerForge — Supabase PostgreSQL Schema
-- Generated from Mongoose models for a 1:1 migration.
-- Run this entire file in your Supabase SQL Editor.
-- =============================================================

-- Enable the pgcrypto extension for gen_random_uuid()
-- (already available in Supabase by default, but safe to call)
create extension if not exists "pgcrypto";

-- =============================================================
-- TABLE: users
-- Source model: server/models/User.js
-- Notes:
--   • googleId is UNIQUE but nullable (sparse index equivalent)
--   • password is nullable (Google-only users won't have one)
--   • No updated_at in the original schema, but we add it for
--     completeness and future use.
-- =============================================================
create table if not exists users (
  id                uuid        default gen_random_uuid() primary key,
  email             text        not null unique,
  password          text,                          -- nullable for Google-only users
  google_id         text        unique,             -- sparse unique: null allowed for multiple rows
  first_name        text,
  last_name         text,
  profile_picture   text,
  created_at        timestamptz default now()      not null,
  updated_at        timestamptz default now()      not null
);

-- Auto-update updated_at on every row change
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on users
  for each row execute function update_updated_at_column();

-- =============================================================
-- TABLE: profiles
-- Source model: server/models/Profile.js
-- Notes:
--   • userId in Mongoose was a String (stored as the Mongo _id string).
--     Here we use a proper UUID FK pointing to users(id).
--   • skills and certifications were [String] arrays → text[]
--   • All other scalar fields map 1:1.
-- =============================================================
create table if not exists profiles (
  id                          uuid        default gen_random_uuid() primary key,
  user_id                     uuid        not null unique references users(id) on delete cascade,
  profile_picture_url         text        default '',
  full_name                   text        default '',
  email                       text        default '',
  phone                       text        default '',
  location                    text        default '',
  linkedin                    text        default '',
  career_goals                text        default '',
  "current_role"              text        default '',
  experience_level            text        default 'entry',
  industry                    text        default '',
  skills                      text[]      default '{}',
  certifications              text[]      default '{}',
  education_degree            text        default '',
  education_field             text        default '',
  education_university        text        default '',
  education_graduation_year   integer,
  preferred_learning_style    text        default 'visual',
  availability_hours_per_week integer,
  created_at                  timestamptz default now() not null,
  updated_at                  timestamptz default now() not null
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

-- =============================================================
-- TABLE: resumes
-- Source model: server/models/Resume.js
-- Notes:
--   • personal_info (nested object) → JSONB
--   • experience, education, projects, certifications were
--     Mixed/array types → JSONB
-- =============================================================
create table if not exists resumes (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        not null references users(id) on delete cascade,
  title         text        default 'My Resume',
  template      text        default 'modern',
  personal_info jsonb       default '{}'::jsonb,
  summary       text        default '',
  experience    jsonb       default '[]'::jsonb,
  education     jsonb       default '[]'::jsonb,
  skills        text[]      default '{}',
  projects      jsonb       default '[]'::jsonb,
  certifications jsonb      default '[]'::jsonb,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index if not exists resumes_user_id_idx on resumes(user_id);

create trigger resumes_updated_at
  before update on resumes
  for each row execute function update_updated_at_column();

-- =============================================================
-- TABLE: resume_analyses
-- Source model: server/models/ResumeAnalysis.js
-- Notes:
--   • missingKeywords, improvementSuggestions, suitableRoles
--     were [String] → text[]
--   • analysisDate: we use created_at instead (redundant field removed)
-- =============================================================
create table if not exists resume_analyses (
  id                      uuid        default gen_random_uuid() primary key,
  user_id                 uuid        not null references users(id) on delete cascade,
  file_name               text,
  job_description         text,
  match_score             integer,
  missing_keywords        text[]      default '{}',
  improvement_suggestions text[]      default '{}',
  suitable_roles          text[]      default '{}',
  analysis_date           timestamptz default now() not null,
  created_at              timestamptz default now() not null,
  updated_at              timestamptz default now() not null
);

create index if not exists resume_analyses_user_id_idx on resume_analyses(user_id);

create trigger resume_analyses_updated_at
  before update on resume_analyses
  for each row execute function update_updated_at_column();

-- =============================================================
-- TABLE: career_roadmaps
-- Source model: server/models/CareerRoadmap.js
-- Notes:
--   • milestones was Mixed → JSONB
--   • completed_resources was [String] → text[]
-- =============================================================
create table if not exists career_roadmaps (
  id                  uuid        default gen_random_uuid() primary key,
  user_id             uuid        not null references users(id) on delete cascade,
  career_goal         text        default '',
  title               text        default '',
  timeline_months     integer     default 0,
  milestones          jsonb       default '[]'::jsonb,
  ai_generated        boolean     default true,
  progress_percentage integer     default 0,
  completed_resources text[]      default '{}',
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

create index if not exists career_roadmaps_user_id_idx on career_roadmaps(user_id);

create trigger career_roadmaps_updated_at
  before update on career_roadmaps
  for each row execute function update_updated_at_column();

-- =============================================================
-- TABLE: interview_sessions
-- Source model: server/models/InterviewSession.js
-- Notes:
--   • config (nested object) → JSONB
--   • scores (nested object) → JSONB
--   • patternsAsked ([{pattern, score, solved}]) → JSONB
--   • conversation ([{role, text, timestamp}]) → JSONB
--   • transcript → JSONB  (Mixed, backward compat)
--   • feedback → JSONB    (Mixed)
--   • problems ([{title, difficulty, solved, score, optimized, pattern}]) → JSONB
--   • strengths, weakPoints, suggestions were [String] → text[]
--   • status CHECK constraint mirrors the Mongoose enum
--   • interviewType CHECK constraint mirrors the Mongoose enum
-- =============================================================
create table if not exists interview_sessions (
  id                   uuid        default gen_random_uuid() primary key,
  user_id              uuid        not null references users(id) on delete cascade,
  interview_type       text        not null
                         check (interview_type in ('dsa','system-design','dbms','os','cn','hr','custom')),
  custom_role          text        default '',
  config               jsonb       default '{}'::jsonb,
  overall_score        integer     default 0 check (overall_score >= 0 and overall_score <= 100),
  scores               jsonb       default '{}'::jsonb,
  patterns_asked       jsonb       default '[]'::jsonb,
  conversation         jsonb       default '[]'::jsonb,
  transcript           jsonb       default '[]'::jsonb,
  feedback             jsonb,
  problems             jsonb       default '[]'::jsonb,
  strengths            text[]      default '{}',
  weak_points          text[]      default '{}',
  suggestions          text[]      default '{}',
  time_taken           integer     default 0,
  questions_attempted  integer     default 0,
  questions_total      integer     default 0,
  status               text        default 'completed'
                         check (status in ('in_progress','completed','abandoned','cheated')),
  cheat_penalty        integer     default 0,
  completed_at         timestamptz default now() not null,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null
);

-- Mirror the compound indexes from the Mongoose model
create index if not exists interview_sessions_user_completed_idx
  on interview_sessions(user_id, completed_at desc);

create index if not exists interview_sessions_user_type_idx
  on interview_sessions(user_id, interview_type);

create trigger interview_sessions_updated_at
  before update on interview_sessions
  for each row execute function update_updated_at_column();

-- =============================================================
-- TABLE: interview_patterns
-- Source model: server/models/InterviewPattern.js
-- Notes:
--   • examples, tips were [String] → text[]
--   • resources ([{title, url, type}]) → JSONB
--   • slug is UNIQUE (enforced by Mongoose and preserved here)
-- =============================================================
create table if not exists interview_patterns (
  id          uuid        default gen_random_uuid() primary key,
  category    text        not null check (category in ('dsa','system-design')),
  name        text        not null,
  slug        text        not null unique,
  description text,
  difficulty  text        default 'medium' check (difficulty in ('easy','medium','hard')),
  examples    text[]      default '{}',
  tips        text[]      default '{}',
  resources   jsonb       default '[]'::jsonb,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists interview_patterns_category_idx on interview_patterns(category);

create trigger interview_patterns_updated_at
  before update on interview_patterns
  for each row execute function update_updated_at_column();

-- =============================================================
-- SEED DATA: interview_patterns
-- Mirrors InterviewPattern.seedPatterns() static method.
-- Uses INSERT ... ON CONFLICT DO UPDATE (upsert) so it is safe
-- to run multiple times without creating duplicates.
-- =============================================================
insert into interview_patterns (category, name, slug, description, difficulty, examples, tips)
values
  (
    'dsa', 'Sliding Window', 'sliding_window',
    'Technique for finding subarrays/substrings that satisfy certain conditions',
    'medium',
    array['Maximum Sum Subarray of Size K', 'Longest Substring Without Repeating Characters', 'Minimum Window Substring'],
    array['Identify the window boundaries', 'Expand/shrink based on condition', 'Track window state with hash map']
  ),
  (
    'dsa', 'Two Pointer', 'two_pointer',
    'Using two pointers to traverse array from different positions',
    'easy',
    array['Two Sum II', 'Container With Most Water', 'Three Sum'],
    array['Sort array if needed', 'Move pointers based on comparison', 'Handle duplicates carefully']
  ),
  (
    'dsa', 'Binary Search', 'binary_search',
    'Divide and conquer search in sorted arrays',
    'medium',
    array['Search in Rotated Sorted Array', 'Find First and Last Position', 'Median of Two Sorted Arrays'],
    array['Always check for sorted condition', 'Handle edge cases carefully', 'Consider lower_bound vs upper_bound']
  ),
  (
    'dsa', 'Dynamic Programming', 'dp',
    'Breaking problems into overlapping subproblems',
    'hard',
    array['Climbing Stairs', 'Coin Change', 'Longest Common Subsequence'],
    array['Define state clearly', 'Write recurrence relation first', 'Consider memoization vs tabulation']
  ),
  (
    'dsa', 'Graphs', 'graphs',
    'Graph traversal and shortest path algorithms',
    'hard',
    array['Number of Islands', 'Course Schedule', 'Dijkstra''s Algorithm'],
    array['Choose BFS for shortest path in unweighted graphs', 'Use DFS for exhaustive search', 'Track visited nodes']
  ),
  (
    'dsa', 'Trees', 'trees',
    'Binary tree and BST operations',
    'medium',
    array['Invert Binary Tree', 'Lowest Common Ancestor', 'Serialize and Deserialize'],
    array['Consider recursive vs iterative', 'Use level-order for breadth problems', 'Handle null nodes carefully']
  ),
  (
    'dsa', 'Stack & Queue', 'stack_queue',
    'LIFO and FIFO data structure problems',
    'medium',
    array['Valid Parentheses', 'Next Greater Element', 'Implement Queue using Stacks'],
    array['Stack for matching pairs', 'Monotonic stack for next greater/smaller', 'Queue for BFS']
  ),
  (
    'system-design', 'Scalability', 'scalability',
    'Designing for horizontal and vertical scaling',
    'hard',
    array['Design Twitter', 'Design URL Shortener', 'Design Netflix'],
    array['Consider read vs write ratio', 'Use caching strategically', 'Partition data effectively']
  )
on conflict (slug) do update set
  category    = excluded.category,
  name        = excluded.name,
  description = excluded.description,
  difficulty  = excluded.difficulty,
  examples    = excluded.examples,
  tips        = excluded.tips,
  updated_at  = now();

-- =============================================================
-- END OF SCHEMA
-- =============================================================
