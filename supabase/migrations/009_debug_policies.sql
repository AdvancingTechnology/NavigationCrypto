-- Debug: List all policies to find the recursion source
-- Then disable RLS on profiles temporarily

-- First, let's just disable RLS on profiles to break the cycle
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Test if this fixes the issue - if yes, the problem is in profiles policies
-- We'll re-enable with simpler policies after testing
