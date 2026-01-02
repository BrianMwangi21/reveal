import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ClosestGuess from '@/lib/models/ClosestGuess';

type GuessEntry = {
  guestId: string;
  nickname: string;
  value: number;
  timestamp: Date;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const body = await request.json();
    const { guestId, nickname, value } = body;
    const { activityId } = await params;

    if (!guestId || !nickname || value === undefined) {
      return NextResponse.json(
        { error: 'Guest ID, nickname, and value are required' },
        { status: 400 }
      );
    }

    if (typeof value !== 'number') {
      return NextResponse.json({ error: 'Value must be a number' }, { status: 400 });
    }

    await connectDB();

    const closestGuess = await ClosestGuess.findOne({ activityId });
    if (!closestGuess) {
      return NextResponse.json({ error: 'Closest guess activity not found' }, { status: 404 });
    }

    const guesses = closestGuess.guesses as GuessEntry[];
    const existingGuessIndex = guesses.findIndex((g) => g.guestId === guestId);
    if (existingGuessIndex !== -1) {
      guesses[existingGuessIndex] = {
        guestId,
        nickname,
        value,
        timestamp: new Date(),
      };
    } else {
      guesses.push({
        guestId,
        nickname,
        value,
        timestamp: new Date(),
      });
    }

    closestGuess.guesses = guesses;
    await closestGuess.save();

    return NextResponse.json({ data: closestGuess });
  } catch (error) {
    console.error('Error submitting guess:', error);
    return NextResponse.json({ error: 'Failed to submit guess' }, { status: 500 });
  }
}
