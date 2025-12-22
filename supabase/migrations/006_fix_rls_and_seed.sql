-- Fix RLS policies and seed demo data
-- The issue is that current policies require auth.uid() but dashboard uses anon key

-- ============================================
-- FIX RLS POLICIES
-- ============================================

-- Drop existing restrictive policies on signals
DROP POLICY IF EXISTS "Active signals are viewable by everyone" ON public.signals;

-- Create new policy: Active signals are truly public (no auth required)
CREATE POLICY "Anyone can view active signals" ON public.signals
  FOR SELECT USING (status = 'active');

-- Allow authenticated users to view their own signals regardless of status
CREATE POLICY "Creators can view all their signals" ON public.signals
  FOR SELECT USING (auth.uid() = created_by);

-- Fix courses policy - published courses should be truly public
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;

CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view all their courses" ON public.courses
  FOR SELECT USING (auth.uid() = author_id);

-- Fix course_lessons policy
DROP POLICY IF EXISTS "Lessons are viewable for published courses" ON public.course_lessons;

CREATE POLICY "Anyone can view lessons of published courses" ON public.course_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_lessons.course_id
      AND courses.status = 'published'
    )
  );

-- Fix user_progress - users need to see their own, but we also need to handle empty state
-- Keep existing policy but add a service role bypass for seeding
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;

CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- SEED DEMO DATA
-- ============================================

-- Insert demo signals (XRP focus as requested)
INSERT INTO public.signals (pair, action, entry_price, take_profit, stop_loss, status, notes, ai_generated, created_at)
VALUES
  ('XRP/USDT', 'LONG', 2.35, 2.85, 2.15, 'active',
   'Strong support at $2.30 level. Expecting breakout above $2.50 resistance. Volume increasing.',
   true, NOW() - INTERVAL '2 hours'),

  ('BTC/USDT', 'LONG', 97500.00, 105000.00, 94000.00, 'active',
   'Bitcoin consolidating near ATH. Institutional inflows continue. Target: $105K before year end.',
   true, NOW() - INTERVAL '5 hours'),

  ('ETH/USDT', 'LONG', 3450.00, 4000.00, 3200.00, 'active',
   'Ethereum showing strength. ETH/BTC ratio improving. DeFi activity picking up.',
   true, NOW() - INTERVAL '8 hours'),

  ('XRP/USDT', 'LONG', 2.18, 2.50, 2.00, 'closed',
   'Target reached! +14.7% gain. Ripple momentum continues on favorable legal news.',
   true, NOW() - INTERVAL '2 days'),

  ('SOL/USDT', 'LONG', 185.00, 220.00, 170.00, 'active',
   'Solana ecosystem growing. DEX volume at record highs. Watch for breakout above $200.',
   true, NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

-- Update closed signal with profit/loss
UPDATE public.signals
SET profit_loss = 14.7, closed_at = NOW() - INTERVAL '1 day'
WHERE pair = 'XRP/USDT' AND status = 'closed' AND entry_price = 2.18;

-- Insert demo courses
INSERT INTO public.courses (title, description, thumbnail_url, price, status, lessons_count, duration_minutes, difficulty)
VALUES
  ('Crypto Fundamentals',
   'Master the basics of cryptocurrency, blockchain technology, and how to safely navigate the crypto markets.',
   '/images/courses/crypto-fundamentals.jpg',
   0, 'published', 8, 120, 'beginner'),

  ('Technical Analysis Mastery',
   'Learn to read charts like a pro. Understand candlestick patterns, indicators, and market structure.',
   '/images/courses/technical-analysis.jpg',
   29.99, 'published', 12, 180, 'intermediate'),

  ('Trading Psychology',
   'Master your emotions and develop the mental discipline needed for consistent trading success.',
   '/images/courses/trading-psychology.jpg',
   0, 'published', 6, 90, 'beginner'),

  ('Advanced DeFi Strategies',
   'Explore yield farming, liquidity provision, and advanced DeFi protocols for maximum returns.',
   '/images/courses/defi-strategies.jpg',
   49.99, 'published', 10, 150, 'advanced'),

  ('Risk Management',
   'Learn position sizing, stop-loss strategies, and portfolio management to protect your capital.',
   '/images/courses/risk-management.jpg',
   0, 'published', 5, 75, 'intermediate')
ON CONFLICT DO NOTHING;

-- Insert demo content/articles
INSERT INTO public.content (title, description, type, status, content_body, views, ai_generated, published_at)
VALUES
  ('XRP Price Prediction 2025: What to Expect',
   'Our analysis of XRP potential price targets for 2025 based on technical and fundamental factors.',
   'article', 'published',
   'XRP has shown remarkable strength in recent months following favorable legal developments. Our analysis suggests potential targets of $5-10 by end of 2025...',
   1250, true, NOW() - INTERVAL '3 days'),

  ('Understanding Market Cycles',
   'Learn how to identify bull and bear market cycles to time your entries and exits.',
   'tutorial', 'published',
   'Crypto markets move in cycles. Understanding these cycles is crucial for long-term success...',
   890, true, NOW() - INTERVAL '1 week'),

  ('Top 5 Mistakes New Traders Make',
   'Avoid these common pitfalls that cause 90% of new traders to lose money.',
   'article', 'published',
   'Trading crypto can be incredibly profitable, but most new traders fall into the same traps...',
   2100, false, NOW() - INTERVAL '2 weeks')
ON CONFLICT DO NOTHING;

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Make sure realtime is enabled for key tables
-- Note: This may fail if already added, which is fine
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- ============================================
-- GRANT ACCESS
-- ============================================

-- Ensure anon role can read public data
GRANT SELECT ON public.signals TO anon;
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.course_lessons TO anon;
GRANT SELECT ON public.content TO anon;

-- Authenticated users get more permissions
GRANT ALL ON public.signals TO authenticated;
GRANT ALL ON public.courses TO authenticated;
GRANT ALL ON public.course_lessons TO authenticated;
GRANT ALL ON public.content TO authenticated;
GRANT ALL ON public.user_progress TO authenticated;
