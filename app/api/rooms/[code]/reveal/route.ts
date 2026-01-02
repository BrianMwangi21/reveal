import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Room from '@/lib/models/Room';
import { sseManager } from '@/lib/sse';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { guestId } = body;

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: 'Guest ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    if (room.status === 'revealed') {
      return NextResponse.json(
        { success: false, error: 'Room has already been revealed' },
        { status: 400 }
      );
    }

    if (room.host.id !== guestId) {
      return NextResponse.json(
        { success: false, error: 'Only the host can trigger the reveal' },
        { status: 403 }
      );
    }

    room.status = 'revealed';
    await room.save();

    sseManager.broadcastToRoom(room.code, 'reveal_triggered', {
      roomCode: room.code,
      revealType: room.revealType,
      revealContent: room.revealContent,
    });

    return NextResponse.json({
      success: true,
      data: {
        roomCode: room.code,
        status: room.status,
        revealType: room.revealType,
        revealContent: room.revealContent,
      },
    });
  } catch (error) {
    console.error('Error triggering reveal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger reveal' },
      { status: 500 }
    );
  }
}
