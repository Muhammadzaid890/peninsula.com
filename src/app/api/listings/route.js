import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || 'peninsula_super_secret_key_2026';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mainCategory = searchParams.get('main_category');

    let listings;
    if (mainCategory) {
      listings = await sql`SELECT * FROM listings WHERE main_category = ${mainCategory} ORDER BY id DESC`;
    } else {
      listings = await sql`SELECT * FROM listings ORDER BY id DESC`;
    }

    return NextResponse.json(listings);
  } catch (err) {
    console.error('Fetch listings error:', err);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Extract User/Agent info from JWT Token Cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const token = cookieHeader
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    let agentPhone = '03331234201'; // Default Fallback Admin Phone
    let agentName = 'System Admin';

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.phone) agentPhone = decoded.phone;
        if (decoded.name) agentName = decoded.name;
      } catch (e) {
        console.warn('JWT verification failed in listing post, fallback to default.');
      }
    }

    const body = await req.json();
    const {
      title,
      price,
      location,
      area,
      area_unit,
      purpose,
      main_category,
      sub_category,
      commercial_zone,
      show_on_home,
      description
    } = body;

    // Insert listing with Agent Phone auto-attached
    const result = await sql`
      INSERT INTO listings (
        title, price, location, area, area_unit, purpose, 
        main_category, sub_category, commercial_zone, show_on_home, 
        description, agent_phone, agent_name, status
      )
      VALUES (
        ${title}, ${price}, ${location}, ${area}, ${area_unit || 'sq.yd'}, ${purpose || 'sale'}, 
        ${main_category}, ${sub_category || 'plot'}, ${commercial_zone || null}, ${show_on_home || false}, 
        ${description || ''}, ${agentPhone}, ${agentName}, 'active'
      )
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (err) {
    console.error('Post listing error:', err);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}