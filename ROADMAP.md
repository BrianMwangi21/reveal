# Reveal Roadmap

## Overview

This roadmap breaks down Reveal into modular, achievable phases. Each phase builds on the previous one, allowing for iterative development and testing.

---

## Phase 1: Room Creation & Management

### Goal
Allow hosts to create reveal event rooms with custom details.

### Architecture Notes
- **Main Entry**: `app/create/page.tsx` for room creation form
- **Room Data Structure**: MongoDB schema for rooms with fields: name, code, revealTime, revealType, createdAt
- **Unique Room Codes**: Generate 6-digit alphanumeric codes with collision handling
- **Reusable Components**: Input forms, date/time pickers in `app/components/ui/`

### Tasks
- [x] Design database schema for rooms collection
- [x] Create room creation form UI
- [x] Implement unique 6-digit code generator with retry logic
- [x] Add room creation API endpoint (`POST /api/rooms`)
- [x] Validate room data (name length, future reveal time, valid reveal type)
- [x] Display room code and share options after creation
- [x] Create room details page at `/rooms/[code]`

**Status**: ✅ Completed - January 2, 2026

### Reveal Types
- Gender Reveal (Boy/Girl/Other)
- Baby Reveal (Name reveal, due date reveal)
- Birthday Surprise (Age reveal, gift reveal)
- Anniversary Reveal (Years together reveal)
- Custom (Host-defined options)

### Deliverables
- Room schema/model in `lib/models/Room.ts`
- Room creation page at `app/create/page.tsx`
- Room creation API at `app/api/rooms/route.ts`
- Room details page at `app/rooms/[code]/page.tsx`

### Definition of Done
- [x] Hosts can create rooms with name, reveal time, and type
- [x] Unique 6-digit codes are generated and stored
- [x] Room details page displays all room information
- [x] Validation prevents invalid rooms (past dates, empty names)

---

## Phase 2: Guest Join System

### Goal
Allow guests to join rooms using the room code and register their nickname.

### Architecture Notes
- **Join Flow**: Homepage with code input → Validate room → Nickname prompt → Room entry
- **Guest Management**: Track guests in MongoDB (nickname, joinTime, roomCode)
- **Session Handling**: Simple token-based session or localStorage for guest persistence
- **Duplicate Prevention**: Prevent duplicate nicknames in same room

### Tasks
- [x] Create homepage with room code input
- [x] Implement room validation API (`GET /api/rooms/[code]`)
- [x] Design nickname entry form
- [x] Add guest registration API (`POST /api/rooms/[code]/join`)
- [x] Display guest list in room
- [x] Handle room not found / expired room cases
- [x] Add guest count indicator
- [x] Prevent duplicate nicknames in same room

### Deliverables
- Homepage at `app/page.tsx`
- Room validation API at `app/api/rooms/[code]/route.ts`
- Guest join API at `app/api/rooms/[code]/join/route.ts`
- Guest schema/model in `lib/models/Guest.ts`

### Definition of Done
- [x] Guests can enter room code to find room
- [x] Nickname registration works with duplicate prevention
- [x] Guest list displays in room
- [x] Error handling for invalid codes

**Status**: ✅ Completed - January 2, 2026

---

## Phase 3: Pre-Reveal Activities

### Goal
Enable interactive activities for guests before the reveal happens.

### Architecture Notes
- **Activity Types**: Multiple activity types with separate MongoDB collections
- **Voting System**: Polls where guests can vote on reveal outcome
- **Prediction Pools**: Guests submit predictions with optional confidence levels
- **Message Board**: Guests leave messages, memories, well-wishes
- **Emoji Reactions**: Quick reactions to messages

### Activity Types

#### 1. Voting Polls
- Host creates poll options (e.g., "Boy", "Girl", "Twins!")
- Guests vote for one option
- Live results shown (vote counts, percentages)
- Allow changing vote before reveal

#### 2. Prediction Pools
- Guests submit detailed predictions
- Optional: Add confidence level (0-100%)
- Optional: Add reasoning/explanation
- Reveal time: Show who guessed correctly

#### 3. Message Board
- Guests leave messages for the hosts
- Messages can include emoji reactions
- Sort by newest or most reacted
- Host can pin important messages

#### 4. Fun Features
- "Spin the Wheel" - random prediction generator
- "Emoji Battle" - most-used emoji wins
- "Memory Wall" - shared memories/photos (optional)

### Tasks
- [x] Design activity schemas (Bet, ClosestGuess, Message)
- [x] Create activity management API endpoints
- [x] Build Bet Your Points component (with live results display)
- [x] Build Closest Guess component
- [x] Build Message Board component with reactions
- [x] Add activity creation UI for hosts
- [x] Implement activity deletion for hosts
- [x] Add current user nickname display in room header
- [x] Highlight current user in GuestList component
- [x] Mobile-first responsive design for all components

