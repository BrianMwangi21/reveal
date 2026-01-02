import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Bet from '@/lib/models/Bet';

type BetEntry = {
  guestId: string;
  nickname: string;
  option: string;
  points: number;
  timestamp: Date;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const body = await request.json();
    const { guestId, nickname, option, points } = body;
    const { activityId } = await params;

    if (!guestId || !nickname || !option || points === undefined) {
      return NextResponse.json(
        { error: 'Guest ID, nickname, option, and points are required' },
        { status: 400 }
      );
    }

    if (points < 0 || points > 100) {
      return NextResponse.json(
        { error: 'Points must be between 0 and 100' },
        { status: 400 }
      );
    }

    await connectDB();

    const bet = await Bet.findOne({ activityId });
    if (!bet) {
      return NextResponse.json({ error: 'Bet activity not found' }, { status: 404 });
    }

    if (!bet.options.includes(option)) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    const bets = bet.bets as BetEntry[];
    const existingBetIndex = bets.findIndex((b) => b.guestId === guestId);
    if (existingBetIndex !== -1) {
      bets[existingBetIndex] = {
        guestId,
        nickname,
        option,
        points,
        timestamp: new Date(),
      };
    } else {
      bets.push({
        guestId,
        nickname,
        option,
        points,
        timestamp: new Date(),
      });
    }

    bet.bets = bets;
    await bet.save();

    return NextResponse.json({ data: bet });
  } catch (error) {
    console.error('Error placing bet:', error);
    return NextResponse.json({ error: 'Failed to place bet' }, { status: 500 });
  }
}
