import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import LostAndFoundItem from '@/models/LostAndFoundItem';

export const dynamic = 'force-dynamic';

// GET: Fetch all lost and found items, newest first
export async function GET() {
  try {
    await connectToDatabase();
    
    const items = await LostAndFoundItem.find().sort({ createdAt: -1 });
    
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('Database GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST: Create a new report
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { title, type, date, location, description, contactInfo } = body;

    if (!title || !type || !date || !location || !description || !contactInfo) {
      return NextResponse.json(
        { error: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    const newItem = await LostAndFoundItem.create({
      title,
      type,
      date,
      location,
      description,
      contactInfo,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Database POST Error:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

// DELETE: Remove an item (e.g., when it is returned/found)
export async function DELETE(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing item ID.' }, { status: 400 });
    }

    await LostAndFoundItem.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Item removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Database DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}