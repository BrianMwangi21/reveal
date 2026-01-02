export interface GuestSession {
  guestId: string;
  roomCode: string;
  nickname: string;
  host?: boolean;
}

const GUEST_SESSION_KEY = 'reveal_guest_session';

export function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function saveGuestSession(session: GuestSession): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  }
}

export function getGuestSession(): GuestSession | null {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem(GUEST_SESSION_KEY);
    if (session) {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearGuestSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_SESSION_KEY);
  }
}

export function updateGuestSessionRoom(roomCode: string): void {
  const session = getGuestSession();
  if (session) {
    saveGuestSession({ ...session, roomCode });
  }
}
