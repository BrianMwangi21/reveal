import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Room from '@/lib/models/Room';
import { getRoomSchema } from '@/lib/validations/room';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    getRoomSchema.parse({ code });

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

    return NextResponse.json({
      success: true,
      data: {
        id: room._id,
        code: room.code,
        name: room.name,
        revealTime: room.revealTime,
        revealType: room.revealType,
        revealContent: room.revealContent,
        host: room.host,
        status: room.status,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
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

    console.error('Error fetching room:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch room',
      },
      { status: 500 }
    );
  }
}
