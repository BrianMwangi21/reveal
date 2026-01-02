import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Activity from '@/lib/models/Activity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get('roomCode');

    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    await connectDB();

    const activities = await Activity.find({ roomCode }).sort({ createdAt: 1 });

    return NextResponse.json({ data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomCode, type, title } = body;

    if (!roomCode || !type || !title) {
      return NextResponse.json(
        { error: 'Room code, type, and title are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const activityId = `${roomCode}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const activity = await Activity.create({
      activityId,
      roomCode,
      type,
      title,
    });

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
