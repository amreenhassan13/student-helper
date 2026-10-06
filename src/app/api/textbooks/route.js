import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Textbook from '@/models/Textbook';

export const dynamic = 'force-dynamic';

// GET: Fetch all textbook listings, newest first
export async function GET() {
  try {
    await connectToDatabase();
    
    const textbooks = await Textbook.find().sort({ createdAt: -1 });
    
    return NextResponse.json(textbooks, { status: 200 });
  } catch (error) {
    console.error('Database GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch textbooks' }, { status: 500 });
  }
}

// POST: Create a new textbook listing
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { title, author, courseCode, price, condition, contactInfo } = body;

    // Validate required fields
    if (!title || !author || !courseCode || price === undefined || !condition || !contactInfo) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill out all form inputs.' }, 
        { status: 400 }
      );
    }

    const newTextbook = await Textbook.create({
      title,
      author,
      courseCode,
      price: Number(price), // Ensure price is stored as a number
      condition,
      contactInfo,
    });

    return NextResponse.json(newTextbook, { status: 201 });
  } catch (error) {
    console.error('Database POST Error:', error);
    return NextResponse.json({ error: 'Failed to create textbook listing' }, { status: 500 });
  }
}

// DELETE: Remove a textbook listing (e.g., when it is sold)
export async function DELETE(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID.' }, { status: 400 });
    }

    await Textbook.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Listing removed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Database DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}