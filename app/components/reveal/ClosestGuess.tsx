'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { getGuestSession } from '@/lib/utils/guestUtils';

interface ClosestGuessProps {
  activityId: string;
  title: string;
  isHost?: boolean;
  onDelete?: () => void;
}

interface ClosestGuessData {
  question: string;
  unit: string;
  guesses: Array<{
    guestId: string;
    nickname: string;
    value: number;
    timestamp: string;
  }>;
  revealedValue?: number;
}

export default function ClosestGuessComponent({ activityId, title, isHost, onDelete }: ClosestGuessProps) {
  const [closestGuess, setClosestGuess] = useState<ClosestGuessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [guessValue, setGuessValue] = useState('');
  const [guessing, setGuessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const session = getGuestSession();

  const fetchClosestGuess = useCallback(async () => {
    try {
      const response = await fetch(`/api/activities/closestGuess/${activityId}`);
      const result = await response.json();

      if (response.ok) {
        setClosestGuess(result.data);
        const myGuess = result.data.guesses?.find((g: { guestId: string; value: number }) => g.guestId === session?.guestId);
        if (myGuess) {
          setGuessValue(myGuess.value.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching closest guess:', err);
    } finally {
      setLoading(false);
    }
  }, [activityId, session?.guestId]);

  useEffect(() => {
    fetchClosestGuess();
  }, [fetchClosestGuess]);

  const myGuess = closestGuess?.guesses.find((g) => g.guestId === session?.guestId);

  const handleSubmitGuess = async () => {
    if (!session) {
      setError('Please join the room first');
      return;
    }

    if (!guessValue || isNaN(parseFloat(guessValue))) {
      setError('Please enter a valid number');
      return;
    }

    setGuessing(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/activities/closestGuess/${activityId}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: session.guestId,
          nickname: session.nickname,
          value: parseFloat(guessValue),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit guess');
      }

      setClosestGuess(result.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit guess');
    } finally {
      setGuessing(false);
    }
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

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {closestGuess?.question}
        </p>
        {closestGuess?.unit && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Answer in: {closestGuess.unit}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Input
          label="Your Guess"
          type="number"
          value={guessValue}
          onChange={(e) => setGuessValue(e.target.value)}
          placeholder="Enter your guess..."
        />
      </div>

      {myGuess && (
        <div className="bg-blue-10 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your current guess: <span className="font-semibold">{myGuess.value} {closestGuess?.unit}</span>
          </p>
        </div>
      )}

      {closestGuess?.revealedValue !== undefined && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4 border-2 border-green-500">
          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            Revealed: {closestGuess.revealedValue} {closestGuess.unit}
          </p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">Guess submitted!</p>}

      <Button onClick={handleSubmitGuess} disabled={guessing} size="md" className="w-full">
        {guessing ? 'Submitting...' : myGuess ? 'Update Guess' : 'Submit Guess'}
      </Button>

      {closestGuess?.guesses && closestGuess.guesses.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            All Guesses ({closestGuess.guesses.length})
          </h4>
          <div className="space-y-2">
            {closestGuess.guesses.map((guess) => (
              <div
                key={guess.guestId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  guess.guestId === session?.guestId
                    ? 'bg-pink/10 border-2 border-pink'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {guess.nickname}
                  {guess.guestId === session?.guestId && ' (You)'}
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {guess.value} {closestGuess.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
