import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Room from '@/lib/models/Room';
import Guest from '@/lib/models/Guest';
import { joinRoomSchema } from '@/lib/validations/guest';
import { getRoomSchema } from '@/lib/validations/room';
import { sseManager } from '@/lib/sse';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    getRoomSchema.parse({ code });

    const body = await request.json();
    const { nickname } = joinRoomSchema.parse(body);

    await connectDB();

    const room = await Room.findOne({ code });

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room not found',
        },
        { status: 404 }
      );
    }

    const expirationTime = new Date(room.revealTime.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();
    if (now > expirationTime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room has expired',
        },
        { status: 410 }
      );
    }

    const existingGuest = await Guest.findOne({ roomCode: code, nickname });

    if (existingGuest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nickname already taken in this room',
        },
        { status: 409 }
      );
    }

    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const guest = await Guest.create({
      guestId,
      roomCode: code,
      nickname,
      host: false,
    });

    sseManager.broadcastToRoom(
      code,
      'guest_joined',
      {
        guestId: guest.guestId,
        nickname: guest.nickname,
        roomCode: guest.roomCode,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        guestId: guest.guestId,
        roomCode: guest.roomCode,
        nickname: guest.nickname,
        host: guest.host,
        joinedAt: guest.joinedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }

    console.error('Error joining room:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to join room',
      },
      { status: 500 }
    );
  }
}
