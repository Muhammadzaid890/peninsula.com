import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const SECRET_ADMIN_KEY = 'peninsula_admin_2026';

export async function POST(req) {
  try {
    // 1. Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('CRITICAL: DATABASE_URL is missing in environment variables!');
      return NextResponse.json(
        { error: 'Server setup issue: DATABASE_URL not found in .env.local' },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // 2. Parse request body safely
    const body = await req.json();
    const { name, email, phone, password, secretKey } = body;

    // 3. Verify Secret Security Key
    if (secretKey !== SECRET_ADMIN_KEY) {
      return NextResponse.json(
        { error: '❌ Invalid Secret Key! Admin registration denied.' },
        { status: 403 }
      );
    }

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 4. Ensure Table Exists First (Crash Protection)
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'agent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Encrypt Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Delete old email entry if existed and insert as fresh Admin
    await sql`DELETE FROM users WHERE email = ${cleanEmail}`;

    await sql`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (${name}, ${cleanEmail}, ${phone}, ${passwordHash}, 'admin')
    `;

    return NextResponse.json(
      { message: '🎉 Super Admin Account Created Successfully!' },
      { status: 201 }
    );

  } catch (err) {
    console.error('Secret Admin Register Detailed Error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error creating admin account' },
      { status: 500 }
    );
  }
}