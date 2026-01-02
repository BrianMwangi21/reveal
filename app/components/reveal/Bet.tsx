'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from '@/app/components/ui/Button';
import { getGuestSession } from '@/lib/utils/guestUtils';

interface BetProps {
  activityId: string;
  title: string;
  isHost?: boolean;
  onDelete?: () => void;
}

interface BetData {
  options: string[];
  bets: Array<{
    guestId: string;
    nickname: string;
    option: string;
    points: number;
    timestamp: string;
  }>;
}

export default function BetComponent({ activityId, title, isHost, onDelete }: BetProps) {
  const [bet, setBet] = useState<BetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [points, setPoints] = useState(100);
  const [betting, setBetting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const session = getGuestSession();

  const fetchBet = useCallback(async () => {
    try {
      const response = await fetch(`/api/activities/bet/${activityId}`);
      const result = await response.json();

      if (response.ok) {
        setBet(result.data);
        const myBet = result.data.bets?.find((b: { guestId: string; option: string; points: number }) => b.guestId === session?.guestId);
        if (myBet) {
          setSelectedOption(myBet.option);
          setPoints(myBet.points);
        }
      }
    } catch (err) {
      console.error('Error fetching bet:', err);
    } finally {
      setLoading(false);
    }
  }, [activityId, session?.guestId]);

  const myBet = bet?.bets.find((b) => b.guestId === session?.guestId);

  useEffect(() => {
    fetchBet();
    const interval = setInterval(fetchBet, 5000);
    return () => clearInterval(interval);
  }, [fetchBet]);

  const handlePlaceBet = async () => {
    if (!session) {
      setError('Please join the room first');
      return;
    }

    if (!selectedOption || points < 0) {
      setError('Please select an option and enter valid points');
      return;
    }

    setBetting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/activities/bet/${activityId}/bet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: session.guestId,
          nickname: session.nickname,
          option: selectedOption,
          points,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to place bet');
      }

      setBet(result.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setBetting(false);
    }
  };

  const getOptionStats = (option: string) => {
    const optionBets = bet?.bets.filter((b) => b.option === option) || [];
    const totalPoints = optionBets.reduce((sum, b) => sum + b.points, 0);
    return { count: optionBets.length, totalPoints };
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Loading...</h3>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg relative">
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
        {isHost && onDelete && (
          <button
            onClick={async () => {
              if (confirm('Delete this activity?')) {
                try {
                  await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
                  onDelete();
                } catch (err) {
                  console.error('Error deleting activity:', err);
                }
              }
            }}
            className="text-red-500 hover:text-red-700 p-2"
            title="Delete activity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {bet?.options.map((option) => {
          const stats = getOptionStats(option);
          const isSelected = selectedOption === option;
          return (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-pink bg-pink/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-pink/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">{option}</span>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.count} bets · {stats.totalPoints} pts
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Your Points (0-100)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-pink focus:ring-2 focus:ring-pink/20 outline-none transition-all bg-white dark:bg-gray-800 dark:text-white"
        />
      </div>

      {myBet && (
        <div className="bg-pink/10 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your current bet: <span className="font-semibold">{myBet.points} pts on {myBet.option}</span>
          </p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">Bet placed!</p>}

      <Button onClick={handlePlaceBet} disabled={betting} size="md" className="w-full">
        {betting ? 'Placing bet...' : myBet ? 'Update Bet' : 'Place Bet'}
      </Button>
    </div>
  );
}
