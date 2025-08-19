#!/usr/bin/env node

import crypto from 'crypto';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const SUPABASE_AUTH_HOOK_SECRET = process.env.SUPABASE_AUTH_HOOK_SECRET;
const LOCAL_URL = 'http://localhost:3000';

if (!SUPABASE_AUTH_HOOK_SECRET) {
  console.error('❌ SUPABASE_AUTH_HOOK_SECRET not found in .env.local');
  console.log('Please set SUPABASE_AUTH_HOOK_SECRET in your .env.local file');
  process.exit(1);
}

// Test payload
const payload = {
  type: 'magic_link',
  email: 'test@example.com',
  url: 'http://localhost:3000/auth/callback?token=test-token',
};

// Convert payload to string
const payloadString = JSON.stringify(payload);

// Generate HMAC signature
const signature = crypto
  .createHmac('sha256', SUPABASE_AUTH_HOOK_SECRET)
  .update(payloadString)
  .digest('hex');

console.log('🧪 Testing Email Webhook');
console.log('========================');
console.log(`URL: ${LOCAL_URL}/api/auth/send-email`);
console.log(`Payload: ${payloadString}`);
console.log(`Signature: ${signature}`);
console.log('');

async function testEmailWebhook() {
  try {
    const response = await fetch(`${LOCAL_URL}/api/auth/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-supabase-signature': signature,
      },
      body: payloadString,
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', result);
    } else {
      console.log('❌ Error!');
      console.log(`Status: ${response.status}`);
      console.log('Response:', result);
    }
  } catch (error) {
    console.log('❌ Network Error!');
    console.log('Make sure your development server is running: pnpm dev');
    console.error(error);
  }
}

// Run the test
testEmailWebhook();