### Deliverables
- Activity models in `lib/models/` (Activity, Bet, ClosestGuess, Message)
- Activity APIs in `app/api/activities/`
- Activity components in `app/components/reveal/` (Bet, ClosestGuess, MessageBoard, ActivityCreator)
- Activity management page for hosts

### Definition of Done
- [x] Hosts can create activities (bet, closest guess, message board)
- [x] Guests can participate in all activities
- [x] Current user is highlighted in UI
- [x] Activities can be deleted by hosts
- [x] Mobile-first responsive design implemented
- [ ] Real-time updates (Phase 4)

**Status**: ✅ Completed - January 3, 2026

---

## Phase 4: Real-Time WebSocket Integration

### Goal
Enable real-time synchronization across all connected guests.

### Architecture Notes
- **WebSocket Server**: Use a library like `socket.io`, `ws`, or Next.js Server Actions
- **Connection Handling**: Track active connections per room
- **Event Types**: guest_joined, vote_cast, message_posted, reveal_triggered, countdown_update
- **Reconnection Logic**: Handle disconnections gracefully
- **Room Broadcasting**: Send updates to all guests in a specific room

### Tasks
- [ ] Set up WebSocket server (consider `socket.io` or simple Server-Sent Events)
- [ ] Design event schema for real-time updates
- [ ] Implement room-based connection management
- [ ] Add guest join/leave broadcasts
- [ ] Add activity update broadcasts (votes, messages, predictions)
- [ ] Implement countdown timer synchronization
- [ ] Handle WebSocket reconnections
- [ ] Add connection status indicator in UI

### Event Types
```typescript
{
  type: "guest_joined" | "guest_left" | "vote_cast" | "message_posted" | "countdown_update" | "reveal_triggered",
  data: any,
  timestamp: number
}
```

### Tech Notes
- **Option A**: Socket.io (full-featured, built-in rooms, fallback to polling)
- **Option B**: Native WebSocket (lightweight, more control)
- **Option C**: Server-Sent Events (one-way, simpler)
- **Consideration**: Vercel doesn't support persistent WebSocket connections natively - may need external service or Pusher

### Deliverables
- WebSocket server in `lib/websocket.ts`
- WebSocket API routes
- Real-time hooks/components
- Connection status UI component

### Definition of Done
- Guests see real-time updates when others join/leave
- Votes and messages appear instantly
- Countdown timer stays synchronized
- Connection status visible to users

---

## Phase 5: Countdown Timer & Reveal Logic

### Goal
Build the dramatic countdown and simultaneous reveal experience.

### Architecture Notes
- **Timer State**: Store timer state in MongoDB with lock after reveal
- **Countdown Display**: Large, prominent countdown (days, hours, minutes, seconds)
- **Trigger Mechanism**: Host can trigger reveal early (emergency) or auto-trigger at scheduled time
- **Reveal Display**: Show reveal content to all guests simultaneously
- **Reveal Types**: Different reveal formats based on room type

### Tasks
- [ ] Implement countdown timer component with animations
- [ ] Add timer synchronization across all clients
- [ ] Create reveal trigger API (`POST /api/rooms/[code]/reveal`)
- [ ] Design reveal display component for different reveal types
- [ ] Add "Early Reveal" button for hosts (optional)
- [ ] Implement reveal content storage (images, text, videos)
- [ ] Add confetti/celebration animation on reveal
- [ ] Lock all activities after reveal

### Reveal Formats by Type

#### Gender Reveal
- Pink vs. Blue reveal animation
- Custom colors for non-binary
- Pop confetti balloons (pink/blue/other)
- "It's a [Boy/Girl/...]!" message

#### Baby Reveal (Name)
- Animated name reveal
- Meaning of name
- Font/color customization

#### Birthday Surprise
- "You're [Age] years old!"
- Photo slideshow
- Video message display

#### Custom Reveal
- Host uploads reveal content (image, text, video)
- Custom animation options
- Host-written reveal message

### Deliverables
- Countdown component in `app/components/reveal/Countdown.tsx`
- Reveal trigger API at `app/api/rooms/[code]/reveal/route.ts`
- Reveal display component at `app/components/reveal/RevealDisplay.tsx`
- Celebration animation utilities

### Definition of Done
- Countdown displays correctly and syncs across clients
- Reveal triggers simultaneously for all guests
- Reveal content displays beautifully
- Activities lock after reveal
- Confetti/celebration plays on reveal

---

## Phase 6: UI/UX Design & Theming

### Goal
Create a beautiful, celebratory UI that builds anticipation.

