import postgres from '@prisma/orm-postgres/runtime';
import { readFileSync } from 'fs';

const contractJson = JSON.parse(readFileSync('./src/prisma/contract.json', 'utf-8'));

try {
  const db = postgres({ contractJson, url: 'postgresql://test:test@localhost:5432/test' });
  console.log('OK - client created successfully');
  await db.close().catch(() => {});
} catch (e) {
  console.log('ERROR code:', e.code);
  console.log('ERROR message:', e.message || e.why || String(e));
}
