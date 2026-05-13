/**
 * Prepares the Prisma schema before generation.
 * Replaces the __DATABASE_PROVIDER__ placeholder with the actual provider from env.
 * This is needed because Prisma does not support env() in the provider field.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schemaPath = resolve(import.meta.dirname, '../src/prisma/schema.prisma');
const templatePath = resolve(import.meta.dirname, '../src/prisma/schema.prisma.template');
const provider = process.env.DATABASE_PROVIDER || 'sqlite';

// If template doesn't exist, create it from current schema
try {
  readFileSync(templatePath);
} catch {
  const currentSchema = readFileSync(schemaPath, 'utf-8');
  const templated = currentSchema.replace(
    /provider\s*=\s*"(postgresql|sqlite)"/,
    'provider = "__DATABASE_PROVIDER__"'
  );
  writeFileSync(templatePath, templated, 'utf-8');
  console.log('Created schema template from existing schema');
}

// Read template and replace placeholder
const template = readFileSync(templatePath, 'utf-8');
const schema = template.replace('__DATABASE_PROVIDER__', provider);
writeFileSync(schemaPath, schema, 'utf-8');

console.log(`Schema prepared with provider: ${provider}`);
