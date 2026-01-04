'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { saveGuestSession, getGuestSession } from '@/lib/utils/guestUtils';

interface RoomData {
  code: string;
  name: string;
}

export default function JoinRoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [room, setRoom] = useState<RoomData | null>(null);
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const session = getGuestSession();

        if (session && session.roomCode === code) {
          router.push(`/rooms/${code}`);
          return;
        }

        const response = await fetch(`/api/rooms/${code}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load room');
        }

        if (result.data.isExpired) {
          throw new Error('Room has expired');
        }

        setRoom(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [code, router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsJoining(true);

    try {
      const response = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join room');
      }

      saveGuestSession(result.data);
      router.push(`/rooms/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center animate-fade-in">
        <div className="text-white text-2xl font-semibold animate-bounce">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4 animate-fade-in">
        <div className="card p-8 max-w-md w-full text-center animate-scale">
          <div className="mb-6 text-6xl">
            {error.includes('expired') ? '⏰' : '🚫'}
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {error.includes('expired') ? 'Room Expired' : 'Room Not Found'}
          </h1>
          <p className="mb-6">
            {error}
          </p>
          <Button
            onClick={() => router.push('/')}
            size="md"
            className="w-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full animate-scale">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-lg font-semibold animate-scale shadow-lg border-2 border-white/20">
              {room!.code.toUpperCase()}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/rooms/${room!.code}`)}
              className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title="Copy room link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-2 animate-slide-up">
            {room!.name}
          </h1>
          <p className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Enter your nickname to join
          </p>
        </div>

        <form onSubmit={handleJoin}>
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="text-center text-lg"
              maxLength={12}
            />
            <p className="text-sm mt-2 text-center">
              Max 12 characters, letters only
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <Button
            size="lg"
            className="w-full"
            type="submit"
            disabled={isJoining || !nickname.trim()}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-sm hover:underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