### Architecture Notes
- **Color Palette**: Celebratory, warm colors (gold, pink, blue, purple)
- **Typography**: Festive fonts for headers, clean fonts for UI
- **Animations**: Smooth transitions, countdown animations, reveal celebrations
- **Responsive Design**: Mobile-first, works on all devices

### Tasks
- [ ] Design color palette system (multiple themes for different reveal types)
- [ ] Create typography system (festive headers, readable body)
- [ ] Build reusable UI components (buttons, cards, inputs)
- [ ] Add smooth page transitions
- [ ] Design countdown timer with animations
- [ ] Create reveal celebration animations (confetti, balloons, sparkles)
- [ ] Implement dark mode support
- [ ] Add loading states and skeletons
- [ ] Make fully responsive

### Theme Options
- **Default**: Gold & white (universal celebration)
- **Gender Reveal**: Pink & Blue gradients
- **Baby Reveal**: Soft pastels (mint, lavender, peach)
- **Birthday**: Rainbow & confetti theme
- **Elegant**: Navy & gold (formal events)
- **Custom**: Host picks theme colors

### Deliverables
- Updated `app/globals.css` with theme system
- UI component library in `app/components/ui/`
- Theme switcher component
- Animation utilities

### Definition of Done
- Beautiful, consistent design throughout app
- Multiple theme options available
- Smooth animations and transitions
- Fully responsive on mobile/tablet/desktop
- Accessibility support (keyboard nav, screen readers)

---

## Phase 7: Post-Reveal Features

### Goal
Allow guests to relive the reveal moment and share memories.

### Architecture Notes
- **Replay Mode**: Re-watch the reveal animation
- **Results Display**: Show voting/prediction winners
- **Share Features**: Share room results to social media
- **Memory Export**: Download messages and photos
- **Room Archive**: Keep room accessible for 7-30 days

### Tasks
- [ ] Add "Replay Reveal" button
- [ ] Display voting results and prediction winners
- [ ] Show guest statistics (who participated, most active)
- [ ] Implement share buttons (Twitter, Facebook, copy link)
- [ ] Add "Download Memories" (PDF of messages)
- [ ] Create room archive page
- [ ] Add room expiration/deletion job
- [ ] Option to "Save to My Reveals" (if accounts added later)

### Deliverables
- Replay component
- Results summary component
- Share buttons component
- Memory export utility
- Room archive logic

### Definition of Done
- Guests can replay the reveal animation
- Voting and prediction results are clear
- Sharing works to social platforms
- Memories can be downloaded
- Rooms expire after defined period

---

## Phase 8: Host Dashboard & Analytics

### Goal
Give hosts tools to manage their reveal events.

### Architecture Notes
- **Dashboard Page**: `/dashboard` for host to see all their rooms
- **Analytics**: Guest count, participation rates, peak activity times
- **Settings**: Edit room details, extend reveal time, add activities
- **Notifications**: Email guests before reveal (optional, future)

### Tasks
- [ ] Create host dashboard page
- [ ] Display list of host's rooms with status (upcoming, active, revealed, archived)
- [ ] Add analytics cards (guest count, activity participation)
- [ ] Build room settings modal
- [ ] Implement "Extend Time" feature
- [ ] Add "Emergency Reveal" button
- [ ] Room search and filtering

### Deliverables
- Dashboard page at `app/dashboard/page.tsx`
- Room settings components
- Analytics cards
- Room search/filter utilities

### Definition of Done
- Hosts can see all their rooms
- Analytics display meaningful insights
- Room settings allow modifications
- Emergency reveal works

---

## Future Enhancements (Post-MVP)

- [ ] User authentication and accounts (save multiple rooms)
- [ ] Email notifications for guests
- [ ] Video/photo uploads for messages
- [ ] Multi-language support
- [ ] Custom reveal animations
- [ ] Room templates (pre-built setups)
- [ ] Integration with streaming platforms (Twitch, YouTube)
- [ ] Mobile app (React Native)

---

## Development Notes

### MongoDB Atlas Setup
1. Create free account at mongodb.com
2. Create cluster (M0 free tier)
3. Create database `reveal` with collections:
   - rooms
   - guests
   - polls
   - predictions
   - messages
4. Create database user and whitelist IP (0.0.0.0 for Vercel)
5. Add connection string to `.env.local`

### WebSocket Setup (Vercel Considerations)
Vercel doesn't support persistent WebSocket connections. Options:
1. **Pusher**: Real-time service with generous free tier
2. **Socket.io + External Server**: Host on separate VPS
3. **Server-Sent Events (SSE)**: One-way updates from server
4. **Polling**: Fallback method for simplicity

### Deployment
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables (MONGODB_URI, etc.)
4. Deploy

---

*Last updated: January 2, 2026*
