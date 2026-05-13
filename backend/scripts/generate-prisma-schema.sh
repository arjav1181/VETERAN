#!/bin/bash
# Generates a valid Prisma schema from template by replacing DATABASE_PROVIDER placeholder

PROVIDER="${DATABASE_PROVIDER:-sqlite}"
TEMPLATE="backend/src/prisma/schema.prisma.template"
OUTPUT="backend/src/prisma/schema.prisma"

if [ ! -f "$TEMPLATE" ]; then
  echo "Template not found: $TEMPLATE"
  exit 1
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/__DATABASE_PROVIDER__/$PROVIDER/g" "$OUTPUT"
else
  sed -i "s/__DATABASE_PROVIDER__/$PROVIDER/g" "$OUTPUT"
fi

echo "Generated schema with provider: $PROVIDER"
