import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Guest from '@/lib/models/Guest';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId } = body;

    if (!guestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest ID is required',
        },
        { status: 400 }
      );
    }

    await connectDB();

    const guest = await Guest.findOneAndUpdate(
      { guestId },
      { lastActive: new Date() },
      { new: true }
    );

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error pinging guest:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to ping guest',
      },
      { status: 500 }
    );
  }
}
