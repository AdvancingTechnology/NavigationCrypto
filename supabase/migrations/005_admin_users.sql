-- Admin user promotion
-- Run this migration AFTER initial admin users have signed up
-- This upgrades specific users to admin role with enterprise plan

-- Promote initial admins
-- These users should sign up through the normal flow first
UPDATE public.profiles
SET
  role = 'admin',
  plan = 'enterprise',
  updated_at = NOW()
WHERE email IN (
  'elijah@advancingtechnology.online',
  'kingdomtrav1589@gmail.com',
  'strunkxrp@proton.me'
);

-- Verify admin promotion (optional logging)
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.profiles
  WHERE role = 'admin';

  RAISE NOTICE 'Admin users promoted: %', admin_count;
END $$;
