/**
 * Admin User Creation Script for NavigationCrypto
 *
 * Run this script to create admin accounts:
 * npx ts-node scripts/create-admins.ts
 *
 * Or run the SQL directly in Supabase SQL Editor
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin users to create
const ADMIN_USERS = [
  {
    email: 'elijah@advancingtechnology.online',
    full_name: 'Elijah Brown',
    role: 'admin' as const,
    plan: 'enterprise' as const,
  },
  {
    email: 'kingdomtrav1589@gmail.com',
    full_name: 'Travis (CEO)',
    role: 'admin' as const,
    plan: 'enterprise' as const,
  },
  // Add Scott when email is available
  // {
  //   email: 'scott@example.com',
  //   full_name: 'Scott (CMO)',
  //   role: 'admin' as const,
  //   plan: 'enterprise' as const,
  // },
];

async function createAdminUsers() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY not found.');
    console.log('\nPlease use the SQL method instead:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run the SQL below:\n');
    printSQLInstructions();
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  for (const user of ADMIN_USERS) {
    console.log(`Creating admin: ${user.email}...`);

    // Create auth user with temporary password
    const tempPassword = `NavCrypto2024!${Math.random().toString(36).slice(2, 8)}`;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: tempPassword,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: user.full_name
      }
    });

    if (authError) {
      console.error(`  ✗ Auth error for ${user.email}:`, authError.message);
      continue;
    }

    // Update profile to admin
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user!.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        plan: user.plan,
      });

    if (profileError) {
      console.error(`  ✗ Profile error for ${user.email}:`, profileError.message);
      continue;
    }

    console.log(`  ✓ Created ${user.email}`);
    console.log(`    Temporary password: ${tempPassword}`);
    console.log(`    (User should reset password on first login)\n`);
  }
}

function printSQLInstructions() {
  console.log(`
-- ========================================
-- NavigationCrypto Admin User Setup SQL
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Users sign up normally on the website with these emails:
--   - elijah@advancingtechnology.online
--   - kingdomtrav1589@gmail.com
--   - [Scott's email when available]

-- Step 2: After they sign up, run this SQL to grant admin access:

UPDATE profiles
SET role = 'admin', plan = 'enterprise'
WHERE email = 'elijah@advancingtechnology.online';

UPDATE profiles
SET role = 'admin', plan = 'enterprise'
WHERE email = 'kingdomtrav1589@gmail.com';

-- Add Scott when email is available:
-- UPDATE profiles
-- SET role = 'admin', plan = 'enterprise'
-- WHERE email = 'scott@example.com';

-- Verify admins:
SELECT id, email, full_name, role, plan, created_at
FROM profiles
WHERE role = 'admin';
`);
}

// Run if called directly
createAdminUsers().catch(console.error);
