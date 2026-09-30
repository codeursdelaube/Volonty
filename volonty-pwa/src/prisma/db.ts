import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

// Module-level singleton — lives for the process lifetime, never close in request handlers.
export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL'],
});
