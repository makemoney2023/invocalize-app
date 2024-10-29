import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ENV } from '@/lib/config';
import * as schema from './schema';

const queryClient = postgres(ENV.DATABASE_URL);
export const db = drizzle(queryClient, { schema });

