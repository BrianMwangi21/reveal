'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { getGuestSession } from '@/lib/utils/guestUtils';

interface MessageBoardProps {
  activityId: string;
  title: string;
  isHost?: boolean;
  isRevealed?: boolean;
  onDelete?: () => void;
}

interface MessageData {
  id: string;
  guestId: string;
  nickname: string;
  content: string;
  reactions: Record<string, string[]>;
  timestamp: string;
}

interface MessageBoardData {
  messages: MessageData[];
}

const EMOJIS = ['❤️', '😂', '🎉', '🥳', '👍', '🙌', '💯', '😍'];

export default function MessageBoard({ activityId, title, isHost, isRevealed, onDelete }: MessageBoardProps) {
  const [messageBoard, setMessageBoard] = useState<MessageBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const session = getGuestSession();

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/activities/message/${activityId}`);
      const result = await response.json();

      if (response.ok) {
        setMessageBoard(result.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handlePostMessage = async () => {
    if (!session) {
      setError('Please join the room first');
      return;
    }

    if (!newMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    setPosting(true);
    setError('');

    try {
      const response = await fetch(`/api/activities/message/${activityId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: session.guestId,
          nickname: session.nickname,
          content: newMessage.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post message');
      }

      setMessageBoard(result.data);
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post message');
    } finally {
      setPosting(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!session) return;

    try {
      const response = await fetch(
        `/api/activities/message/${activityId}/message/${messageId}/react`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestId: session.guestId, emoji }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessageBoard(result.data);
      }
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  };

  const getReactionStatus = (message: MessageData, emoji: string) => {
    const reactions = message.reactions[emoji] || [];
    return {
      count: reactions.length,
      isReacted: session && reactions.includes(session.guestId),
    };
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Loading...</h3>
      </div>
    );
  }

  const sortedMessages = messageBoard?.messages.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ) || [];

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

      {!isRevealed && (
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share a message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePostMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handlePostMessage}
              disabled={posting}
              size="md"
              variant="primary"
            >
              {posting ? '...' : 'Post'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}

      {isRevealed && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400 font-medium">⏰ Messages closed - Reveal complete!</p>
        </div>
      )}

      {sortedMessages.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No messages yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedMessages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-xl border-2 ${
                message.guestId === session?.guestId
                  ? 'bg-pink/10 border-pink'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {message.nickname}
                  </span>
                  {message.guestId === session?.guestId && (
                    <span className="ml-2 text-xs text-pink font-medium">(You)</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-3">{message.content}</p>

              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((emoji) => {
                  const { count, isReacted } = getReactionStatus(message, emoji);
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message.id, emoji)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
                        isReacted
                          ? 'bg-pink text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="text-xs">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
