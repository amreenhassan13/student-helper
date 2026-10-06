import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Extracurricular from '@/models/Extracurricular';

export const dynamic = 'force-dynamic';

// GET: Fetch only the logged-in user's logs
export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const logs = await Extracurricular.find({ userEmail }).sort({ createdAt: -1 });
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

// POST: Add a new experience
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { role, organization, category, timeframe, description, userEmail } = body;

    if (!role || !organization || !category || !timeframe || !description || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const newLog = await Extracurricular.create({
      role, organization, category, timeframe, description, userEmail
    });

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}

// DELETE: Remove an entry
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const id = new URL(request.url).searchParams.get('id');
    await Extracurricular.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}