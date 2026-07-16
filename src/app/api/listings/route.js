import { NextResponse } from 'next/server';
import { sql } from '@/lib/db'; 

// 1. GET: Fetch active listing payload
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const purpose = searchParams.get('purpose'); 
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

    queryText += ' ORDER BY refreshed_at DESC';

    const result = await sql.query(queryText, queryParams);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Database read error:", err);
    return NextResponse.json({ error: 'Internal Server Error Database' }, { status: 500 });
  }
}

// 2. POST: Secure fallback parser for dynamic listings insertion
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Destructuring fields safely from admin layout payload
    const {
      title,
      price,
      location,
      area,
      area_unit,
      purpose,
      main_category,
      sub_category,
      images,
      show_on_home, 
      commercial_zone,
      description,
      beds,
      baths,
      amenities,
      listing_type
    } = body;

    // Strict parameter checking 
    if (!title || !price || !location || !area) {
      return NextResponse.json({ error: 'Required payload elements missing' }, { status: 400 });
    }

    // Checking table attributes schema definitions dynamically
    const queryText = `
      INSERT INTO listings (
        title, 
        price, 
        location, 
        area, 
        area_unit, 
        purpose, 
        main_category,
        sub_category, 
        ad_type, 
        images, 
        show_on_home, 
        commercial_zone,
        description,
        beds,
        baths,
        amenities,
        listing_type,
        status, 
        created_at, 
        refreshed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
      RETURNING *;
    `;

    const queryParams = [
      title,
      price, // String input text value
      location,
      area, // Managed data integer mapping parsing values
      area_unit || 'sq.yd',
      purpose || 'sale',
      main_category || 'plot',
      sub_category || 'plot',
      'simple', // Default fallback structural classification
      images || [], // Empty array payload if skipped on home
      show_on_home === true, 
      show_on_home ? commercial_zone : null,
      description || '',
      beds ? parseInt(beds) : null,
      baths ? parseInt(baths) : null,
      amenities || [], // Fallback formatting check syntax structures
      listing_type || 'property',
      'active'
    ];

    const result = await sql.query(queryText, queryParams);

    return NextResponse.json({ 
      success: true, 
      message: '🎉 Entry submitted successfully without index drops!', 
      data: result.rows[0] 
    }, { status: 201 });

  } catch (err) {
    console.error("Crash logs tracing dynamic error:", err);
    return NextResponse.json({ error: 'Failed to insert operational listing data' }, { status: 500 });
  }
}