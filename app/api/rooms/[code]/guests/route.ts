import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Guest from '@/lib/models/Guest';
import { getRoomSchema } from '@/lib/validations/room';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    getRoomSchema.parse({ code });

    await connectDB();

    const guests = await Guest.find({ roomCode: code }).sort({ joinedAt: 1 });

    return NextResponse.json({
      success: true,
      data: guests.map((guest) => ({
        guestId: guest.guestId,
        roomCode: guest.roomCode,
        nickname: guest.nickname,
        host: guest.host,
        joinedAt: guest.joinedAt,
      })),
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

    console.error('Error fetching guests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch guests',
      },
      { status: 500 }
    );
  }
}
