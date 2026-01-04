'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import ThemeSwitcher from '@/app/components/ui/ThemeSwitcher';
import DarkModeToggle from '@/app/components/ui/DarkModeToggle';

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
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="card p-12 max-w-2xl w-full text-center animate-scale">
        <div className="mb-8">
          <div className="flex justify-end gap-2 mb-4">
            <ThemeSwitcher />
            <DarkModeToggle />
          </div>
          <h1 className="text-5xl font-bold mb-4 animate-bounce-in">
            🎉 Reveal
          </h1>
          <p className="text-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Create memorable reveal moments
          </p>
          <p className="text-sm mt-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Gender reveals, birthdays, anniversaries, and more
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/create">
            <Button size="lg" className="w-full animate-fade-in">
              Create a Room
            </Button>
          </Link>

          <div className="text-center">or</div>

          <form onSubmit={handleJoinRoom}>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
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

        <div className="mt-8 pt-8 border-t border-[var(--border)]">
          <p className="text-sm animate-fade-in">
            Host: manage your reveal, share code, celebrate together
          </p>
          <p className="text-sm mt-2 animate-fade-in">
            Guest: join fun, vote, guess, and watch reveal together
          </p>
        </div>
      </div>
    </div>
  );
}
