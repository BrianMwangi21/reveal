import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/lib/models/Message';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const body = await request.json();
    const { guestId, nickname, content } = body;
    const { activityId } = await params;

    if (!guestId || !nickname || !content) {
      return NextResponse.json(
        { error: 'Guest ID, nickname, and content are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const messageBoard = await Message.findOne({ activityId });
    if (!messageBoard) {
      return NextResponse.json({ error: 'Message board not found' }, { status: 404 });
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    messageBoard.messages.push({
      id: messageId,
      guestId,
      nickname,
      content,
      reactions: new Map(),
      timestamp: new Date(),
    });

    await messageBoard.save();

    return NextResponse.json({ data: messageBoard });
  } catch (error) {
    console.error('Error posting message:', error);
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }
}
