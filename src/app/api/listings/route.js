import { NextResponse } from 'next/server';
import { sql } from '@/lib/db'; 

// Helper utility to safely serialize dates and nested arrays to JSON format
function safeJSONSerialize(data) {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    // Convert Dates/Timestamps to ISO string format to bypass serialization crashes
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));
}

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
    
    // Safely extract rows from any driver response format
    const rows = result.rows || result;
    const serializedRows = safeJSONSerialize(rows);

    return NextResponse.json(serializedRows, { status: 200 });
  } catch (err) {
    console.error("Database read error:", err);
    return NextResponse.json({ error: 'Internal Server Error Database' }, { status: 500 });
  }
}

// 2. POST: Secure fallback parser for dynamic listings insertion
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

    // Strict parameter validation
    if (!title || !price || !location || !area) {
      return NextResponse.json({ error: 'Required payload elements missing' }, { status: 400 });
    }

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

    const parsedArea = area ? parseFloat(area) : 0;
    const isShowOnHome = show_on_home === true;
    const parsedBeds = beds ? parseInt(beds, 10) : null;
    const parsedBaths = baths ? parseInt(baths, 10) : null;
    const sanitizedAmenities = Array.isArray(amenities) ? amenities : [];

    const queryParams = [
      title,
      price.toString(),
      location,
      parsedArea,
      area_unit || 'sq.yd',
      purpose || 'sale',
      main_category || 'plot',
      sub_category || 'plot',
      'simple',
      images || [],
      isShowOnHome, 
      isShowOnHome ? commercial_zone : null,
      description || '',
      isNaN(parsedBeds) ? null : parsedBeds,
      isNaN(parsedBaths) ? null : parsedBaths,
      sanitizedAmenities, 
      listing_type || 'property',
      'active'
    ];

    const result = await sql.query(queryText, queryParams);

    // Dynamic row checker mapping to resolve "undefined reading 0" crashes safely
    const returnedRows = result.rows || result;
    const createdRecord = Array.isArray(returnedRows) && returnedRows.length > 0 ? returnedRows[0] : null;

    return NextResponse.json({ 
      success: true, 
      message: '🎉 Entry submitted successfully!', 
      data: safeJSONSerialize(createdRecord)
    }, { status: 201 });

  } catch (err) {
    console.error("Database insertion detailed stacktrace:", err);
    return NextResponse.json({ 
      error: 'Internal Server Error Database',
      details: err.message || err 
    }, { status: 500 });
  }
}