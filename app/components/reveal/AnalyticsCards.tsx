'use client';

import { useEffect, useState } from 'react';

interface AnalyticsCardProps {
  roomCode: string;
}

export default function AnalyticsCards({ roomCode }: AnalyticsCardProps) {
  const [guestCount, setGuestCount] = useState(0);
  const [participatingGuests, setParticipatingGuests] = useState<Set<string>>(new Set());
  const [activityCounts, setActivityCounts] = useState({
    bet: 0,
    closestGuess: 0,
    message: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guestsRes, activitiesRes] = await Promise.all([
          fetch(`/api/rooms/${roomCode}/guests`),
          fetch(`/api/activities?roomCode=${roomCode}`),
        ]);

        const guestsData = await guestsRes.json();
        const activitiesData = await activitiesRes.json();

        setGuestCount(guestsData.data?.length || 0);

        const participants = new Set<string>();
        const counts = { bet: 0, closestGuess: 0, message: 0 };

        for (const activity of activitiesData.data || []) {
          counts[activity.type as keyof typeof counts] += 1;

          if (activity.type === 'bet') {
            const betRes = await fetch(`/api/activities/bet/${activity.activityId}`);
            const betData = await betRes.json();
            betData.data?.bets?.forEach((b: { nickname: string }) => {
              participants.add(b.nickname);
            });
          } else if (activity.type === 'closestGuess') {
            const guessRes = await fetch(`/api/activities/closestGuess/${activity.activityId}`);
            const guessData = await guessRes.json();
            guessData.data?.guesses?.forEach((g: { nickname: string }) => {
              participants.add(g.nickname);
            });
          } else if (activity.type === 'message') {
            const msgRes = await fetch(`/api/activities/message/${activity.activityId}`);
            const msgData = await msgRes.json();
            msgData.data?.messages?.forEach((m: { nickname: string }) => {
              participants.add(m.nickname);
            });
          }
        }

        setParticipatingGuests(participants);
        setActivityCounts(counts);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomCode]);

  const participationRate = guestCount > 0 ? Math.round((participatingGuests.size / guestCount) * 100) : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">Total Guests</h3>
          <div className="text-3xl">👥</div>
        </div>
        <p className="text-4xl font-extrabold mb-1">{guestCount}</p>
        <p className="text-sm opacity-80">Joined the room</p>
      </div>

      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">Participation Rate</h3>
          <div className="text-3xl">🎯</div>
        </div>
        <p className="text-4xl font-extrabold mb-1">{participationRate}%</p>
        <p className="text-sm opacity-80">{participatingGuests.size} of {guestCount} guests participated</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium uppercase tracking-wide opacity-90">Activities</h3>
          <div className="text-3xl">🎮</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-1">
          <div className="text-center">
            <p className="text-2xl font-bold">{activityCounts.bet}</p>
            <p className="text-xs opacity-80">Bets</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{activityCounts.closestGuess}</p>
            <p className="text-xs opacity-80">Guesses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{activityCounts.message}</p>
            <p className="text-xs opacity-80">Messages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
