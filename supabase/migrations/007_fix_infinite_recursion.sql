-- Fix infinite recursion in RLS policies
-- The issue is that signals.created_by references profiles,
-- but profiles might have policies that reference back

-- ============================================
-- DROP PROBLEMATIC POLICIES
-- ============================================

-- Drop all signal policies and recreate without FK checks
DROP POLICY IF EXISTS "Anyone can view active signals" ON public.signals;
DROP POLICY IF EXISTS "Creators can view all their signals" ON public.signals;
DROP POLICY IF EXISTS "Authenticated users can create signals" ON public.signals;
DROP POLICY IF EXISTS "Creators can update their signals" ON public.signals;
DROP POLICY IF EXISTS "Creators can delete their signals" ON public.signals;

-- Drop course policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Authors can view all their courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can create courses" ON public.courses;
DROP POLICY IF EXISTS "Authors can update their courses" ON public.courses;
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;

-- ============================================
-- RECREATE SIMPLE POLICIES (NO FK LOOKUPS)
-- ============================================

-- Signals: Simple status check, no profile lookup
CREATE POLICY "signals_select_active" ON public.signals
  FOR SELECT USING (status = 'active');

CREATE POLICY "signals_select_own" ON public.signals
  FOR SELECT USING (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "signals_insert" ON public.signals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "signals_update_own" ON public.signals
  FOR UPDATE USING (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "signals_delete_own" ON public.signals
  FOR DELETE USING (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Courses: Simple status check
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "courses_select_own" ON public.courses
  FOR SELECT USING (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "courses_insert" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "courses_update_own" ON public.courses
  FOR UPDATE USING (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- Content: Simple status check
DROP POLICY IF EXISTS "Published content is viewable by everyone" ON public.content;
DROP POLICY IF EXISTS "Authenticated users can create content" ON public.content;
DROP POLICY IF EXISTS "Authors can update their content" ON public.content;
DROP POLICY IF EXISTS "Authors can delete their content" ON public.content;

CREATE POLICY "content_select_published" ON public.content
  FOR SELECT USING (status = 'published');

CREATE POLICY "content_select_own" ON public.content
  FOR SELECT USING (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY "content_insert" ON public.content
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "content_update_own" ON public.content
  FOR UPDATE USING (auth.uid() IS NOT NULL AND author_id = auth.uid());

-- Course lessons: Check parent course status without recursion
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.course_lessons;
DROP POLICY IF EXISTS "Course authors can manage lessons" ON public.course_lessons;
DROP POLICY IF EXISTS "Lessons are viewable for published courses" ON public.course_lessons;

CREATE POLICY "lessons_select" ON public.course_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.status = 'published'
    )
  );

CREATE POLICY "lessons_manage_own" ON public.course_lessons
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.author_id = auth.uid()
    )
  );

-- User progress: Simple user check
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can modify their own progress" ON public.user_progress;

CREATE POLICY "progress_select" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "progress_insert" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "progress_delete" ON public.user_progress
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FIX PROFILES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Simple profile policies without any FK lookups
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
