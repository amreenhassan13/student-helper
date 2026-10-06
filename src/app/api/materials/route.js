import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Material from '@/models/Material';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const materials = await Material.find().sort({ createdAt: -1 });
    return NextResponse.json(materials, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { title, courseCode, description, fileUrl, uploader, userEmail } = body;

    if (!title || !courseCode || !description || !fileUrl || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const newMaterial = await Material.create({
      title, courseCode, description, fileUrl, uploader, userEmail
    });

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post material' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectToDatabase();
    const { id, type } = await request.json();

    if (!id || !type) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    // Increment upvotes or downvotes based on the type passed from the frontend
    const update = type === 'upvote' ? { $inc: { upvotes: 1 } } : { $inc: { downvotes: 1 } };
    const updatedMaterial = await Material.findByIdAndUpdate(id, update, { new: true });

    return NextResponse.json(updatedMaterial, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

// NEW: Delete Route
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const id = new URL(request.url).searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID.' }, { status: 400 });

    await Material.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Material deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}