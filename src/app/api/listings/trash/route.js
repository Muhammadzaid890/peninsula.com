import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET deleted ads
export async function GET() {
  try {
    const data = await sql`
      SELECT * FROM listings 
      WHERE is_deleted = TRUE
      ORDER BY refreshed_at DESC
    `;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT request to Restore / Repost ad
export async function PUT(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "ID missing ha!" }, { status: 400 });
    }

    // Repost ad by setting is_deleted to FALSE and updating refreshed_at
    await sql`
      UPDATE listings 
      SET is_deleted = FALSE, refreshed_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Restore Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}