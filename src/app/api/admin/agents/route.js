import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const agents = await sql`SELECT id, name, email, phone, role, created_at FROM users WHERE role = 'agent' ORDER BY id DESC`;
    return NextResponse.json(agents);
  } catch (err) {
    console.error('Fetch agents error:', err);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}