# NavigationCrypto Supabase Setup

This directory contains all database migrations and configuration for NavigationCrypto.

## Database Schema

The database consists of the following tables:

### Core Tables

1. **profiles** - User profiles with plan and role management
2. **signals** - Trading signals (LONG/SHORT positions)
3. **content** - Educational content (courses, videos, articles, tutorials)
4. **courses** - Course catalog
5. **course_lessons** - Individual lessons within courses
6. **user_progress** - User completion tracking for courses
7. **ai_tasks** - AI agent task queue
8. **newsletter_subscribers** - Newsletter subscription management
9. **support_tickets** - Contact form submissions and support tickets

## Migration Files

Migrations are numbered and executed in order:

1. **001_initial_schema.sql** - Creates core tables, functions, triggers, and RLS policies
2. **002_add_roles.sql** - Adds admin role support and admin-specific RLS policies
3. **003_newsletter.sql** - Newsletter subscription table and policies
4. **004_support_tickets.sql** - Support ticket table with RLS for contact form
5. **005_admin_users.sql** - Promotes initial admin users (run AFTER users sign up)

## Row Level Security (RLS)

All tables have RLS enabled with the following general patterns:

- **Public Read**: Some tables allow anonymous reads (e.g., published content)
- **Authenticated Write**: Most tables require authentication for writes
- **User-Scoped Access**: Users can only access their own data (signals, progress, tickets)
- **Admin Override**: Admin users have full access to all tables

## Admin Setup

To create admin users:

1. Have the user sign up normally through the UI
2. Run the migration:
   ```sql
   -- Update the email addresses in 005_admin_users.sql
   -- Then apply the migration via Supabase Dashboard or CLI
   ```

Current admin emails (in 005_admin_users.sql):
- elijah@advancingtechnology.online
- kingdomtrav1589@gmail.com

## Support Tickets

The support_tickets table supports:

- **Anonymous Submissions**: Anyone can create tickets (for contact form)
- **User Association**: Links to auth.users when user is logged in
- **Status Tracking**: open, in_progress, resolved, closed
- **Admin Management**: Admins can view and update all tickets
- **Realtime**: Enabled for live updates

## Functions

### update_updated_at()
Trigger function that automatically updates the `updated_at` column on row updates.

### handle_new_user()
Trigger that creates a profile entry when a new user signs up via auth.users.

### is_admin()
Helper function to check if the current user has admin role.

## Applying Migrations

### Using Supabase CLI

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Or apply specific migration
supabase migration up
```

### Using Supabase Dashboard

1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of each migration file
3. Run them in order (001, 002, 003, etc.)

## Environment Variables

Required environment variables (see `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For admin operations
```

## TypeScript Types

TypeScript types are auto-generated in `/lib/supabase/types.ts`:

```typescript
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Signal = Database['public']['Tables']['signals']['Row']
// ... etc
```

## Testing RLS Policies

Test RLS policies in Supabase SQL Editor:

```sql
-- Test as anonymous user
SET request.jwt.claims TO '{}';
SELECT * FROM support_tickets;  -- Should return nothing

-- Test as authenticated user
SET request.jwt.claims TO '{"sub": "user-uuid", "email": "test@example.com"}';
SELECT * FROM support_tickets WHERE user_id = 'user-uuid';  -- Should return user's tickets

-- Test as admin
SET request.jwt.claims TO '{"sub": "admin-uuid"}';
-- First ensure admin has role='admin' in profiles table
SELECT * FROM support_tickets;  -- Should return all tickets
```

## Troubleshooting

### Migration Errors

If migrations fail:
1. Check migration order (001, 002, 003...)
2. Verify no duplicate table/function names
3. Check for missing dependencies (e.g., profiles table must exist for foreign keys)

### RLS Policy Issues

If users can't access data:
1. Verify RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Check policy conditions in migration files
3. Test policies using SET request.jwt.claims (see above)

### Admin Access Issues

If admin users can't access data:
1. Verify role='admin' in profiles table
2. Check that admin policies exist for the table
3. Ensure admin user is authenticated

## Schema Diagram

```
auth.users (Supabase Auth)
    |
    ├─> profiles (user metadata, plan, role)
    |
    ├─> signals (trading signals)
    |       └─> created_by FK -> profiles.id
    |
    ├─> content (educational content)
    |       └─> author_id FK -> profiles.id
    |
    ├─> courses (course catalog)
    |       ├─> author_id FK -> profiles.id
    |       └─> course_lessons (lessons)
    |               └─> course_id FK -> courses.id
    |
    ├─> user_progress (completion tracking)
    |       ├─> user_id FK -> profiles.id
    |       ├─> course_id FK -> courses.id
    |       └─> lesson_id FK -> course_lessons.id
    |
    ├─> ai_tasks (agent task queue)
    |       └─> created_by FK -> profiles.id
    |
    ├─> newsletter_subscribers (newsletter)
    |
    └─> support_tickets (contact form)
            └─> user_id FK -> auth.users.id (nullable)
```

## Next Steps

After applying migrations:

1. Verify all tables exist in Supabase Dashboard
2. Check RLS policies are active
3. Create initial admin users (sign up, then run 005_admin_users.sql)
4. Test contact form submission
5. Test admin dashboard access
