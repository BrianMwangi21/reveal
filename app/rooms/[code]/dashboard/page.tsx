'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import AnalyticsCards from '@/app/components/reveal/AnalyticsCards';
import RoomSettingsModal from '@/app/components/reveal/RoomSettingsModal';
import { getGuestSession } from '@/lib/utils/guestUtils';
import type { RevealType } from '@/lib/models/Room';

interface RoomData {
  id: string;
  code: string;
  name: string;
  revealTime: string;
  revealType: RevealType;
  revealContent: {
    type: 'text' | 'image' | 'video';
    value: string;
    caption?: string;
  };
  host: {
    id: string;
    nickname: string;
  };
  status: string;
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const session = getGuestSession();

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${code}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load room');
        }

        if (!session || result.data.host.id !== session.guestId) {
          setError('You do not have permission to access this dashboard');
          return;
        }

        setRoom(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [code, session]);

  const handleReveal = async () => {
    if (!session) return;
    setIsRevealing(true);

    try {
      const response = await fetch(`/api/rooms/${code}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: session.guestId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to trigger reveal');
      }

      setRoom((prev) => prev ? { ...prev, status: 'revealed' } : null);
      alert('Reveal triggered successfully!');
    } catch (err) {
      console.error('Error triggering reveal:', err);
      alert(err instanceof Error ? err.message : 'Failed to trigger reveal');
    } finally {
      setIsRevealing(false);
    }
  };

  const handleRoomUpdate = () => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${code}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load room');
        }

        setRoom(result.data);
      } catch (err) {
        console.error('Error refreshing room:', err);
      }
    };

    fetchRoom();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center animate-fade-in">
        <div className="text-white text-2xl font-semibold animate-bounce-in">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4 animate-fade-in">
        <div className="card p-8 max-w-md w-full text-center animate-scale">
          <div className="mb-6 text-6xl">🚫</div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
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

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="card p-6 sm:p-8 max-w-5xl mx-auto animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => router.push(`/rooms/${code}`)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Room
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Host Dashboard
            </h1>
            <div></div>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-2">{room.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">Room Code: {room.code.toUpperCase()}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                {room.status.toUpperCase()}
              </span>
              {room.status !== 'revealed' && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Reveal: {new Date(room.revealTime).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <AnalyticsCards roomCode={code} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-fade-in">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>⚙️</span>
                Room Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Edit room details and settings
              </p>
              <Button
                onClick={() => setShowSettings(true)}
                size="md"
                className="w-full"
              >
                Open Settings
              </Button>
            </div>

            {room.status !== 'revealed' && (
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🎉</span>
                  Emergency Reveal
                </h3>
                <p className="opacity-90 mb-4">
                  Trigger the reveal immediately for all guests
                </p>
                <Button
                  onClick={handleReveal}
                  disabled={isRevealing}
                  variant="secondary"
                  size="md"
                  className="w-full bg-white text-pink-600 hover:bg-gray-100"
                >
                  {isRevealing ? 'Revealing...' : 'Trigger Reveal Now'}
                </Button>
              </div>
            )}
          </div>

          {room.status === 'revealed' && (
            <div className="mt-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>✅</span>
                Room Revealed
              </h3>
              <p className="opacity-90">
                Your room has been revealed and will expire in 7 days. Guests can still view the results and download memories.
              </p>
            </div>
          )}
        </div>
      </div>

      {showSettings && room && session && (
        <RoomSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          room={room}
          guestId={session.guestId}
          onUpdate={handleRoomUpdate}
        />
      )}
    </div>
  );
}
