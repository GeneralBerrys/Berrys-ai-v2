#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkDatabaseHealth() {
  console.log('🔍 Database Health Check');
  console.log('========================');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // Check if we can connect
    console.log('1. Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('project')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      return;
    }
    console.log('✅ Connection successful');
    console.log('');

    // Get table information
    console.log('2. Checking table schema...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_info');
    
    if (tablesError) {
      console.log('⚠️  Could not get table info via RPC, trying direct query...');
      
      // Fallback: try to get basic table info
      const { data: projectCount, error: countError } = await supabase
        .from('project')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Could not query projects table:', countError.message);
        return;
      }
      
      console.log('✅ Projects table exists');
      console.log(`   Rows: ${projectCount?.length ?? 0}`);
    } else {
      console.log('✅ Table information:');
      tables?.forEach((table: any) => {
        console.log(`   - ${table.table_name}: ${table.rls_enabled ? 'RLS enabled' : 'RLS disabled'}`);
      });
    }
    console.log('');

    // Count projects
    console.log('3. Counting projects...');
    const { count, error: countError } = await supabase
      .from('project')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting projects:', countError.message);
      return;
    }
    
    console.log(`✅ Total projects: ${count}`);
    console.log('');

    // Check for RLS policies
    console.log('4. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'project');
    
    if (policiesError) {
      console.log('⚠️  Could not check RLS policies (requires admin access)');
    } else {
      console.log('✅ RLS policies:');
      policies?.forEach((policy: any) => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} on ${policy.tablename}`);
      });
    }
    console.log('');

    console.log('🎉 Database health check completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabaseHealth();
