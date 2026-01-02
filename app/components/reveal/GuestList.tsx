'use client';

import { useCallback, useEffect, useState } from 'react';

interface Guest {
  guestId: string;
  nickname: string;
  joinedAt: string;
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

  useEffect(() => {
    fetchGuests();
    const interval = setInterval(fetchGuests, 5000);
    return () => clearInterval(interval);
  }, [fetchGuests]);

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
          {guests.map((guest) => (
            <div
              key={guest.guestId}
              className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-3"
            >
              <span className="text-gray-900 dark:text-white font-medium">
                {guest.nickname}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(guest.joinedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
