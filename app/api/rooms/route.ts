import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Room from '@/lib/models/Room';
import Guest from '@/lib/models/Guest';
import { createRoomSchema } from '@/lib/validations/room';
import { generateUniqueRoomCode } from '@/lib/utils/generateRoomCode';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = createRoomSchema.parse(body);

    await connectDB();

    const { code } = await generateUniqueRoomCode(async (code) => {
      const existingRoom = await Room.findOne({ code });
      return !!existingRoom;
    });

    const room = await Room.create({
      name: validatedData.name,
      code,
      revealTime: new Date(validatedData.revealTime),
      revealType: validatedData.revealType,
      revealContent: validatedData.revealContent,
      host: validatedData.host,
      status: 'upcoming',
    });

    await Guest.create({
      guestId: validatedData.host.id,
      roomCode: code,
      nickname: validatedData.host.nickname,
      host: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: room._id,
          code: room.code,
          name: room.name,
          revealTime: room.revealTime,
          revealType: room.revealType,
          host: room.host,
          guestId: validatedData.host.id,
          status: room.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating room:', error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('. '),
        },
        { status: 400 }
      );
    }

    console.error('Error creating room:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create room',
      },
      { status: 500 }
    );
  }
}
