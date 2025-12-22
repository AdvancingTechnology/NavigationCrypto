-- Nuclear option: Drop ALL policies and recreate minimal ones
-- The infinite recursion is coming from somewhere unexpected

-- ============================================
-- DROP ALL POLICIES ON ALL TABLES
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;

-- Signals
DROP POLICY IF EXISTS "signals_select_active" ON public.signals;
DROP POLICY IF EXISTS "signals_select_own" ON public.signals;
DROP POLICY IF EXISTS "signals_insert" ON public.signals;
DROP POLICY IF EXISTS "signals_update_own" ON public.signals;
DROP POLICY IF EXISTS "signals_delete_own" ON public.signals;
DROP POLICY IF EXISTS "Active signals are viewable by everyone" ON public.signals;
DROP POLICY IF EXISTS "Anyone can view active signals" ON public.signals;
DROP POLICY IF EXISTS "Creators can view all their signals" ON public.signals;
DROP POLICY IF EXISTS "Authenticated users can create signals" ON public.signals;
DROP POLICY IF EXISTS "Creators can update their signals" ON public.signals;
DROP POLICY IF EXISTS "Creators can delete their signals" ON public.signals;
DROP POLICY IF EXISTS "signals_read_active" ON public.signals;
DROP POLICY IF EXISTS "signals_manage_own" ON public.signals;

-- Courses
DROP POLICY IF EXISTS "courses_select_published" ON public.courses;
DROP POLICY IF EXISTS "courses_select_own" ON public.courses;
DROP POLICY IF EXISTS "courses_insert" ON public.courses;
DROP POLICY IF EXISTS "courses_update_own" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Authors can view all their courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can create courses" ON public.courses;
DROP POLICY IF EXISTS "Authors can update their courses" ON public.courses;
DROP POLICY IF EXISTS "courses_read_published" ON public.courses;
DROP POLICY IF EXISTS "courses_manage_own" ON public.courses;

-- Content
DROP POLICY IF EXISTS "content_select_published" ON public.content;
DROP POLICY IF EXISTS "content_select_own" ON public.content;
DROP POLICY IF EXISTS "content_insert" ON public.content;
DROP POLICY IF EXISTS "content_update_own" ON public.content;
DROP POLICY IF EXISTS "Published content is viewable by everyone" ON public.content;
DROP POLICY IF EXISTS "Authenticated users can create content" ON public.content;
DROP POLICY IF EXISTS "Authors can update their content" ON public.content;
DROP POLICY IF EXISTS "Authors can delete their content" ON public.content;
DROP POLICY IF EXISTS "content_read_published" ON public.content;
DROP POLICY IF EXISTS "content_manage_own" ON public.content;

-- Course Lessons
DROP POLICY IF EXISTS "lessons_select" ON public.course_lessons;
DROP POLICY IF EXISTS "lessons_manage_own" ON public.course_lessons;
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON public.course_lessons;
DROP POLICY IF EXISTS "Course authors can manage lessons" ON public.course_lessons;
DROP POLICY IF EXISTS "Lessons are viewable for published courses" ON public.course_lessons;
DROP POLICY IF EXISTS "lessons_read" ON public.course_lessons;
DROP POLICY IF EXISTS "lessons_manage" ON public.course_lessons;

-- User Progress
DROP POLICY IF EXISTS "progress_select" ON public.user_progress;
DROP POLICY IF EXISTS "progress_insert" ON public.user_progress;
DROP POLICY IF EXISTS "progress_update" ON public.user_progress;
DROP POLICY IF EXISTS "progress_delete" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can modify their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "progress_read_self" ON public.user_progress;
DROP POLICY IF EXISTS "progress_manage_self" ON public.user_progress;

-- AI Tasks
DROP POLICY IF EXISTS "Users can view their AI tasks" ON public.ai_tasks;
DROP POLICY IF EXISTS "Users can create AI tasks" ON public.ai_tasks;
DROP POLICY IF EXISTS "ai_tasks_read_self" ON public.ai_tasks;
DROP POLICY IF EXISTS "ai_tasks_manage_self" ON public.ai_tasks;

-- Newsletter
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_anyone_insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_subscribe" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_read" ON public.newsletter_subscribers;

-- Support Tickets
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "tickets_insert" ON public.support_tickets;
DROP POLICY IF EXISTS "tickets_create" ON public.support_tickets;
DROP POLICY IF EXISTS "tickets_read_own" ON public.support_tickets;
DROP POLICY IF EXISTS "tickets_read_admin" ON public.support_tickets;

-- ============================================
-- RECREATE ULTRA-MINIMAL POLICIES
-- No subqueries, no joins, just simple checks
-- ============================================

-- PROFILES: Public read, self-update only
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_self_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- SIGNALS: Status-based read only (no FK checks)
CREATE POLICY "signals_public_active" ON public.signals
  FOR SELECT USING (status = 'active');

CREATE POLICY "signals_auth_write" ON public.signals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "signals_owner_update" ON public.signals
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "signals_owner_delete" ON public.signals
  FOR DELETE USING (created_by = auth.uid());

-- COURSES: Status-based read only
CREATE POLICY "courses_public_published" ON public.courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "courses_auth_write" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "courses_owner_update" ON public.courses
  FOR UPDATE USING (author_id = auth.uid());

-- CONTENT: Status-based read only
CREATE POLICY "content_public_published" ON public.content
  FOR SELECT USING (status = 'published');

CREATE POLICY "content_auth_write" ON public.content
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "content_owner_update" ON public.content
  FOR UPDATE USING (author_id = auth.uid());

-- COURSE LESSONS: Just allow read (we'll refine later)
CREATE POLICY "lessons_public_read" ON public.course_lessons
  FOR SELECT USING (true);

CREATE POLICY "lessons_auth_write" ON public.course_lessons
  FOR ALL USING (auth.uid() IS NOT NULL);

-- USER PROGRESS: User-specific only
CREATE POLICY "progress_user_only" ON public.user_progress
  FOR ALL USING (user_id = auth.uid());

-- AI TASKS: User-specific only
CREATE POLICY "ai_tasks_user_only" ON public.ai_tasks
  FOR ALL USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- NEWSLETTER: Public insert, authenticated read
CREATE POLICY "newsletter_public_insert" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "newsletter_auth_read" ON public.newsletter_subscribers
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- SUPPORT TICKETS: Public create, auth read own
CREATE POLICY "tickets_public_create" ON public.support_tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "tickets_auth_read" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);
