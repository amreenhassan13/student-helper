import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import StudyGroup from '@/models/StudyGroup';

export const dynamic = 'force-dynamic';

// GET: Fetch upcoming study groups
export async function GET() {
  try {
    await connectToDatabase();
    
    // Only fetch groups where the meeting time is in the future, sorted by closest first
    const now = new Date();
    const groups = await StudyGroup.find({ meetingTime: { $gte: now } }).sort({ meetingTime: 1 });
    
    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error('Database GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch study groups' }, { status: 500 });
  }
}

// POST: Create a new study group
export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { title, courseCode, topic, meetingTime, location, maxMembers, creator } = body;

    if (!title || !courseCode || !topic || !meetingTime || !location || !maxMembers) {
      return NextResponse.json(
        { error: 'Missing required fields.' }, 
        { status: 400 }
      );
    }

    const newGroup = await StudyGroup.create({
      title,
      courseCode,
      topic,
      meetingTime,
      location,
      maxMembers: Number(maxMembers),
      creator: creator || 'Anonymous Student',
    });

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    console.error('Database POST Error:', error);
    return NextResponse.json({ error: 'Failed to create study group' }, { status: 500 });
  }
}

// PUT: Join a study group
export async function PUT(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json({ error: 'Missing group ID' }, { status: 400 });
    }

    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
    }

    // Check if the group is already full
    if (group.currentMembers >= group.maxMembers) {
      return NextResponse.json({ error: 'This study group is already at full capacity.' }, { status: 400 });
    }

    // Increment member count
    group.currentMembers += 1;
    await group.save();

    return NextResponse.json(group, { status: 200 });
  } catch (error) {
    console.error('Database PUT Error:', error);
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }
}

// DELETE: Cancel a study group
export async function DELETE(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing group ID.' }, { status: 400 });
    }

    await StudyGroup.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Study group canceled successfully' }, { status: 200 });
  } catch (error) {
    console.error('Database DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to cancel group' }, { status: 500 });
  }
}