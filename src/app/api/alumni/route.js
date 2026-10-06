import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Alumnus from '@/models/Alumnus';

export const dynamic = 'force-dynamic';

// GET: Fetch all alumni profiles
export async function GET() {
  try {
    await connectToDatabase();
    const alumni = await Alumnus.find().sort({ createdAt: -1 });
    return NextResponse.json(alumni, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch directory' }, { status: 500 });
  }
}

// POST: Create a new alumni mentor profile
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, graduationYear, major, currentCompany, jobTitle, offerings, contactInfo, userEmail } = body;

    if (!name || !graduationYear || !currentCompany || !offerings || !contactInfo || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const newAlumnus = await Alumnus.create({
      name, graduationYear: Number(graduationYear), major, currentCompany, jobTitle, offerings, contactInfo, userEmail
    });

    return NextResponse.json(newAlumnus, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

// DELETE: Remove a profile
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const id = new URL(request.url).searchParams.get('id');
    await Alumnus.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Profile removed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}