import dns from 'node:dns';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

// Force IPv4 lookup first to prevent DNS timeouts on Windows when querying Supabase pooler
dns.setDefaultResultOrder('ipv4first');

// Module-level singleton — lives for the process lifetime, never close in request handlers.
export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL'],
});
