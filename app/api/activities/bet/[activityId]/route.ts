import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Bet from '@/lib/models/Bet';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    await connectDB();

    const bet = await Bet.findOne({ activityId });

    if (!bet) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ data: bet });
  } catch (error) {
    console.error('Error fetching bet:', error);
    return NextResponse.json({ error: 'Failed to fetch bet' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const body = await request.json();
    const { roomCode, options } = body;
    const { activityId } = await params;

    if (!roomCode || !options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Room code and at least 2 options are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingBet = await Bet.findOne({ activityId });
    if (existingBet) {
      return NextResponse.json({ error: 'Bet activity already exists' }, { status: 400 });
    }

    const bet = await Bet.create({
      activityId,
      roomCode,
      options,
      bets: [],
    });

    return NextResponse.json({ data: bet }, { status: 201 });
  } catch (error) {
    console.error('Error creating bet:', error);
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 });
  }
}
