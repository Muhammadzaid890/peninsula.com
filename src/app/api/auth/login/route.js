import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'peninsula_super_secret_key_2026';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and Password are required' }, { status: 400 });
    }

    // 1. Fetch user from Neon DB
    const users = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}`;
    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];

    // 2. Compare Bcrypt Encrypted Password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 3. Generate Secure JWT Token
    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Return Secure HttpOnly Cookie
    const response = NextResponse.json({
      message: '🎉 Login successful!',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 Days
      path: '/'
    });

    return response;

  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json({ error: 'Server authentication error' }, { status: 500 });
  }
}