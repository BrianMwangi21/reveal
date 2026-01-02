'use client';

import { useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';

interface ActivityCreatorProps {
  roomCode: string;
  onActivityCreated: () => void;
}

export default function ActivityCreator({ roomCode, onActivityCreated }: ActivityCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activityType, setActivityType] = useState<'bet' | 'closestGuess' | 'message' | null>(null);
  const [title, setTitle] = useState('');
  const [betOptions, setBetOptions] = useState('');
  const [closestGuessQuestion, setClosestGuessQuestion] = useState('');
  const [closestGuessUnit, setClosestGuessUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateActivity = async () => {
    if (!title || !activityType) {
      setError('Please fill in all required fields');
      return;
    }

    if (activityType === 'bet' && (!betOptions || betOptions.split(',').length < 2)) {
      setError('Please provide at least 2 options (comma-separated)');
      return;
    }

    if (activityType === 'closestGuess' && !closestGuessQuestion) {
      setError('Please provide a question');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, type: activityType, title }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create activity');
      }

      const activity = result.data;

      if (activityType === 'bet') {
        const options = betOptions.split(',').map((opt) => opt.trim());
        const betResponse = await fetch(`/api/activities/bet/${activity.activityId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode, options }),
        });

        if (!betResponse.ok) {
          throw new Error('Failed to create bet activity');
        }
      } else if (activityType === 'closestGuess') {
        const guessResponse = await fetch(`/api/activities/closestGuess/${activity.activityId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode, question: closestGuessQuestion, unit: closestGuessUnit }),
        });

        if (!guessResponse.ok) {
          throw new Error('Failed to create closest guess activity');
        }
      } else if (activityType === 'message') {
        const messageResponse = await fetch(`/api/activities/message/${activity.activityId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode }),
        });

        if (!messageResponse.ok) {
          throw new Error('Failed to create message board');
        }
      }

      onActivityCreated();
      resetForm();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setActivityType(null);
    setTitle('');
    setBetOptions('');
    setClosestGuessQuestion('');
    setClosestGuessUnit('');
    setError('');
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="md" variant="secondary">
        + Create Activity
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create Activity</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Activity Type
                </label>
                <select
                  value={activityType || ''}
                  onChange={(e) => setActivityType(e.target.value as 'bet' | 'closestGuess' | 'message')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-pink focus:ring-2 focus:ring-pink/20 outline-none transition-all bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select type...</option>
                  <option value="closestGuess">Closest Guess</option>
                  <option value="message">Message Board</option>
                </select>
              </div>

              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Activity title..."
              />

              {activityType === 'bet' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={betOptions}
                    onChange={(e) => setBetOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-pink focus:ring-2 focus:ring-pink/20 outline-none transition-all bg-white dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}

              {activityType === 'closestGuess' && (
                <>
                  <Input
                    label="Question"
                    value={closestGuessQuestion}
                    onChange={(e) => setClosestGuessQuestion(e.target.value)}
                    placeholder="What will the baby weigh?"
                  />
                  <Input
                    label="Unit (optional)"
                    value={closestGuessUnit}
                    onChange={(e) => setClosestGuessUnit(e.target.value)}
                    placeholder="oz, lbs, minutes..."
                  />
                </>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  resetForm();
                  setIsOpen(false);
                }}
                variant="outline"
                size="md"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateActivity}
                disabled={loading}
                size="md"
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
