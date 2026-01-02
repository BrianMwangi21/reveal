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
      <div className="min-h-screen bg-gradient-to-br from-gold via-pink to-blue flex items-center justify-center">
        <div className="text-white text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold via-pink to-blue flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6 text-6xl">
            {error.includes('expired') ? '⏰' : '🚫'}
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {error.includes('expired') ? 'Room Expired' : 'Room Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold via-pink to-blue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple to-pink text-white px-6 py-2 rounded-full text-lg font-semibold mb-4">
            {room!.code.toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {room!.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
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
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
