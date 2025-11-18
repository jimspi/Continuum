import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  const checks = {
    timestamp: new Date().toISOString(),
    auth: false,
    openai: false,
    database: false,
    tables: {
      users: false,
      profile: false,
      memories: false,
    },
    errors: [] as string[],
  };

  try {
    // Check authentication
    const { userId } = await auth();
    checks.auth = !!userId;

    // Check OpenAI API key
    checks.openai = !!process.env.OPENAI_API_KEY;
    if (!checks.openai) {
      checks.errors.push('OPENAI_API_KEY not configured');
    }

    // Check database connection
    if (!process.env.POSTGRES_URL) {
      checks.errors.push('POSTGRES_URL not configured');
    } else {
      try {
        // Test database connection
        await sql`SELECT 1`;
        checks.database = true;

        // Check if tables exist
        const tablesResult = await sql`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name IN ('users', 'profile', 'memories')
        `;

        const existingTables = tablesResult.rows.map((r: any) => r.table_name);
        checks.tables.users = existingTables.includes('users');
        checks.tables.profile = existingTables.includes('profile');
        checks.tables.memories = existingTables.includes('memories');

        if (!checks.tables.users) checks.errors.push('users table does not exist');
        if (!checks.tables.profile) checks.errors.push('profile table does not exist');
        if (!checks.tables.memories) checks.errors.push('memories table does not exist');
      } catch (dbError: any) {
        checks.database = false;
        checks.errors.push(`Database error: ${dbError.message}`);
      }
    }
  } catch (error: any) {
    checks.errors.push(`Health check error: ${error.message}`);
  }

  const allHealthy =
    checks.auth &&
    checks.openai &&
    checks.database &&
    checks.tables.users &&
    checks.tables.profile &&
    checks.tables.memories;

  return NextResponse.json({
    healthy: allHealthy,
    ...checks,
  });
}
