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
  | 'keepalive';

interface SSEEvent<T = any> {
  type: SSEEventType;
  data: T;
  timestamp: number;
}

interface GuestJoinedData {
  guestId: string;
  nickname: string;
  roomCode: string;
}

interface GuestLeftData {
  guestId: string;
  nickname: string;
  roomCode: string;
}

interface VoteCastData {
  activityId: string;
  guestId: string;
  nickname: string;
  vote: string;
  voteCounts: Record<string, number>;
}

interface GuessSubmittedData {
  activityId: string;
  guestId: string;
  nickname: string;
  guess: number;
}

interface MessagePostedData {
  activityId: string;
  messageId: string;
  guestId: string;
  nickname: string;
  message: string;
  reactions: Record<string, string[]>;
}

interface MessageReactedData {
  activityId: string;
  messageId: string;
  guestId: string;
  nickname: string;
  emoji: string;
  reactions: Record<string, string[]>;
}

interface ActivityCreatedData {
  activityId: string;
  roomCode: string;
  type: 'bet' | 'closestGuess' | 'message';
  title: string;
}

interface ActivityDeletedData {
  activityId: string;
  roomCode: string;
}

interface CountdownMilestoneData {
  remainingSeconds: number;
  milestone: '1min' | '10sec' | '5sec';
}

interface KeepaliveData {
  ping: string;
}

type SSEEventDataMap = {
  guest_joined: GuestJoinedData;
  guest_left: GuestLeftData;
  vote_cast: VoteCastData;
  guess_submitted: GuessSubmittedData;
  message_posted: MessagePostedData;
  message_reacted: MessageReactedData;
  activity_created: ActivityCreatedData;
  activity_deleted: ActivityDeletedData;
  countdown_milestone: CountdownMilestoneData;
  keepalive: KeepaliveData;
};

class SSEConnection {
  controller: ReadableStreamDefaultController;
  roomCode: string;
  guestId: string | null;
  nickname: string | null;

  constructor(
    controller: ReadableStreamDefaultController,
    roomCode: string,
    guestId: string | null,
    nickname: string | null
  ) {
    this.controller = controller;
    this.roomCode = roomCode;
    this.guestId = guestId;
    this.nickname = nickname;
  }

  send<T extends SSEEventType>(type: T, data: SSEEventDataMap[T]) {
    const event: SSEEvent<SSEEventDataMap[T]> = {
      type,
      data,
      timestamp: Date.now(),
    };

    this.controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
  }

  close() {
    this.controller.close();
  }
}

class SSEConnectionManager {
  private connections: Map<string, SSEConnection[]> = new Map();

  addConnection(
    roomCode: string,
    connection: SSEConnection
  ) {
    const roomConnections = this.connections.get(roomCode) || [];
    roomConnections.push(connection);
    this.connections.set(roomCode, roomConnections);
  }

  removeConnection(
    roomCode: string,
    connection: SSEConnection
  ) {
    const roomConnections = this.connections.get(roomCode) || [];
    const filtered = roomConnections.filter((c) => c !== connection);
    
    if (filtered.length === 0) {
      this.connections.delete(roomCode);
    } else {
      this.connections.set(roomCode, filtered);
    }
  }

  broadcastToRoom<T extends SSEEventType>(
    roomCode: string,
    type: T,
    data: SSEEventDataMap[T],
    excludeConnection?: SSEConnection
  ) {
    const roomConnections = this.connections.get(roomCode) || [];
    
    roomConnections.forEach((connection) => {
      if (connection !== excludeConnection) {
        try {
          connection.send(type, data);
        } catch (err) {
          console.error('Error broadcasting to connection:', err);
        }
      }
    });
  }

  getConnectionCount(roomCode: string): number {
    return (this.connections.get(roomCode) || []).length;
  }

  getRoomConnections(roomCode: string): SSEConnection[] {
    return this.connections.get(roomCode) || [];
  }
}

export const sseManager = new SSEConnectionManager();

export type {
  SSEEvent,
  GuestJoinedData,
  GuestLeftData,
  VoteCastData,
  GuessSubmittedData,
  MessagePostedData,
  MessageReactedData,
  ActivityCreatedData,
  ActivityDeletedData,
  CountdownMilestoneData,
  KeepaliveData,
  SSEEventDataMap,
};

export {
  SSEConnection,
  SSEConnectionManager,
};
