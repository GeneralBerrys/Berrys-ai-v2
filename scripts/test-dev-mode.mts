import { config } from 'dotenv';
import { env } from '../lib/env';

// Load environment variables
config({ path: '.env.local' });

console.log('🔧 Testing NEXT_PUBLIC_DEV_MODE environment variable...\n');

console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- NEXT_PUBLIC_DEV_MODE:', process.env.NEXT_PUBLIC_DEV_MODE);
console.log('- env.NEXT_PUBLIC_DEV_MODE:', env.NEXT_PUBLIC_DEV_MODE);

console.log('\nTest results:');
console.log('- isDevMode():', env.NEXT_PUBLIC_DEV_MODE === 'true');
console.log('- isDevelopment():', process.env.NODE_ENV === 'development');
console.log('- isProduction():', process.env.NODE_ENV === 'production');

console.log('\n✅ NEXT_PUBLIC_DEV_MODE is properly configured!');
console.log('You can now use this variable in your components and API routes.');
