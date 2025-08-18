import * as schema from '@/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

declare global {
  var postgresSqlClient: ReturnType<typeof postgres> | undefined;
}

let client: ReturnType<typeof postgres> | undefined;

if (process.env.NODE_ENV !== 'production') {
  if (!global.postgresSqlClient && env.POSTGRES_URL) {
    // Disable prefetch as it is not supported for "Transaction" pool mode
    global.postgresSqlClient = postgres(env.POSTGRES_URL, { prepare: false });
  }
  client = global.postgresSqlClient;
} else {
  // Disable prefetch as it is not supported for "Transaction" pool mode
  if (env.POSTGRES_URL) {
    client = postgres(env.POSTGRES_URL, { prepare: false });
  }
}

export const database = client ? drizzle(client, { schema }) : null;
