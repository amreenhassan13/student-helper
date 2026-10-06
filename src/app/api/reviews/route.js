import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Review from '@/models/Review';

// GET: Fetch reviews (can be filtered by courseCode)
export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get('courseCode');

    let query = {};
    if (courseCode) {
      query.courseCode = courseCode;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('Database GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST: Submit a new course review
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { courseCode, rating, text } = body;

    if (!courseCode || !rating || !text) {
      return NextResponse.json(
        { error: 'Missing required fields: courseCode, rating, and text are required.' }, 
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5.' }, 
        { status: 400 }
      );
    }

    const newReview = await Review.create({
      courseCode,
      rating,
      text,
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Database POST Error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}