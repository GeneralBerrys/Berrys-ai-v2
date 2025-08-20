#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.env.USER_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

if (!USER_ID) {
  console.error('❌ Missing USER_ID environment variable');
  console.error('Usage: USER_ID=<uuid> pnpm dlx tsx scripts/seed-demo.mts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedDemoProject() {
  console.log('🌱 Seeding Demo Project');
  console.log('=======================');
  console.log(`User ID: ${USER_ID}`);
  console.log('');

  try {
    // Check if user exists
    console.log('1. Checking if user exists...');
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(USER_ID);
    
    if (userError || !user.user) {
      console.error('❌ User not found:', userError?.message || 'User does not exist');
      return;
    }
    
    console.log(`✅ User found: ${user.user.email}`);
    console.log('');

    // Check if user already has projects
    console.log('2. Checking existing projects...');
    const { data: existingProjects, error: projectsError } = await supabase
      .from('project')
      .select('id, name')
      .eq('user_id', USER_ID);
    
    if (projectsError) {
      console.error('❌ Error checking existing projects:', projectsError.message);
      return;
    }
    
    console.log(`Found ${existingProjects?.length || 0} existing projects`);
    
    if (existingProjects && existingProjects.length > 0) {
      console.log('Existing projects:');
      existingProjects.forEach((project: any) => {
        console.log(`   - ${project.name} (${project.id})`);
      });
      console.log('');
      console.log('⚠️  User already has projects. Skipping demo project creation.');
      return;
    }
    console.log('');

    // Create demo project
    console.log('3. Creating demo project...');
    const demoProject = {
      name: 'My First Project',
      user_id: USER_ID,
      transcription_model: 'whisperx:base',
      vision_model: 'gpt-4o-mini',
      content: {
        nodes: [
          {
            id: 'demo-node-1',
            type: 'text',
            position: { x: 100, y: 100 },
            data: { content: 'Welcome to Berrys! This is your first project.' }
          }
        ],
        edges: []
      },
      demo_project: true
    };

    const { data: newProject, error: insertError } = await supabase
      .from('project')
      .insert(demoProject)
      .select('id, name, created_at')
      .single();
    
    if (insertError) {
      console.error('❌ Error creating demo project:', insertError.message);
      return;
    }
    
    console.log('✅ Demo project created successfully!');
    console.log(`   ID: ${newProject.id}`);
    console.log(`   Name: ${newProject.name}`);
    console.log(`   Created: ${newProject.created_at}`);
    console.log('');

    console.log('🎉 Demo project seeding completed!');
    console.log(`   User can now access: /projects/${newProject.id}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

seedDemoProject();
