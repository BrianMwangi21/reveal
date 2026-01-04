'use client';

import { useEffect, useState } from 'react';
import type { RevealType } from '@/lib/models/Room';

interface ResultsSummaryProps {
  roomCode: string;
  revealType: RevealType;
  revealContent: {
    type: 'text' | 'image' | 'video';
    value: string;
    caption?: string;
  };
  revealTime: string;
}

export default function ResultsSummary({ roomCode, revealType, revealContent, revealTime }: ResultsSummaryProps) {
  const [betWinners, setBetWinners] = useState<Record<string, string[]>>({});
  const [messageCount, setMessageCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activitiesRes = await fetch(`/api/activities?roomCode=${roomCode}`);
        const activitiesData = await activitiesRes.json();

        const guestsRes = await fetch(`/api/rooms/${roomCode}/guests`);
        const guestsData = await guestsRes.json();
        setGuestCount(guestsData.data?.length || 0);

        let messageTotal = 0;
        const winners: Record<string, string[]> = {};

        for (const activity of activitiesData.data || []) {
          if (activity.type === 'message') {
            const msgRes = await fetch(`/api/activities/message/${activity.activityId}`);
            const msgData = await msgRes.json();
            messageTotal += msgData.data?.messages?.length || 0;
          } else if (activity.type === 'bet') {
            const betRes = await fetch(`/api/activities/bet/${activity.activityId}`);
            const betData = await betRes.json();
            const correctOption = betData.data?.options?.find((opt: string) =>
              opt.toLowerCase() === revealContent.value.toLowerCase()
            );
            if (correctOption) {
              const correctVoters = betData.data?.bets?.filter((b: { option: string }) => b.option === correctOption) || [];
              winners[activity.title] = correctVoters.map((v: { nickname: string }) => v.nickname);
            }
          }
        }

        setMessageCount(messageTotal);
        setBetWinners(winners);
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomCode, revealContent.value]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg animate-fade-in">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🎊 Event Results</h3>
        <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
      </div>
    );
  }

  const getRevealIcon = () => {
    switch (revealType) {
      case 'gender': return revealContent.value.toLowerCase().includes('boy') ? '👦' : '👧';
      case 'baby': return '👶';
      case 'birthday': return '🎂';
      case 'anniversary': return '💕';
      case 'custom': return '🎉';
      default: return '🎉';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-6 shadow-lg animate-fade-in">
      <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        🎊 Event Results
      </h3>

      <div className="mb-6 text-center pb-6 border-b border-purple-200 dark:border-purple-700">
        <div className="text-6xl mb-4 animate-bounce">{getRevealIcon()}</div>
        <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          {revealContent.value}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Revealed on {new Date(revealTime).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{guestCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Guests</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{messageCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
        </div>
      </div>

      {Object.keys(betWinners).length > 0 && (
        <div className="mb-6">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            🏆 Correct Predictions
          </h5>
          <div className="space-y-3">
            {Object.entries(betWinners).map(([title, winners]) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</p>
                <div className="flex flex-wrap gap-2">
                  {winners.length > 0 ? (
                    winners.map((winner) => (
                      <span key={winner} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {winner}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">No correct predictions</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-4 border-t border-purple-200 dark:border-purple-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Thanks for celebrating with us! 🎉
        </p>
      </div>
    </div>
  );
}
