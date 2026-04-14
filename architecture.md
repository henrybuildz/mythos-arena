# Mythos Arena – Architecture & Data Models

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      React Native (Expo)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  UI Layer (Screens, Components, Navigation)             │   │
│  │  - Home, Quiz, Results, Profile, Leaderboard, Settings  │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │  State Management (Context + Reducer / Zustand)         │   │
│  │  - Auth state, Quiz state, Player progression           │   │
│  │  - Game mode state, Leaderboard cache                   │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │  Data Layer (Local + Remote)                            │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Local: AsyncStorage + SQLite (Offline Mode)        │ │   │
│  │  │ - Questions cache, Player profile, Scores          │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Remote: Firebase (Cloud Sync)                      │ │   │
│  │  │ - Auth, Firestore (profiles, scores)               │ │   │
│  │  │ - Realtime DB (PvP matchmaking)                    │ │   │
│  │  │ - Cloud Functions (daily challenges, leaderboards) │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services (Firebase)                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Auth         │ │ Firestore    │ │ Realtime DB  │             │
│  │ - Email      │ │ - Users      │ │ - PvP games  │             │
│  │ - Google     │ │ - Scores     │ │ - Matchmaking│             │
│  │ - Apple      │ │ - Profiles   │ │              │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Cloud Functions                                          │   │
│  │ - Daily challenge generation                            │   │
│  │ - Leaderboard computation                               │   │
│  │ - User stats aggregation                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Cloud Messaging (Push Notifications)                     │   │
│  │ - Daily challenge reminders                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### 1. User Profile

```typescript
interface UserProfile {
  id: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  avatar: string;                // Avatar frame ID
  level: number;                 // 1-50
  totalXP: number;
  currentXP: number;             // XP towards next level
  title: string;                 // e.g., "Demigod"
  unlockedPantheons: string[];   // ["greek", "norse", ...]
  unlockedAvatarFrames: string[];
  achievements: Achievement[];
  createdAt: timestamp;
  lastActiveAt: timestamp;
}
```

### 2. Question

```typescript
interface Question {
  id: string;
  pantheon: "greek" | "norse" | "egyptian" | "tolkien" | "celtic" | "hindu" | "japanese";
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  options: string[];             // 4 answers
  correctAnswerIndex: number;    // 0-3
  funFact: string;               // "Did You Know?" snippet
  tags: string[];                // e.g., ["gods", "heroes", "artifacts"]
  createdAt: timestamp;
}
```

### 3. Quiz Round

```typescript
interface QuizRound {
  id: string;
  userId: string;
  mode: "quick_play" | "campaign" | "daily_challenge" | "endless" | "versus";
  pantheon: string;
  questions: Question[];
  answers: {
    questionId: string;
    selectedAnswerIndex: number;
    isCorrect: boolean;
    timeToAnswer: number;        // milliseconds
  }[];
  streak: number;
  totalXPEarned: number;
  startedAt: timestamp;
  completedAt: timestamp;
  status: "in_progress" | "completed" | "abandoned";
}
```

### 4. Player Score

```typescript
interface PlayerScore {
  id: string;
  userId: string;
  roundId: string;
  mode: string;
  pantheon: string;
  score: number;
  xpEarned: number;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;              // percentage
  createdAt: timestamp;
}
```

### 5. Achievement

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;                  // URL or asset path
  unlockedAt: timestamp;
  condition: {
    type: "score" | "streak" | "pantheon_completion" | "level" | "mode";
    value: any;                  // e.g., { pantheon: "greek", percentage: 100 }
  };
}
```

### 6. Daily Challenge

```typescript
interface DailyChallenge {
  id: string;
  date: string;                  // YYYY-MM-DD
  questions: Question[];         // 10 unique questions
  leaderboard: {
    userId: string;
    displayName: string;
    score: number;
    rank: number;
  }[];
  createdAt: timestamp;
  expiresAt: timestamp;
}
```

### 7. PvP Match

```typescript
interface PvPMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  questions: Question[];         // 10 same questions
  player1Answers: Answer[];
  player2Answers: Answer[];
  player1Score: number;
  player2Score: number;
  winnerId: string;
  status: "waiting" | "in_progress" | "completed";
  createdAt: timestamp;
  completedAt: timestamp;
}
```

### 8. Leaderboard Entry

```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  level: number;
  totalScore: number;
  totalXP: number;
  winRate: number;               // percentage
  lastUpdated: timestamp;
}
```

---

## Database Schema (Firestore Collections)

```
firestore/
├── users/
│   └── {userId}/
│       ├── profile (UserProfile)
│       ├── stats (aggregated stats)
│       └── achievements (Achievement[])
├── questions/
│   └── {questionId} (Question)
├── rounds/
│   └── {roundId} (QuizRound)
├── scores/
│   └── {scoreId} (PlayerScore)
├── daily_challenges/
│   └── {date} (DailyChallenge)
├── pvp_matches/
│   └── {matchId} (PvPMatch)
├── leaderboards/
│   ├── global/
│   │   └── {entryId} (LeaderboardEntry)
│   ├── daily/
│   │   └── {date}/{entryId}
│   └── pantheon/
│       └── {pantheon}/{entryId}
└── achievements/
    └── {achievementId} (Achievement definition)
```

---

## Local Storage Schema (SQLite)

```sql
-- Users (cached from Firestore)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  displayName TEXT,
  level INTEGER,
  totalXP INTEGER,
  currentXP INTEGER,
  unlockedPantheons TEXT, -- JSON array
  lastSyncedAt TIMESTAMP
);

-- Questions (cached for offline)
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  pantheon TEXT,
  difficulty TEXT,
  questionText TEXT,
  options TEXT, -- JSON array
  correctAnswerIndex INTEGER,
  funFact TEXT,
  tags TEXT -- JSON array
);

