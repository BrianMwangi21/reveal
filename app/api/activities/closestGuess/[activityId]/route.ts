import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ClosestGuess from '@/lib/models/ClosestGuess';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    await connectDB();

    const closestGuess = await ClosestGuess.findOne({ activityId });

    if (!closestGuess) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ data: closestGuess });
  } catch (error) {
    console.error('Error fetching closest guess:', error);
    return NextResponse.json({ error: 'Failed to fetch closest guess' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const body = await request.json();
    const { roomCode, question, unit } = body;
    const { activityId } = await params;

    if (!roomCode || !question) {
      return NextResponse.json(
        { error: 'Room code and question are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingClosestGuess = await ClosestGuess.findOne({ activityId });
    if (existingClosestGuess) {
      return NextResponse.json({ error: 'Closest guess activity already exists' }, { status: 400 });
    }

    const closestGuess = await ClosestGuess.create({
      activityId,
      roomCode,
      question,
      unit: unit || '',
      guesses: [],
    });

    return NextResponse.json({ data: closestGuess }, { status: 201 });
  } catch (error) {
    console.error('Error creating closest guess:', error);
    return NextResponse.json({ error: 'Failed to create closest guess' }, { status: 500 });
  }
}
