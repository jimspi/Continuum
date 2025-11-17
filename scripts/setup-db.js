// Database setup script for Vercel Postgres
// Run this after setting up your Vercel Postgres database
// Usage: node scripts/setup-db.js

const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('Setting up Continuum database...');

    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await sql.query(statement);
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
