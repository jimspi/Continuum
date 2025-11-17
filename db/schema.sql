-- Continuum Database Schema
-- Designed for Vercel Postgres

-- Users table (created from Clerk userId)
CREATE TABLE IF NOT EXISTS users (
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profile table (one row per user, stores evolving profile)
CREATE TABLE IF NOT EXISTS profile (
  user_id TEXT PRIMARY KEY REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  profile_json JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Memories table (all uploaded content and analysis)
CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  analysis JSONB,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(user_id, created_at DESC);
