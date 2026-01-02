import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Activity from '@/lib/models/Activity';
import Bet from '@/lib/models/Bet';
import ClosestGuess from '@/lib/models/ClosestGuess';
import Message from '@/lib/models/Message';
import { sseManager } from '@/lib/sse';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    await connectDB();

    const activity = await Activity.findOne({ activityId });
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const roomCode = activity.roomCode;
    await Activity.deleteOne({ activityId });

    if (activity.type === 'bet') {
      await Bet.deleteOne({ activityId });
    } else if (activity.type === 'closestGuess') {
      await ClosestGuess.deleteOne({ activityId });
    } else if (activity.type === 'message') {
      await Message.deleteOne({ activityId });
    }

    sseManager.broadcastToRoom(
      roomCode,
      'activity_deleted',
      {
        activityId,
        roomCode,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
}
