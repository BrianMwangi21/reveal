# Reveal Agent Guidelines

## Development Principles

### Component Design
- **Single Responsibility**: Each component should solve one specific problem
- **Loose Coupling**: Avoid tight coupling between components - use props and callbacks for communication
- **High Cohesion**: Group related functionality together
- **Reusability**: Create reusable UI components (buttons, inputs, cards) in app/components/ui/

### Function Design
- **Pure Functions**: Where possible, write pure functions (no side effects)
- **Small Functions**: Keep functions focused and concise - if a function does more than one thing, split it
- **Clear Names**: Use descriptive names that explain what the function does
- **Type Safety**: Leverage TypeScript properly - define clear interfaces and types

### File Organization
```
app/
  components/
    ui/           # Reusable UI components (Button, Input, Card, Countdown)
    reveal/       # Reveal-specific components (GuestList, MessageBoard, Voting)
  api/
    rooms/        # Room CRUD operations
    activities/   # Voting, messages, predictions endpoints
    join/         # Guest join endpoint

lib/
  models/        # MongoDB schemas (Room, Guest, Poll, Prediction, Message)
  websocket.ts   # WebSocket server/handlers
  db.ts          # Database connection
  utils/         # Helper utilities
```

### Code Style
- Follow existing patterns in the codebase
- Check package.json for linting/formatting tools before creating new rules
- Run lint/typecheck after completing tasks
- Avoid over-engineering - keep it simple (vibe-coded)

### API Design
- RESTful API routes in app/api/
- Clear error messages and proper HTTP status codes
- Input validation on all endpoints
- Structured responses (success/error objects)
- MongoDB for all data persistence

### WebSocket Design
- Use event-based communication
- Define clear event schemas
- Handle reconnections gracefully
- Broadcast to room, not global
- Consider Vercel limitations (may use Pusher or SSE)

### Real-Time Considerations
- Vercel doesn't support persistent WebSockets
- Consider using Pusher or Server-Sent Events for real-time updates
- Fallback to polling if needed for MVP
- Test with multiple simulated clients

### Testing Strategy
- Check if tests exist in the project before writing new test code
- If test framework is not set up, ask the user for the test command
- Run tests before committing

### Phase Workflow
1. Read the current phase requirements in ROADMAP.md
2. Implement deliverables listed in the phase
3. Verify Definition of Done is met
4. Run linting/typechecking if available
5. Create/update sessions/[XX].md with completed work

### Important Notes
- Always check existing code structure before creating new files
- Use Next.js conventions (App Router, Server Components where appropriate)
- Leverage TypeScript for type safety
- Keep UI responsive and accessible
- Don't add comments unless explicitly asked
- Room codes must be unique - implement retry logic for collisions

### MongoDB Schema Guidelines
- Use Mongoose for schema definitions in `lib/models/`
- Add timestamps (createdAt, updatedAt) to all models
- Index fields used for queries (roomCode, room, guest)
- Use enum types for known values (revealType, voteOption)
- Add virtual methods for computed properties

### Real-Time Event Naming
Use clear, consistent event names:
- `guest_joined` - New guest joins room
- `guest_left` - Guest disconnects
- `vote_cast` - Guest votes in poll
- `message_posted` - Guest posts message
- `prediction_made` - Guest submits prediction
- `countdown_update` - Timer tick (optional, can be client-side)
- `reveal_triggered` - Reveal happens
- `activity_locked` - Activity locked after reveal

### Room Code Generation
- Generate 6-digit alphanumeric codes (A-Z, 0-9, no ambiguous chars like I/1, O/0)
- Check for collisions in database
- Retry with new code if collision occurs (max 5 retries)
- Make codes case-insensitive for UX

### Error Handling
- Validate all inputs (code format, reveal time in future, nickname length)
- Return user-friendly error messages
- Use appropriate HTTP status codes (400 for bad input, 404 for not found, 500 for server errors)
- Log errors for debugging (but don't expose to users)

### UI/UX Guidelines
- Celebratory, warm color palette (gold, pink, blue, purple)
- Festive typography for headers
- Smooth animations and transitions
- Large, prominent countdown timer
- Mobile-first responsive design
- Clear CTAs (Create Room, Join Room, Vote, etc.)

### Session Documentation
Each coding session should create/update `sessions/[XX].md` with:
- Session number and date
- Summary of work completed
- Tech decisions made
- Files created/modified
- Next steps
- Any issues or notes
