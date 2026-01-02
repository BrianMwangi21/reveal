'use client';

import { useCallback, useEffect, useState } from 'react';
import { getGuestSession } from '@/lib/utils/guestUtils';

interface Guest {
  guestId: string;
  nickname: string;
  joinedAt: string;
  lastActive: string;
}

interface GuestListProps {
  roomCode: string;
}

export default function GuestList({ roomCode }: GuestListProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGuests = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${roomCode}/guests`);
      const result = await response.json();

      if (result.success) {
        setGuests(result.data);
      }
    } catch (err) {
      console.error('Error fetching guests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roomCode]);

  const pingCurrentGuest = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchGuests();
    const guestsInterval = setInterval(fetchGuests, 5000);
    const pingInterval = setInterval(pingCurrentGuest, 30000);
    return () => {
      clearInterval(guestsInterval);
      clearInterval(pingInterval);
    };
  }, [fetchGuests, pingCurrentGuest]);

  const isOnline = (lastActive: string) => {
    const lastActiveTime = new Date(lastActive).getTime();
    const now = new Date().getTime();
    return now - lastActiveTime < 60000;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Guests ({guests.length})
      </h3>
      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : guests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No guests yet</p>
      ) : (
        <div className="space-y-2">
          {guests.map((guest) => {
            const session = getGuestSession();
            const isCurrentUser = session?.guestId === guest.guestId;
            return (
              <div
                key={guest.guestId}
                className={`flex items-center justify-between rounded-lg p-3 ${
                  isCurrentUser
                    ? 'bg-pink/10 border-2 border-pink'
                    : 'bg-white dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isOnline(guest.lastActive) ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {guest.nickname}
                    {isCurrentUser && <span className="ml-2 text-sm text-pink font-medium">(You)</span>}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(guest.joinedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
