import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import OfficeHour from '@/models/OfficeHour';

export const dynamic = 'force-dynamic';

// GET: Fetch all schedules
export async function GET() {
  try {
    await connectToDatabase();
    const schedules = await OfficeHour.find().sort({ createdAt: -1 });
    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

// POST: Upload a new professor's schedule
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { professorName, courseCode, location, scheduleImageUrl, postedBy, userEmail } = body;

    if (!professorName || !courseCode || !scheduleImageUrl || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const newSchedule = await OfficeHour.create({
      professorName, courseCode, location, scheduleImageUrl, postedBy, userEmail
    });

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post schedule' }, { status: 500 });
  }
}

// PUT: Add a booking (comment) to a schedule
export async function PUT(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { scheduleId, studentName, studentEmail, timeSlot } = body;

    if (!scheduleId || !timeSlot) {
      return NextResponse.json({ error: 'Missing schedule ID or time slot.' }, { status: 400 });
    }

    const schedule = await OfficeHour.findById(scheduleId);
    if (!schedule) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });

    schedule.bookings.push({ studentName, studentEmail, timeSlot });
    await schedule.save();

    return NextResponse.json(schedule, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to book slot' }, { status: 500 });
  }
}

// DELETE: Remove a schedule
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const id = new URL(request.url).searchParams.get('id');
    await OfficeHour.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}