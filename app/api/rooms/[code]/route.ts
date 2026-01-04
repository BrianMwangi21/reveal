import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Room, { RevealType } from '@/lib/models/Room';
import { getRoomSchema } from '@/lib/validations/room';
import { sseManager } from '@/lib/sse';
import { z } from 'zod';

const updateRoomSchema = z.object({
  guestId: z.string(),
  name: z.string().min(1).max(100).optional(),
  revealTime: z.string().datetime().optional(),
  revealType: z.enum(['gender', 'baby', 'birthday', 'anniversary', 'custom']).optional(),
  revealContent: z.object({
    type: z.enum(['text', 'image', 'video']),
    value: z.string(),
    caption: z.string().max(500).optional(),
  }).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    getRoomSchema.parse({ code });

    await connectDB();

    const room = await Room.findOne({ code: code.toUpperCase() });

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
    const isExpired = now > expirationTime;

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
        isExpired,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();

    const validatedData = updateRoomSchema.parse(body);

    await connectDB();

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room not found',
        },
        { status: 404 }
      );
    }

    if (room.host.id !== validatedData.guestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to update this room',
        },
        { status: 403 }
      );
    }

    if (room.status === 'revealed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot update a room that has already been revealed',
        },
        { status: 400 }
      );
    }

    const oldRevealTime = room.revealTime;
    const updates: Partial<{ name: string; revealTime: Date; revealType: RevealType; revealContent: { type: 'text' | 'image' | 'video'; value: string; caption?: string } }> = {};

    if (validatedData.name !== undefined) updates.name = validatedData.name;
    if (validatedData.revealType !== undefined) updates.revealType = validatedData.revealType;
    if (validatedData.revealContent !== undefined) updates.revealContent = validatedData.revealContent;
    if (validatedData.revealTime !== undefined) {
      const newRevealTime = new Date(validatedData.revealTime);
      if (newRevealTime <= new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reveal time must be in the future',
          },
          { status: 400 }
        );
      }
      updates.revealTime = newRevealTime;
    }

    Object.assign(room, updates);
    await room.save();

    if (validatedData.revealTime !== undefined && updates.revealTime !== oldRevealTime) {
      sseManager.broadcastToRoom(room.code, 'reveal_time_changed', {
        roomCode: room.code,
        newRevealTime: room.revealTime.toISOString(),
        oldRevealTime: oldRevealTime.toISOString(),
      });
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
        updatedAt: room.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('. '),
        },
        { status: 400 }
      );
    }

    console.error('Error updating room:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update room',
      },
      { status: 500 }
    );
  }
}
