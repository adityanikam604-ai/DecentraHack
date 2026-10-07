-- ============================================================
-- DecentraHack: AI-Powered Adaptive Learning Platform
-- Supabase Database Schema (MVP)
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: learner_profiles
-- Stores learner's academic level, preferences, interests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learner_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  education_level       TEXT NOT NULL DEFAULT 'undergraduate'
                          CHECK (education_level IN ('classes_1_10','classes_11_12','undergraduate','postgraduate')),
  current_level         TEXT NOT NULL DEFAULT 'beginner'
                          CHECK (current_level IN ('beginner','intermediate','advanced')),
  interests             TEXT[]    NOT NULL DEFAULT '{}',
  preferred_explanation TEXT      NOT NULL DEFAULT 'real-world examples'
                          CHECK (preferred_explanation IN ('real-world examples','theoretical','visual','step-by-step')),
  strengths             TEXT[]    NOT NULL DEFAULT '{}',
  needs_practice        TEXT[]    NOT NULL DEFAULT '{}',
  difficulty_preference TEXT      NOT NULL DEFAULT 'medium'
                          CHECK (difficulty_preference IN ('easy','medium','hard')),
  learning_goals        TEXT      NOT NULL DEFAULT '',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ============================================================
-- TABLE: subjects
-- Available subjects (seeded below)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT '📚',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: topics
-- Topics within each subject
-- ============================================================
CREATE TABLE IF NOT EXISTS public.topics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id    UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  order_index   INT  NOT NULL DEFAULT 0,
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, slug)
);

-- ============================================================
-- TABLE: learner_subjects
-- Maps a learner to a subject they are studying
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learner_subjects (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, subject_id)
);

-- ============================================================
-- TABLE: learning_progress
-- Per-topic mastery and completion for each learner
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id            UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  progress_percentage INT  NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  mastery_score       INT  NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  completed           BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, topic_id)
);

-- ============================================================
-- TABLE: assessments
-- Diagnostic and final assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id   UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id     UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('diagnostic','practice','final')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  total_score  INT,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- TABLE: assessment_attempts
-- Each question answered in an assessment
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  topic         TEXT NOT NULL DEFAULT '',
  difficulty    TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  question_type TEXT NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq','conceptual','coding','scenario')),
  user_answer   TEXT NOT NULL DEFAULT '',
  correct_answer TEXT NOT NULL DEFAULT '',
  is_correct    BOOLEAN NOT NULL DEFAULT FALSE,
  time_taken    INT  NOT NULL DEFAULT 0,   -- seconds
  hints_used    INT  NOT NULL DEFAULT 0,
  attempts      INT  NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: activity_attempts
-- Practice activity performance tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_attempts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id       UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question       TEXT NOT NULL,
  difficulty     TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  question_type  TEXT NOT NULL DEFAULT 'mcq',
  user_answer    TEXT NOT NULL DEFAULT '',
  correct_answer TEXT NOT NULL DEFAULT '',
  is_correct     BOOLEAN NOT NULL DEFAULT FALSE,
  time_taken     INT  NOT NULL DEFAULT 0,
  hints_used     INT  NOT NULL DEFAULT 0,
  attempts       INT  NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: learner_behaviour
-- Raw behavioural signals for adaptive decisions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learner_behaviour (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id    UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,   -- e.g. 'wrong_answer', 'hint_requested', 'topic_completed'
  event_data  JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: ui_preferences
-- Adaptive UI configuration per learner
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ui_preferences (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  font_size        TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small','medium','large')),
  density          TEXT NOT NULL DEFAULT 'medium' CHECK (density IN ('low','medium','high')),
  content_per_page INT  NOT NULL DEFAULT 3,
  hints_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  visual_mode      BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ============================================================
-- TABLE: achievements
-- Learner achievements / badges
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT '🏆',
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: certificates
-- Certificate records after mastery achieved
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id         UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  certificate_id     TEXT NOT NULL UNIQUE,   -- e.g. CERT-DSA-2026-00125
  mastery_score      INT  NOT NULL CHECK (mastery_score BETWEEN 0 AND 100),
  issued_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blockchain_hash    TEXT,
  blockchain_tx      TEXT,
  blockchain_verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.learner_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_subjects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_behaviour   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_preferences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates        ENABLE ROW LEVEL SECURITY;

-- subjects & topics: public read, no public write
CREATE POLICY "subjects_public_read"  ON public.subjects  FOR SELECT USING (true);
CREATE POLICY "topics_public_read"    ON public.topics    FOR SELECT USING (true);

-- Certificates: public read for verification page, private write
CREATE POLICY "certificates_public_read" ON public.certificates FOR SELECT USING (true);

-- User-scoped policies (own data only)
CREATE POLICY "learner_profiles_own"      ON public.learner_profiles    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "learner_subjects_own"      ON public.learner_subjects     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "learning_progress_own"     ON public.learning_progress    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "assessments_own"           ON public.assessments          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "assessment_attempts_own"   ON public.assessment_attempts  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "activity_attempts_own"     ON public.activity_attempts    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "learner_behaviour_own"     ON public.learner_behaviour     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ui_preferences_own"        ON public.ui_preferences        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "achievements_own"          ON public.achievements          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "certificates_own_write"    ON public.certificates          FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_learner_profiles_updated_at
  BEFORE UPDATE ON public.learner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_ui_preferences_updated_at
  BEFORE UPDATE ON public.ui_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SEED: Subjects
-- ============================================================
INSERT INTO public.subjects (name, slug, description, icon) VALUES
  ('Data Structures & Algorithms', 'dsa',              'Master core DSA concepts from arrays to graphs.',    '🧮'),
  ('Object-Oriented Programming',  'oop',              'Learn OOP principles with real-world examples.',     '🧱'),
  ('Web Development',              'web-development',  'Build modern web applications.',                     '🌐'),
  ('Artificial Intelligence',      'ai-ml',            'Explore AI and machine learning fundamentals.',      '🤖'),
  ('Data Science',                 'data-science',     'Analyse data and extract insights.',                 '📊'),
  ('Database Management Systems',  'dbms',             'Design and query relational databases.',             '🗄️'),
  ('Operating Systems',            'os',               'Understand OS concepts and system programming.',     '💻'),
  ('Computer Networks',            'computer-networks','Learn networking protocols and architecture.',       '🌍')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: DSA Topics (primary MVP subject)
-- ============================================================
INSERT INTO public.topics (subject_id, name, slug, order_index, prerequisites)
SELECT s.id, t.name, t.slug, t.order_index, t.prerequisites
FROM public.subjects s,
  (VALUES
    ('Arrays',        'arrays',       1, ARRAY[]::TEXT[]),
    ('Strings',       'strings',      2, ARRAY['arrays']),
    ('Linked Lists',  'linked-lists', 3, ARRAY['arrays']),
    ('Stack',         'stack',        4, ARRAY['arrays','linked-lists']),
    ('Queue',         'queue',        5, ARRAY['arrays','linked-lists']),
    ('Trees',         'trees',        6, ARRAY['linked-lists']),
    ('Graphs',        'graphs',       7, ARRAY['trees']),
    ('Sorting',       'sorting',      8, ARRAY['arrays']),
    ('Searching',     'searching',    9, ARRAY['arrays','sorting'])
  ) AS t(name, slug, order_index, prerequisites)
WHERE s.slug = 'dsa'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- AUTO-CREATE learner_profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.learner_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.ui_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
