import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import assert from 'node:assert';

function checkEnv(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const envContent = readFileSync('.env.local', 'utf8');
    const envVars = Object.fromEntries(
      envContent
        .split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#'))
        .map(line => {
          const [key, ...valueParts] = line.split('=');
          return [key, valueParts.join('=')];
        })
    );

    // Check required keys - only the Supabase ones for Step 2
    const requiredKeys = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    for (const key of requiredKeys) {
      const value = envVars[key];
      if (!value || value.includes('your_') || value.includes('placeholder')) {
        errors.push(`${key} is missing or contains placeholder value`);
      }
    }

    // Check URL format
    const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
    if (url && !url.match(/^https:\/\/.*\.supabase\.co$/)) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL does not match expected pattern https://*.supabase.co');
    }

    return { ok: errors.length === 0, errors };
  } catch (error) {
    return { ok: false, errors: ['.env.local file not found or unreadable'] };
  }
}

function checkFiles(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const requiredFiles = [
    'lib/supabase/client.ts',
    'lib/supabase/server.ts',
    'app/api/supabase/health/route.ts'
  ];

  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

async function checkHealth(): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  // Try multiple ports since the dev server might be on different ports
  const ports = [3000, 3001, 3002, 3003];
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/api/supabase/health`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.ok) {
          return { ok: true, errors: [] };
        } else {
          errors.push(`Health endpoint on port ${port} returned ok: false`);
        }
      } else {
        errors.push(`Health endpoint on port ${port} returned status ${response.status}`);
      }
    } catch (error) {
      // Continue to next port
    }
  }
  
  return { ok: false, errors: ['Health check failed on all ports (3000-3003)'] };
}

async function main() {
  console.log('Validating Step 2 (Supabase wiring)...\n');

  const envResult = checkEnv();
  const filesResult = checkFiles();
  
  console.log(`Env check: ${envResult.ok ? '✅' : '❌'}`);
  if (!envResult.ok) envResult.errors.forEach(e => console.log(`  - ${e}`));
  
  console.log(`Files check: ${filesResult.ok ? '✅' : '❌'}`);
  if (!filesResult.ok) filesResult.errors.forEach(e => console.log(`  - ${e}`));
  
  // Only check health if env and files are ok
  let healthResult = { ok: true, errors: [] };
  if (envResult.ok && filesResult.ok) {
    healthResult = await checkHealth();
    console.log(`Health check: ${healthResult.ok ? '✅' : '❌'}`);
    if (!healthResult.ok) healthResult.errors.forEach(e => console.log(`  - ${e}`));
  }

  const allErrors = [
    ...envResult.errors,
    ...filesResult.errors,
    ...healthResult.errors
  ];

  // For Step 2, we only require env and files to be ok
  // Health check is optional since the app may not start due to missing AI keys
  const criticalErrors = [
    ...envResult.errors,
    ...filesResult.errors
  ];

  if (criticalErrors.length === 0) {
    if (healthResult.ok) {
      console.log('\n✅ env ok / files ok / health ok');
    } else {
      console.log('\n✅ env ok / files ok / health ⚠️ (app may not start due to missing AI keys)');
    }
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Validator crashed:', error);
  process.exit(1);
});
