import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import SkillExchange from '@/models/SkillExchange';

export const dynamic = 'force-dynamic';

// GET: Fetch all active exchange requests
export async function GET() {
  try {
    await connectToDatabase();
    const exchanges = await SkillExchange.find().sort({ createdAt: -1 });
    return NextResponse.json(exchanges, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exchanges' }, { status: 500 });
  }
}

// POST: Create a new exchange listing
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { title, offering, seeking, description, author, userEmail, contactInfo } = body;

    if (!title || !offering || !seeking || !description || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const newExchange = await SkillExchange.create({
      title, offering, seeking, description, author, userEmail, contactInfo
    });

    return NextResponse.json(newExchange, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post exchange' }, { status: 500 });
  }
}

// DELETE: Remove a listing (when a match is found)
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID.' }, { status: 400 });

    await SkillExchange.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Exchange removed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete exchange' }, { status: 500 });
  }
}