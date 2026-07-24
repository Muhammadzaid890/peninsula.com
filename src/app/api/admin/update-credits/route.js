import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { agentId, action } = await request.json();

    if (!agentId || !action) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Database Update Query Example:
    // if (action === 'increment') {
    //   await db.query('UPDATE users SET ad_credits = ad_credits + 1 WHERE id = ?', [agentId]);
    // } else {
    //   await db.query('UPDATE users SET ad_credits = GREATEST(0, ad_credits - 1) WHERE id = ?', [agentId]);
    // }

    return NextResponse.json({ message: 'Credits updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 });
  }
}