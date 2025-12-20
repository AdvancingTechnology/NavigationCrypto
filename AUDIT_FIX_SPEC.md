# NavigationCrypto Audit Fix Specification

## Overview
This spec outlines all issues found in the 11-agent audit and the fixes required.

## Critical Issues (P0 - Must Fix)

### 1. Security: Missing Reset Password Page
- **Location**: `app/(auth)/reset-password/page.tsx` (missing)
- **Impact**: Password reset completely broken
- **Fix**: Create reset password page that handles Supabase auth callback

### 2. Security: Add Middleware Authentication
- **Location**: `middleware.ts` (missing)
- **Impact**: Admin routes not protected server-side
- **Fix**: Create middleware.ts with route protection

### 3. Frontend: Tailwind Dynamic Classes
- **Files**: `app/admin/analytics/page.tsx`, `app/admin/ai-agents/page.tsx`
- **Issue**: `text-${color}-400` won't compile
- **Fix**: Use static class maps or inline styles

### 4. Performance: Supabase Client Recreation
- **File**: `lib/supabase/hooks.ts`
- **Issue**: `createClient()` called every render
- **Fix**: Memoize client creation

### 5. Dead Links
- `/pricing` - Create pricing page or remove link
- `/admin/signals/new` - Use modal workflow instead
- `/admin/content/new` - Use modal workflow instead

## High Priority Issues (P1)

### 6. Performance: N+1 Queries
- **Files**: Dashboard pages
- **Issue**: 5 sequential queries = 600ms+ delay
- **Fix**: Combine queries, use parallel fetching

### 7. Accessibility: ARIA Labels
- **Impact**: WCAG A fails
- **Fix**: Add aria-labels to all icon buttons

### 8. Accessibility: Skip Link
- **Files**: All layouts
- **Fix**: Add skip-to-content link

### 9. Code Quality: TypeScript Any Types
- **Count**: 119 occurrences
- **Fix**: Replace with proper types

### 10. Performance: Image Optimization
- **File**: `app/(user)/dashboard/courses/page.tsx`
- **Fix**: Use Next.js Image component

## Database Migrations Required

### Migration 001: Support Tickets Table
```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### Migration 002: Admin Role Check Function
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Agent Assignment

| Agent | Responsibility | Files |
|-------|---------------|-------|
| Security Agent | Middleware, auth, reset-password | middleware.ts, reset-password/* |
| Performance Agent | Queries, caching, images | hooks.ts, dashboard pages |
| Accessibility Agent | ARIA, skip links, focus | All layouts, components |
| Code Quality Agent | TypeScript, hooks | All .tsx files |
| Supabase Agent | Migrations, RLS | supabase/migrations/* |
| Frontend Agent | Dead links, UI fixes | page.tsx files |

## Success Criteria
- [ ] All dead links resolved
- [ ] Build passes without warnings
- [ ] WCAG 2.1 Level A compliance
- [ ] No TypeScript `any` types
- [ ] Admin authentication at middleware level
- [ ] All migrations applied successfully
