import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Thesis from '@/models/Thesis';

export const dynamic = 'force-dynamic';

// GET: Fetch all published theses
export async function GET() {
  try {
    await connectToDatabase();
    const theses = await Thesis.find().sort({ createdAt: -1 });
    return NextResponse.json(theses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch repository' }, { status: 500 });
  }
}

// POST: Publish a new abstract
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { title, author, userEmail, department, abstract, tags, pdfUrl } = body;

    if (!title || !department || !abstract || !tags || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const newThesis = await Thesis.create({
      title, author, userEmail, department, abstract, tags, pdfUrl
    });

    return NextResponse.json(newThesis, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
  }
}

// DELETE: Remove a publication
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const id = new URL(request.url).searchParams.get('id');
    await Thesis.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}