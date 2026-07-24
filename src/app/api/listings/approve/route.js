import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const { id, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    // Database Update Example:
    // await db.query('UPDATE listings SET status = ? WHERE id = ?', [status || 'active', id]);

    return NextResponse.json({ message: 'Ad status updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ad status' }, { status: 500 });
  }
}