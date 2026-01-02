'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';

interface RoomData {
  id: string;
  code: string;
  name: string;
  revealTime: string;
  revealType: string;
  revealContent: {
    type: string;
    value: string;
    caption?: string;
  };
  host: {
    id: string;
    nickname: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${code}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load room');
        }

        setRoom(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [code]);

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
          <div className="mb-6 text-6xl">🚫</div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Room Not Found
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

  const timeUntilReveal = new Date(room!.revealTime).getTime() - new Date().getTime();
  const isRevealed = room!.status === 'revealed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold via-pink to-blue">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple to-pink text-white px-6 py-2 rounded-full text-lg font-semibold mb-4">
              {room!.code.toUpperCase()}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {room!.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Hosted by {room!.host.nickname}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Reveal Type
              </h3>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {room!.revealType}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Status
              </h3>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {room!.status}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 md:col-span-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Scheduled Reveal
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(room!.revealTime).toLocaleString()}
              </p>
            </div>
          </div>

          {!isRevealed && timeUntilReveal > 0 && (
            <div className="bg-gradient-to-r from-purple to-pink rounded-2xl p-6 text-center text-white mb-6">
              <p className="text-sm mb-2">Time until reveal:</p>
              <p className="text-3xl font-bold">
                {Math.floor(timeUntilReveal / (1000 * 60 * 60 * 24))}d{' '}
                {Math.floor((timeUntilReveal % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h{' '}
                {Math.floor((timeUntilReveal % (1000 * 60 * 60)) / (1000 * 60))}m
              </p>
            </div>
          )}

          {isRevealed && (
            <div className="bg-gradient-to-r from-gold via-pink to-blue rounded-2xl p-8 text-center text-white mb-6">
              <p className="text-lg mb-4">🎉 Reveal! 🎉</p>
              <p className="text-3xl font-bold mb-2">{room!.revealContent.value}</p>
              {room!.revealContent.caption && (
                <p className="text-lg">{room!.revealContent.caption}</p>
              )}
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigator.clipboard.writeText(
                `${window.location.origin}?code=${room!.code}`
              )}
              variant="outline"
              size="md"
            >
              Share Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
