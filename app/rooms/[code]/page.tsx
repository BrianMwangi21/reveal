'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import { getGuestSession } from '@/lib/utils/guestUtils';
import { useSSE } from '@/app/hooks/useSSE';
import GuestList from '@/app/components/reveal/GuestList';
import ActivityCreator from '@/app/components/reveal/ActivityCreator';
import BetComponent from '@/app/components/reveal/Bet';
import ClosestGuessComponent from '@/app/components/reveal/ClosestGuess';
import MessageBoard from '@/app/components/reveal/MessageBoard';
import Countdown from '@/app/components/reveal/Countdown';
import RevealDisplay from '@/app/components/reveal/RevealDisplay';
import ResultsSummary from '@/app/components/reveal/ResultsSummary';
import ShareButtons from '@/app/components/ui/ShareButtons';
import ThemeSwitcher from '@/app/components/ui/ThemeSwitcher';
import DarkModeToggle from '@/app/components/ui/DarkModeToggle';
import type { RevealType } from '@/lib/models/Room';


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
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  activityId: string;
  roomCode: string;
  type: string;
  title: string;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [room, setRoom] = useState<RoomData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const session = getGuestSession();
  const isHost = room?.host.id === session?.guestId;

  const { connectionStatus, reconnect } = useSSE(code.toUpperCase(), session?.guestId || '', session?.nickname || '', {
    onActivityCreated: (data) => {
      setActivities((prev) => [...prev, { activityId: data.activityId, roomCode: data.roomCode, type: data.type, title: data.title }]);
    },
    onActivityDeleted: (data) => {
      setActivities((prev) => prev.filter((a) => a.activityId !== data.activityId));
    },
    onRevealTriggered: () => {
      setRoom((prev) => prev ? { ...prev, status: 'revealed' } : null);
      startCountdownSequence();
    },
    onRevealTimeChanged: async () => {
      const response = await fetch(`/api/rooms/${code}`);
      const result = await response.json();
      if (result.success) {
        setRoom(result.data);
      }
    },
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const session = getGuestSession();

        const response = await fetch(`/api/rooms/${code}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load room');
        }

        setRoom(result.data);
        setIsRevealed(result.data.status === 'revealed');

        if (!session || session.roomCode !== code) {
          router.push(`/rooms/${code}/join`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/activities?roomCode=${code}`);
        const result = await response.json();
        if (result.success || result.data) {
          setActivities(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };

    const pingCurrentGuest = async () => {
      const session = getGuestSession();
      if (!session) return;

      try {
        await fetch('/api/guests/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId: session.guestId }),
        });
      } catch (err) {
        console.error('Error pinging guest:', err);
      }
    };

    fetchRoom();
    fetchActivities();
    const pingInterval = setInterval(pingCurrentGuest, 30000);
    return () => {
      clearInterval(pingInterval);
    };
  }, [code, router]);

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
          <div className="mb-6 text-6xl">
            {error.includes('expired') ? '⏰' : '🚫'}
          </div>
          <h1 className="text-2xl font-bold mb-4">
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

  if (!room) {
    return null;
  }

  const startCountdownSequence = () => {
    setCountdown(10);
    let count = 10;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        setIsRevealed(true);
      }
    }, 1000);
  };

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

      startCountdownSequence();
      setRoom((prev) => prev ? { ...prev, status: 'revealed' } : null);
    } catch (err) {
      console.error('Error triggering reveal:', err);
      alert(err instanceof Error ? err.message : 'Failed to trigger reveal');
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="card p-6 sm:p-8 max-w-4xl mx-auto animate-fade-in">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2 rounded-full text-base sm:text-lg font-semibold animate-scale shadow-lg border-2 border-white/20">
                {room!.code.toUpperCase()}
              </div>
              <ThemeSwitcher />
              <DarkModeToggle />
              {isHost && (
                <button
                  onClick={() => router.push(`/rooms/${code}/dashboard`)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  title="Host Dashboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/rooms/${room!.code.toUpperCase()}`)}
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Copy room link"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'}`} title={connectionStatus} />
              {connectionStatus === 'error' && (
                <button
                  onClick={reconnect}
                  className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Reconnect"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 animate-slide-up">
              {room!.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Hosted by {room!.host.nickname}
            </p>
            {session && (
              <p className="mt-2 text-[var(--secondary)] font-semibold">
                You: {session.nickname}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[var(--muted)] rounded-2xl p-4 sm:p-6 animate-slide-up">
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Reveal Type
              </h3>
              <p className="text-sm sm:text-base text-[var(--muted-foreground)] capitalize">
                {room!.revealType}
              </p>
            </div>

            <div className="bg-[var(--muted)] rounded-2xl p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Status
              </h3>
              <p className="text-sm sm:text-base text-[var(--muted-foreground)] capitalize">
                {room!.status}
              </p>
            </div>

            <div className="bg-[var(--muted)] rounded-2xl p-4 sm:p-6 md:col-span-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Scheduled Reveal
              </h3>
              <p className="text-sm sm:text-base text-[var(--muted-foreground)]">
                {new Date(room!.revealTime).toLocaleString()}
              </p>
            </div>
          </div>

          {!isRevealed && !countdown && (
            <div className="mb-8">
              <Countdown
                revealTime={new Date(room!.revealTime)}
                onReveal={() => {
                  setRoom((prev) => prev ? { ...prev, status: 'revealed' } : null);
                  startCountdownSequence();
                }}
              />
            </div>
          )}

          {countdown !== null && (
            <div className="mb-8 flex flex-col items-center justify-center animate-bounce-in">
              <p className="text-xl sm:text-2xl font-bold mb-4 animate-pulse">
                Get Ready!
              </p>
              <div className="text-9xl sm:text-[12rem] font-extrabold bg-gradient-to-r from-purple via-pink to-blue bg-clip-text text-transparent animate-bounce">
                {countdown}
              </div>
            </div>
          )}

          {isRevealed && !countdown && (
            <>
              <div className="mb-8">
                <RevealDisplay
                  revealType={room!.revealType as RevealType}
                  revealContent={room!.revealContent as { type: 'text' | 'image' | 'video'; value: string; caption?: string }}
                />
              </div>
              <div className="mb-8">
                <ResultsSummary
                  roomCode={code}
                  revealType={room!.revealType as RevealType}
                  revealContent={room!.revealContent as { type: 'text' | 'image' | 'video'; value: string; caption?: string }}
                  revealTime={room!.revealTime}
                />
              </div>
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  onClick={() => window.open(`/api/rooms/${code}/download`, '_blank')}
                  variant="outline"
                  size="md"
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707L19.586 19H14a2 2 0 01-2-2v-3a1 1 0 00-1-1V6a1 1 0 00-1-1H7a1 1 0 00-1 1v3a1 1 0 00-1 1zM16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Download Memories
                </Button>
              </div>
            </>
          )}

          {isHost && !isRevealed && !countdown && (
            <div className="mb-8 flex justify-center animate-slide-up">
              <Button
                onClick={handleReveal}
                disabled={isRevealing}
                size="lg"
              >
                {isRevealing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Revealing...
                  </span>
                ) : '🎉 Reveal Now! 🎉'}
              </Button>
            </div>
          )}

          {isHost && !isRevealed && (
            <div className="mb-6 sm:mb-8 flex justify-end">
              <ActivityCreator roomCode={code} onActivityCreated={() => {
                fetch(`/api/activities?roomCode=${code}`)
                  .then((res) => res.json())
                  .then((result) => setActivities(result.data || []));
              }} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
            <div className="mb-8">
              <GuestList roomCode={code} />
            </div>

          {activities.map((activity) => (
            <div key={activity.activityId}>
              {activity.type === 'bet' && (
                <BetComponent
                  activityId={activity.activityId}
                  title={activity.title}
                  isHost={isHost}
                  isRevealed={isRevealed}
                  revealContent={room!.revealContent as { type: 'text' | 'image' | 'video'; value: string; caption?: string }}
                  onDelete={() => {
                    fetch(`/api/activities?roomCode=${code}`)
                      .then((res) => res.json())
                      .then((result) => setActivities(result.data || []));
                  }}
                />
              )}
              {activity.type === 'closestGuess' && (
                <ClosestGuessComponent
                  activityId={activity.activityId}
                  title={activity.title}
                  isHost={isHost}
                  isRevealed={isRevealed}
                  onDelete={() => {
                    fetch(`/api/activities?roomCode=${code}`)
                      .then((res) => res.json())
                      .then((result) => setActivities(result.data || []));
                  }}
                />
              )}
              {activity.type === 'message' && (
                <MessageBoard
                  activityId={activity.activityId}
                  title={activity.title}
                  isHost={isHost}
                  isRevealed={isRevealed}
                  onDelete={() => {
                    fetch(`/api/activities?roomCode=${code}`)
                      .then((res) => res.json())
                      .then((result) => setActivities(result.data || []));
                  }}
                />
              )}
            </div>
          ))}
          </div>

          <div className="flex justify-center">
            <ShareButtons
              roomName={room!.name}
              roomCode={room!.code}
              revealContent={room!.revealContent as { type: 'text' | 'image' | 'video'; value: string }}
              isRevealed={isRevealed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
