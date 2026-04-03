-- Legebot — Initial Schema
-- Run this in your Supabase SQL Editor

-- ─── USERS PROFILE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_type TEXT DEFAULT 'free'
    CHECK (subscription_type IN ('free', 'eleve', 'enseignant', 'ecole')),
  subscription_expires_at TIMESTAMPTZ,
  subscription_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ESSAYS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'generated'
    CHECK (type IN ('generated', 'corrected', 'learned')),
  score INTEGER,
  score_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DAILY USAGE ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE,
  generation_count INTEGER DEFAULT 0,
  learning_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- users_profile policies
CREATE POLICY "Users can view own profile"
  ON public.users_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.users_profile FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.users_profile FOR UPDATE USING (auth.uid() = id);

-- essays policies
CREATE POLICY "Users can view own essays"
  ON public.essays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own essays"
  ON public.essays FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own essays"
  ON public.essays FOR DELETE USING (auth.uid() = user_id);

-- daily_usage policies
CREATE POLICY "Users can manage own usage"
  ON public.daily_usage FOR ALL USING (auth.uid() = user_id);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER users_profile_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
