import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/lib/models/Message';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    await connectDB();

    const messageBoard = await Message.findOne({ activityId });

    if (!messageBoard) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ data: messageBoard });
  } catch (error) {
    console.error('Error fetching message board:', error);
    return NextResponse.json({ error: 'Failed to fetch message board' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const body = await request.json();
    const { roomCode } = body;
    const { activityId } = await params;

    if (!roomCode) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingMessageBoard = await Message.findOne({ activityId });
    if (existingMessageBoard) {
      return NextResponse.json({ error: 'Message board already exists' }, { status: 400 });
    }

    const messageBoard = await Message.create({
      activityId,
      roomCode,
      messages: [],
    });

    return NextResponse.json({ data: messageBoard }, { status: 201 });
  } catch (error) {
    console.error('Error creating message board:', error);
    return NextResponse.json({ error: 'Failed to create message board' }, { status: 500 });
  }
}
