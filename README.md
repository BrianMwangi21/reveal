# Reveal - Celebration Event Platform

**Reveal** is a real-time event platform for creating memorable reveal moments - gender reveals, baby reveals, birthday reveals, and more.

## How It Works

1. **Create a Room**: Host creates a reveal event with a custom name (e.g., "Sally's Gender Reveal")
2. **Share the Code**: Room generates a unique 6-digit code for guests to join
3. **Guests Join**: Participants enter the code, add their nickname, and join the room
4. **Pre-Reveal Activities**: Guests can vote, guess, leave messages, and participate in activities before the big moment
5. **Countdown**: Live countdown timer builds anticipation
6. **The Reveal**: At the scheduled time, the reveal is shown to all participants simultaneously

## Features

- **Room Management**: Create events with custom names and scheduled reveal times
- **Guest Join System**: Unique room codes, nickname registration
- **Live Activities**: Voting polls, prediction pools, message boards
- **Real-Time Sync**: WebSocket-based updates for all participants
- **Countdown Timer**: Dramatic countdown to the reveal moment
- **Simultaneous Reveal**: All guests see the reveal at the same time
- **Post-Reveal**: Share results, replay the moment, download memories

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Real-Time**: WebSocket integration
- **Styling**: Tailwind CSS 4
- **Deployment**: Vercel

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating reveal events.

## Project Structure

```
app/
  api/              # API routes
    rooms/          # Room CRUD operations
    join/           # Join room endpoint
    activities/     # Voting, messages, predictions
    reveal/         # Reveal trigger endpoint
  rooms/            # Room pages
    [code]/         # Dynamic room pages
  create/           # Create room page
  components/
    ui/             # Reusable UI components
    reveal/         # Reveal-specific components
lib/
  db.ts             # Database connection
  websocket.ts      # WebSocket server
  utils/            # Helper utilities
```

## License

Private project
