import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Event from '@/models/Event';

export const dynamic = 'force-dynamic';

// GET: Fetch all upcoming events sorted by closest date
export async function GET() {
  try {
    await connectToDatabase();
    
    // Only fetch events where the date is greater than or equal to today, sorted chronologically
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({ date: { $gte: today } }).sort({ date: 1 });
    
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Database GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { title, date, location, description, organizer } = body;

    if (!title || !date || !location || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date, location, and description.' }, 
        { status: 400 }
      );
    }

    const newEvent = await Event.create({
      title,
      date,
      location,
      description,
      organizer: organizer || 'Anonymous Student',
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Database POST Error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// DELETE: Remove an event completely
export async function DELETE(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing event ID.' }, { status: 400 });
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Database DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}