'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

export default function Home() {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/rooms/${roomCode}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Room not found');
        setLoading(false);
        return;
      }

      if (data.data.isExpired) {
        setError('Room has expired');
        setLoading(false);
        return;
      }

      router.push(`/rooms/${roomCode}/join`);
    } catch {
      setError('Failed to join room');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold via-pink to-blue flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            🎉 Reveal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Create memorable reveal moments
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Gender reveals, birthdays, anniversaries, and more
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/create">
            <Button size="lg" className="w-full">
              Create a Room
            </Button>
          </Link>

          <div className="text-center text-gray-400 dark:text-gray-500">or</div>

          <form onSubmit={handleJoinRoom}>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="text-center text-lg"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              type="submit"
              disabled={loading || !roomCode.trim()}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </form>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Host: manage your reveal, share the code, celebrate together
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Guest: join the fun, vote, guess, and watch the reveal together
          </p>
        </div>
      </div>
    </div>
  );
}
