import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/lib/models/Message';
import { ReactionEmoji } from '@/lib/models/Message';

type MessageEntry = {
  id: string;
  guestId: string;
  nickname: string;
  content: string;
  reactions: Record<string, string[]>;
  timestamp: Date;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string; messageId: string }> }
) {
  try {
    const body = await request.json();
    const { guestId, emoji } = body;
    const { activityId, messageId } = await params;

    if (!guestId || !emoji) {
      return NextResponse.json(
        { error: 'Guest ID and emoji are required' },
        { status: 400 }
      );
    }

    const validEmojis: ReactionEmoji[] = ['❤️', '😂', '🎉', '🥳', '👍', '🙌', '💯', '😍'];
    if (!validEmojis.includes(emoji as ReactionEmoji)) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
    }

    await connectDB();

    const messageBoard = await Message.findOne({ activityId });
    if (!messageBoard) {
      return NextResponse.json({ error: 'Message board not found' }, { status: 404 });
    }

    const messages = messageBoard.messages as MessageEntry[];
    const message = messages.find((m) => m.id === messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (!message.reactions) {
      message.reactions = {};
    }

    const reactions = message.reactions as Record<string, string[]>;
    const emojiReactions = reactions[emoji] || [];

    const reactionIndex = emojiReactions.indexOf(guestId);
    if (reactionIndex !== -1) {
      emojiReactions.splice(reactionIndex, 1);
      if (emojiReactions.length === 0) {
        delete reactions[emoji];
      } else {
        reactions[emoji] = emojiReactions;
      }
    } else {
      emojiReactions.push(guestId);
      reactions[emoji] = emojiReactions;
    }

    message.reactions = reactions;
    messageBoard.messages = messages;
    await messageBoard.save();

    return NextResponse.json({ data: messageBoard });
  } catch (error) {
    console.error('Error reacting to message:', error);
    return NextResponse.json({ error: 'Failed to react to message' }, { status: 500 });
  }
}
