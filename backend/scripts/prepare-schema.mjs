import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, '../src/prisma/schema.prisma');
const templatePath = resolve(__dirname, '../src/prisma/schema.prisma.template');
const provider = process.env.DATABASE_PROVIDER || 'sqlite';

if (!existsSync(templatePath)) {
  let content;
  if (existsSync(schemaPath)) {
    content = readFileSync(schemaPath, 'utf-8');
  } else {
    console.error('Schema file not found');
    process.exit(1);
  }
  // Replace only the datasource provider (not the generator provider)
  content = content.replace(
    /(datasource db\s*\{[^}]*?provider\s*=\s*)"[^"]*"/s,
    '$1"__DATABASE_PROVIDER__"'
  );
  writeFileSync(templatePath, content, 'utf-8');
  console.log('Created schema template');
}

const template = readFileSync(templatePath, 'utf-8');
const result = template.replace('__DATABASE_PROVIDER__', provider);
writeFileSync(schemaPath, result, 'utf-8');
console.log(`Schema prepared: ${provider}`);
