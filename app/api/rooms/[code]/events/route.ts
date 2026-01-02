import { NextRequest } from 'next/server';
import Room from '@/lib/models/Room';
import { sseManager, SSEConnection } from '@/lib/sse';
import connectDB from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get('guestId');
  const nickname = searchParams.get('nickname');

  await connectDB();

  const room = await Room.findOne({ code: code.toUpperCase() });

  if (!room) {
    return new Response('Room not found', { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const connection = new SSEConnection(
        controller,
        code.toUpperCase(),
        guestId,
        nickname
      );

      sseManager.addConnection(code.toUpperCase(), connection);

      const keepaliveInterval = setInterval(() => {
        connection.send('keepalive', { ping: 'keepalive' });
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepaliveInterval);
        sseManager.removeConnection(code.toUpperCase(), connection);

        if (guestId && nickname) {
          sseManager.broadcastToRoom(
            code.toUpperCase(),
            'guest_left',
            {
              guestId,
              nickname,
              roomCode: code.toUpperCase(),
            },
            connection
          );
        }

        connection.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
