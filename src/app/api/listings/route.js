import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// 1. CREATE AD / PROJECT
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      title, price, location, description, purpose, main_category, sub_category, 
      images, area, area_unit, beds, baths, amenities, listing_type
    } = body;

    const result = await sql`
      INSERT INTO listings (
        title, price, location, description, purpose, 
        main_category, sub_category, images, area, 
        area_unit, beds, baths, amenities, listing_type
      )
      VALUES (
        ${title}, ${price}, ${location}, ${description}, ${purpose}, 
        ${main_category}, ${sub_category}, ${images}, ${area}, 
        ${area_unit}, ${beds}, ${baths}, ${amenities}, ${listing_type || 'property'}
      )
      RETURNING id;
    `;

    return NextResponse.json({ success: true, id: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Database Insert Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. GET ACTIVE ADS & PROJECTS
export async function GET() {
  try {
    const data = await sql`
      SELECT * FROM listings 
      WHERE is_deleted = FALSE
      ORDER BY refreshed_at DESC
    `;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 3. UPDATE AD
export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id, title, price, location, description, purpose, 
      main_category, sub_category, area, area_unit, beds, baths, amenities, listing_type 
    } = body;

    await sql`
      UPDATE listings 
      SET 
        title = ${title},
        price = ${price},
        location = ${location},
        description = ${description},
        purpose = ${purpose},
        main_category = ${main_category},
        sub_category = ${sub_category},
        area = ${area},
        area_unit = ${area_unit},
        beds = ${beds},
        baths = ${baths},
        amenities = ${amenities},
        listing_type = ${listing_type}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}