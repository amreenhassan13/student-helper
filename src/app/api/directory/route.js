import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Location from '@/models/Location';

export const dynamic = 'force-dynamic';

// GET: Fetch all locations
export async function GET() {
  try {
    await connectToDatabase();
    // Sort alphabetically by building, then room number
    const locations = await Location.find().sort({ building: 1, roomNumber: 1 });
    return NextResponse.json(locations, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch directory' }, { status: 500 });
  }
}

// POST: Add a new location
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, building, roomNumber, category, description, addedBy, userEmail } = body;

    if (!name || !building || !roomNumber || !category || !description || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const newLocation = await Location.create({
      name, building, roomNumber, category, description, addedBy, userEmail
    });

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add location' }, { status: 500 });
  }
}

// DELETE: Remove an incorrect listing
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const id = new URL(request.url).searchParams.get('id');
    await Location.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Location removed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}