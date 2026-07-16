import { NextResponse } from 'next/server';
import { sql } from '@/lib/db'; // Changed from { db } to { sql } based on your module export

// 1. GET: Fetch listings dynamically with support for home filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get('purpose'); // sale / rent
    const sub_category = searchParams.get('sub_category');
    
    let queryText = 'SELECT * FROM listings WHERE status = $1';
    let queryParams = ['active'];

    if (purpose) {
      queryParams.push(purpose);
      queryText += ` AND purpose = $${queryParams.length}`;
    }

    if (sub_category) {
      queryParams.push(sub_category);
      queryText += ` AND sub_category = $${queryParams.length}`;
    }

    // Sort by recent refresh/creation
    queryText += ' ORDER BY refreshed_at DESC';

    // Using sql.query instead of db.query
    const result = await sql.query(queryText, queryParams);
    
    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Database read error:", err);
    return NextResponse.json({ error: 'Internal Server Error Database' }, { status: 500 });
  }
}

// 2. POST: Create dynamic ad listing targeting routing rules
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      price,
      location,
      area,
      area_unit,
      purpose,
      sub_category,
      ad_type,
      images,
      show_on_home, 
      commercial_zone 
    } = body;

    if (!title || !price || !location || !area) {
      return NextResponse.json({ error: 'Required fields missing from payload' }, { status: 400 });
    }

    const queryText = `
      INSERT INTO listings (
        title, 
        price, 
        location, 
        area, 
        area_unit, 
        purpose, 
        sub_category, 
        ad_type, 
        images, 
        show_on_home, 
        commercial_zone,
        status, 
        created_at, 
        refreshed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *;
    `;

    const queryParams = [
      title,
      price,
      location,
      area,
      area_unit || 'sq.yd',
      purpose || 'sale',
      sub_category || 'plot',
      ad_type || 'simple',
      images || [],
      show_on_home === true, 
      show_on_home ? commercial_zone : null, 
      'active'
    ];

    // Using sql.query instead of db.query
    const result = await sql.query(queryText, queryParams);

    return NextResponse.json({ 
      success: true, 
      message: '🎉 Listing payload deployed and routed correctly!', 
      data: result.rows[0] 
    }, { status: 201 });

  } catch (err) {
    console.error("Database insert crash handler active:", err);
    return NextResponse.json({ error: 'Failed to insert operational listing data' }, { status: 500 });
  }
}