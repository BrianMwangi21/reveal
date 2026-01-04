import { useEffect, useRef, useState, useCallback } from 'react';

type SSEEventType = 
  | 'guest_joined'
  | 'guest_left'
  | 'vote_cast'
  | 'guess_submitted'
  | 'message_posted'
  | 'message_reacted'
  | 'activity_created'
  | 'activity_deleted'
  | 'countdown_milestone'
  | 'reveal_triggered'
  | 'keepalive';

interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: number;
}

type SSEEventHandler = (event: SSEEvent<unknown>) => void;

interface UseSSEOptions {
  onEvent?: SSEEventHandler;
  onGuestJoined?: (data: { guestId: string; nickname: string; roomCode: string }) => void;
  onGuestLeft?: (data: { guestId: string; nickname: string; roomCode: string }) => void;
  onVoteCast?: (data: { activityId: string; guestId: string; nickname: string; vote: string; voteCounts: Record<string, number> }) => void;
  onGuessSubmitted?: (data: { activityId: string; guestId: string; nickname: string; guess: number }) => void;
  onMessagePosted?: (data: { activityId: string; messageId: string; guestId: string; nickname: string; message: string; reactions: Record<string, string[]> }) => void;
  onMessageReacted?: (data: { activityId: string; messageId: string; guestId: string; nickname: string; emoji: string; reactions: Record<string, string[]> }) => void;
  onActivityCreated?: (data: { activityId: string; roomCode: string; type: 'bet' | 'closestGuess' | 'message'; title: string }) => void;
  onActivityDeleted?: (data: { activityId: string; roomCode: string }) => void;
  onCountdownMilestone?: (data: { remainingSeconds: number; milestone: '1min' | '10sec' | '5sec' }) => void;
  onRevealTriggered?: (data: { roomCode: string; revealType: string; revealContent: { type: 'text' | 'image' | 'video'; value: string; caption?: string } }) => void;
  onKeepalive?: () => void;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useSSE(roomCode: string, guestId: string, nickname: string, options: UseSSEOptions = {}) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);
  const connectRef = useRef<() => void>(() => {});
  const maxRetries = 3;

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const handleMessage = useCallback((parsedEvent: SSEEvent) => {
    switch (parsedEvent.type) {
      case 'guest_joined':
        optionsRef.current.onGuestJoined?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onGuestJoined>>[0]);
        break;
      case 'guest_left':
        optionsRef.current.onGuestLeft?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onGuestLeft>>[0]);
        break;
      case 'vote_cast':
        optionsRef.current.onVoteCast?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onVoteCast>>[0]);
        break;
      case 'guess_submitted':
        optionsRef.current.onGuessSubmitted?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onGuessSubmitted>>[0]);
        break;
      case 'message_posted':
        optionsRef.current.onMessagePosted?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onMessagePosted>>[0]);
        break;
      case 'message_reacted':
        optionsRef.current.onMessageReacted?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onMessageReacted>>[0]);
        break;
      case 'activity_created':
        optionsRef.current.onActivityCreated?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onActivityCreated>>[0]);
        break;
      case 'activity_deleted':
        optionsRef.current.onActivityDeleted?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onActivityDeleted>>[0]);
        break;
      case 'countdown_milestone':
        optionsRef.current.onCountdownMilestone?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onCountdownMilestone>>[0]);
        break;
      case 'reveal_triggered':
        optionsRef.current.onRevealTriggered?.(parsedEvent.data as Parameters<NonNullable<typeof optionsRef.current.onRevealTriggered>>[0]);
        break;
      case 'keepalive':
        optionsRef.current.onKeepalive?.();
        break;
    }

    optionsRef.current.onEvent?.(parsedEvent);
  }, []);

  const connect = useCallback(() => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');

    const url = `/api/rooms/${roomCode}/events?guestId=${encodeURIComponent(guestId)}&nickname=${encodeURIComponent(nickname)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus('connected');
      retryCountRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      if (!event.data || event.data.trim() === '') {
        return;
      }

      try {
        const parsedEvent = JSON.parse(event.data) as SSEEvent;
        handleMessage(parsedEvent);
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();

      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 4000);
        const jitter = Math.random() * 1000;
        connectTimeoutRef.current = setTimeout(() => {
          connectRef.current();
        }, backoffDelay + jitter);
      } else {
        setConnectionStatus('error');
      }
    };
  }, [roomCode, guestId, nickname, handleMessage]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    retryCountRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    if (roomCode && guestId && nickname) {
      const initialDelay = Math.random() * 2000;
      const timeoutId = setTimeout(() => {
        connect();
      }, initialDelay);

      return () => {
        clearTimeout(timeoutId);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };
    }
  }, [roomCode, guestId, nickname, connect]);

  return {
    connectionStatus,
    reconnect,
    disconnect,
  };
}
