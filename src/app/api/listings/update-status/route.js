import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request) {
  try {
    const { id, action, type } = await request.json();

    if (action === 'refresh') {
      // Ad ki timing naye timestamp par set karega taake wo top par aaye
      await sql`
        UPDATE listings 
        SET refreshed_at = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } else if (action === 'promote') {
      // Ad ko simple, premium ya ultra_premium banayega
      await sql`
        UPDATE listings 
        SET ad_type = ${type} 
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Status Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}