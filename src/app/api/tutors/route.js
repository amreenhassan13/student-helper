import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Tutor from '@/models/Tutor';

export const dynamic = 'force-dynamic';

// GET: Fetch all tutor listings
export async function GET() {
  try {
    await connectToDatabase();
    const tutors = await Tutor.find().sort({ createdAt: -1 });
    return NextResponse.json(tutors, { status: 200 });
  } catch (error) {
    console.error('Database GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tutors' }, { status: 500 });
  }
}

// POST: Create a new tutor profile
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, courses, hourlyRate, availability, contactInfo } = body;

    if (!name || !courses || hourlyRate === undefined || !availability || !contactInfo) {
      return NextResponse.json(
        { error: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    const newTutor = await Tutor.create({
      name,
      courses,
      hourlyRate: Number(hourlyRate),
      availability,
      contactInfo,
    });

    return NextResponse.json(newTutor, { status: 201 });
  } catch (error) {
    console.error('Database POST Error:', error);
    return NextResponse.json({ error: 'Failed to create tutor profile' }, { status: 500 });
  }
}

// DELETE: Remove a tutor profile
export async function DELETE(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing tutor ID.' }, { status: 400 });
    }

    await Tutor.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Tutor profile removed' }, { status: 200 });
  } catch (error) {
    console.error('Database DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete tutor profile' }, { status: 500 });
  }
}