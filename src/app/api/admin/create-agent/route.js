import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'peninsula_super_secret_key_2026';

export async function POST(req) {
  try {
    // 1. Verify Admin Cookie Security Guard
    const cookieHeader = req.headers.get('cookie') || '';
    const token = cookieHeader
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized! Only Admin can create agents.' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden! Admin access required.' }, { status: 403 });
    }

    // 2. Parse Request Body
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 3. Check if Agent Email already exists in Neon DB
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`;
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'This email is already registered as an agent!' }, { status: 400 });
    }

    // 4. Encrypt Password using Bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Save Agent securely in Neon DB
    await sql`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (${name}, ${email.toLowerCase().trim()}, ${phone}, ${passwordHash}, 'agent')
    `;

    return NextResponse.json({ message: '🎉 Agent created successfully in Neon DB!' }, { status: 201 });

  } catch (err) {
    console.error('Create Agent Error:', err);
    return NextResponse.json({ error: 'Server error while creating agent' }, { status: 500 });
  }
}