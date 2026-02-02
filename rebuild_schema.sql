-- ==========================================
-- DANGER: This script drops existing tables!
-- Run this in your Supabase SQL Editor.
-- ==========================================

-- 1. Drop existing tables (CASCADE handles views/triggers)
DROP TABLE IF EXISTS photographer_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create the unified 'profiles' table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  -- Core Identity
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT,
  profile_image_url TEXT,
  
  -- Contact & Bio
  phone TEXT,
  location TEXT,
  bio TEXT,
  
  -- Professional Details
  experience NUMERIC, -- Years of experience
  hourly_rate NUMERIC, -- Cost per hour
  specialties TEXT[], -- Array of strings e.g. ['Wedding', 'Nature']
  portfolio_url TEXT, -- External portfolio link
  
  -- Availability
  availability BOOLEAN DEFAULT true
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Allow public read access (so anyone can view profiles)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Allow users to insert their *own* profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their *own* profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 5. Auto-update Trigger for 'updated_at'
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TRIGGER handle_updated_at 
BEFORE UPDATE ON profiles 
FOR EACH ROW 
EXECUTE PROCEDURE moddatetime (updated_at);