-- Quiz Rounds (local tracking)
CREATE TABLE quiz_rounds (
  id TEXT PRIMARY KEY,
  userId TEXT,
  mode TEXT,
  pantheon TEXT,
  questionsJson TEXT, -- JSON array
  answersJson TEXT, -- JSON array
  streak INTEGER,
  totalXPEarned INTEGER,
  startedAt TIMESTAMP,
  completedAt TIMESTAMP,
  status TEXT,
  syncedToCloud BOOLEAN DEFAULT 0
);

-- Scores (local tracking)
CREATE TABLE scores (
  id TEXT PRIMARY KEY,
  userId TEXT,
  roundId TEXT,
  mode TEXT,
  pantheon TEXT,
  score INTEGER,
  xpEarned INTEGER,
  correctAnswers INTEGER,
  totalQuestions INTEGER,
  createdAt TIMESTAMP,
  syncedToCloud BOOLEAN DEFAULT 0
);
```

---

## State Management (Context + Reducer)

### Auth Context
```typescript
interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: UserProfile }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; payload: Partial<UserProfile> };
```

### Quiz Context
```typescript
interface QuizState {
  currentRound: QuizRound | null;
  currentQuestionIndex: number;
  streak: number;
  totalXP: number;
  timeRemaining: number;
  isAnswered: boolean;
  selectedAnswerIndex: number | null;
  feedback: "correct" | "wrong" | null;
}

type QuizAction =
  | { type: "START_ROUND"; payload: QuizRound }
  | { type: "SUBMIT_ANSWER"; payload: { answerIndex: number; timeToAnswer: number } }
  | { type: "NEXT_QUESTION" }
  | { type: "USE_LIFELINE"; payload: "50_50" | "skip" | "extra_time" }
  | { type: "END_ROUND" }
  | { type: "TICK_TIMER" };
```

### Game State Context
```typescript
interface GameState {
  currentMode: "quick_play" | "campaign" | "daily_challenge" | "endless" | "versus";
  selectedPantheon: string | null;
  currentCampaignStage: number;
  playerLevel: number;
  unlockedPantheons: string[];
}

type GameAction =
  | { type: "SELECT_MODE"; payload: string }
  | { type: "SELECT_PANTHEON"; payload: string }
  | { type: "ADVANCE_CAMPAIGN"; payload: number }
  | { type: "LEVEL_UP"; payload: number }
  | { type: "UNLOCK_PANTHEON"; payload: string };
```

---

## API Endpoints (Backend / Cloud Functions)

### Authentication
- `POST /auth/signup` – Create new user account
- `POST /auth/login` – Email/password login
- `POST /auth/google` – Google OAuth
- `POST /auth/apple` – Apple OAuth
- `POST /auth/logout` – Sign out

### User & Profile
- `GET /users/{userId}` – Fetch user profile
- `PUT /users/{userId}` – Update user profile
- `GET /users/{userId}/stats` – Fetch user stats
- `GET /users/{userId}/achievements` – Fetch achievements

### Questions
- `GET /questions?pantheon={pantheon}&difficulty={difficulty}&limit={limit}` – Fetch questions
- `GET /questions/daily-challenge` – Fetch today's daily challenge

### Scores & Leaderboards
- `POST /scores` – Submit quiz round score
- `GET /leaderboards/global?limit=100` – Global leaderboard
- `GET /leaderboards/daily?date={date}&limit=100` – Daily challenge leaderboard
- `GET /leaderboards/pantheon/{pantheon}?limit=100` – Pantheon-specific leaderboard
- `GET /leaderboards/user/{userId}` – User's leaderboard position

### PvP Matchmaking
- `POST /pvp/find-match` – Find opponent
- `GET /pvp/match/{matchId}` – Get match details
- `PUT /pvp/match/{matchId}/answer` – Submit answer in PvP
- `GET /pvp/match/{matchId}/result` – Get match result

### Notifications
- `POST /notifications/subscribe` – Subscribe to push notifications
- `POST /notifications/send-daily-challenge` – Send daily challenge reminder

---

## Offline Mode Strategy

1. **On App Launch:**
   - Check network connectivity
   - If offline, load questions from local SQLite cache
   - Display "Offline Mode" indicator

2. **During Quiz:**
   - All quiz data stored locally in SQLite
   - No network calls required
   - Scores and answers tracked locally

3. **On Sync (When Back Online):**
   - Sync all local quiz rounds to Firestore
   - Sync all scores to leaderboards
   - Fetch latest user profile and achievements
   - Update local cache with fresh data

4. **Conflict Resolution:**
   - Last-write-wins for user profile updates
   - Append-only for scores (no overwrites)
   - Local timestamp used for ordering

---

## Performance Considerations

- **Question Caching:** Pre-load 500 questions per pantheon on first app launch
- **Image Optimization:** Use WebP format, compress avatars to <50KB
- **List Virtualization:** Use FlatList for leaderboards (render only visible items)
- **Animation Performance:** Use `react-native-reanimated` for 60fps animations
- **Network Optimization:** Batch API requests, implement request debouncing
- **Memory Management:** Unload unused quiz rounds, clear old cache after 30 days

---

## Security Considerations

- **Firebase Security Rules:** Restrict user access to own profile and public leaderboards
- **Authentication:** Use Firebase Auth with secure token storage
- **Data Validation:** Validate all quiz answers server-side (prevent cheating)
- **Rate Limiting:** Limit API requests per user per minute
- **Encryption:** Encrypt sensitive data (passwords, tokens) at rest
- **HTTPS Only:** All network traffic encrypted in transit

