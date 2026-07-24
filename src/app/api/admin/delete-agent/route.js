import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    // 1. Agar Database (MySQL / PostgreSQL / KV) use kar rahe hain:
    // await db.query('DELETE FROM listings WHERE agent_id = ?', [id]); // Delete Agent Ads
    // await db.query('DELETE FROM users WHERE id = ?', [id]); // Delete Agent User

    return NextResponse.json({ message: 'Agent deleted successfully from database' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}