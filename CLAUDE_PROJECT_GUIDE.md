# Mythos Arena – Complete Project Guide for Claude

This document provides Claude with all necessary information to understand, review, and edit the Mythos Arena codebase.

---

## 📋 Project Overview

**Mythos Arena** is a mythology-themed mobile quiz game built with React Native and Expo. Players answer questions about 7 different mythologies (Greek, Norse, Egyptian, Tolkien, Celtic, Hindu, Japanese), earn XP, level up, and compete on leaderboards.

**Current Status:** Phase 3 Complete (Core UI & Navigation)
- ✅ Theme system with dark mode
- ✅ Home screen with game mode selection
- ✅ Pantheon selection with level-based unlocking
- ✅ Game context and state management
- ✅ 433 mythology quiz questions database
- ⏳ Next: Quiz gameplay engine (timer, scoring, lifelines)

---

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend:** React Native 0.81 + Expo 54
- **Language:** TypeScript 5.9
- **Styling:** NativeWind 4 (Tailwind CSS for React Native)
- **State Management:** React Context + useReducer
- **Testing:** Vitest
- **Backend:** Express.js + Drizzle ORM (optional, for future features)
- **Database:** PostgreSQL (optional, for future features)

### Project Structure

```
mythos-arena/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   └── index.tsx             # Home screen
│   ├── _layout.tsx               # Root layout with providers
│   ├── pantheon-selection.tsx    # Pantheon selection screen
│   └── oauth/callback.tsx        # OAuth callback
├── components/                   # Reusable UI components
│   ├── screen-container.tsx      # SafeArea wrapper for all screens
│   ├── pantheon-card.tsx         # Pantheon selection card
│   └── ui/                       # Icon mappings and UI utilities
├── lib/                          # Core logic and utilities
│   ├── types.ts                  # TypeScript interfaces and constants
│   ├── game-context.tsx          # Game state management
│   ├── theme-provider.tsx        # Theme context (light/dark)
│   ├── utils.ts                  # Utility functions (cn, etc.)
│   ├── trpc.ts                   # tRPC client setup
│   ├── _core/                    # Core runtime utilities
│   └── __tests__/                # Unit tests
├── hooks/                        # Custom React hooks
│   ├── use-colors.ts             # Get current theme colors
│   ├── use-color-scheme.ts       # Detect light/dark mode
│   └── use-auth.ts               # Authentication state
├── constants/                    # App constants
│   ├── theme.ts                  # Color palette exports
│   └── oauth.ts                  # OAuth configuration
├── server/                       # Backend (Express + Drizzle)
│   ├── _core/                    # Core server logic
│   ├── db.ts                     # Database connection
│   ├── routers.ts                # tRPC routers
│   └── storage.ts                # File storage
├── tailwind.config.js            # Tailwind configuration
├── theme.config.js               # Theme color definitions
├── app.config.ts                 # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── design.md                     # UI/UX design document
├── architecture.md               # Architecture documentation
├── questions_database.json       # 433 mythology quiz questions
├── todo.md                       # Project task tracking
└── iOS_BUILD_GUIDE.md            # iOS build instructions
```

---

## 🎮 Key Components & Files

### 1. **Game State Management** (`lib/game-context.tsx`)
- Manages global game state (current mode, selected pantheon, player level, etc.)
- Uses React Context + useReducer pattern
- Actions: `SELECT_MODE`, `SELECT_PANTHEON`, `LEVEL_UP`, `UNLOCK_PANTHEON`, etc.
- Persists to AsyncStorage for offline support

**Key State:**
```typescript
interface GameState {
  currentMode: GameMode | null;           // 'quick_play' | 'campaign' | 'daily_challenge' | 'endless' | 'versus'
  selectedPantheon: Pantheon | null;      // 'greek' | 'norse' | 'egyptian' | 'tolkien' | 'celtic' | 'hindu' | 'japanese'
  currentCampaignStage: number;           // 0-4 (5 stages per pantheon)
  playerLevel: number;                    // 1-50
  unlockedPantheons: Pantheon[];          // Array of unlocked pantheons
}
```

### 2. **Type Definitions** (`lib/types.ts`)
- All TypeScript interfaces and constants
- Pantheon metadata (names, colors, unlock levels, descriptions)
- Level titles mapping (Mortal → Allfather)
- XP calculation functions
- Question and Quiz interfaces

**Key Types:**
```typescript
type Pantheon = 'greek' | 'norse' | 'egyptian' | 'tolkien' | 'celtic' | 'hindu' | 'japanese';
type GameMode = 'quick_play' | 'campaign' | 'daily_challenge' | 'endless' | 'versus';

interface Question {
  id: string;
  pantheon: Pantheon;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  didYouKnow: string;
}
```

### 3. **Home Screen** (`app/(tabs)/index.tsx`)
- Main entry point showing player stats
- Game mode selection grid (Quick Play, Campaign, Endless, Versus, Daily Challenge)
- Quick links to Profile, Leaderboard, Settings

### 4. **Pantheon Selection** (`app/pantheon-selection.tsx`)
- Grid of 7 pantheons with lock/unlock status
- Locked pantheons show required level to unlock
- Tap to select, button to start campaign

### 5. **Theme System** (`theme.config.js` + `lib/_core/theme.ts`)
- Single source of truth for all colors
- Dark mode as default with light mode support
- Pantheon-specific accent colors
- Tailwind integration for className styling

**Color Tokens:**
- `background` – Screen background
- `foreground` – Primary text
- `muted` – Secondary text
- `primary` – Accent color (gold)
- `surface` – Card/elevated surfaces
- `border` – Dividers
- `success`, `warning`, `error` – Status colors

### 6. **Quiz Questions Database** (`questions_database.json`)
- 433 total questions across 7 pantheons
- Structure: `{ pantheon: { difficulty: [questions] } }`
- Each question includes: text, 4 options, correct answer index, "Did You Know?" fact

---

## 🎨 Theme & Styling

### Using Tailwind Classes
```tsx
<View className="flex-1 items-center justify-center p-4 bg-background">
  <Text className="text-2xl font-bold text-foreground">Hello</Text>
  <Text className="text-sm text-muted">Subtitle</Text>
</View>
```

### Using Theme Colors Programmatically
```tsx
import { useColors } from '@/hooks/use-colors';

export function MyComponent() {
  const colors = useColors();
  return <View style={{ backgroundColor: colors.background }} />;
}
```

### Available Color Tokens
All defined in `theme.config.js`:
- `primary` – #d4af37 (gold)
- `secondary` – #c0a080 (bronze)
- `background` – #0a0a0a (dark)
- `foreground` – #ffffff (white)
- `surface` – #1a1a1a (dark gray)
- `muted` – #888888 (gray)
- `border` – #333333 (dark gray)
- Plus pantheon-specific colors (greek_blue, norse_silver, etc.)

---

## 🧪 Testing

### Running Tests
```bash
pnpm test                    # Run all tests
pnpm test lib/__tests__/     # Run specific test suite
pnpm test --watch            # Watch mode
```

### Test Files
- `lib/__tests__/types.test.ts` – Type definitions and constants (14 tests)
- `lib/__tests__/game-context.test.ts` – Game reducer logic (9 tests)

### Writing New Tests
Use Vitest (similar to Jest):
```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

---

## 📱 Screen Navigation

### Current Screens
1. **Home** (`app/(tabs)/index.tsx`)
   - Shows player stats and game mode selection
   - Buttons for Quick Play, Campaign, Endless, Versus, Daily Challenge

2. **Pantheon Selection** (`app/pantheon-selection.tsx`)
   - Grid of 7 pantheons
   - Shows lock status and unlock requirements
   - Tap to select, button to start campaign

3. **Settings** (Coming soon)
4. **Profile** (Coming soon)
5. **Leaderboard** (Coming soon)

### Navigation Pattern
Uses Expo Router (file-based routing):
- `app/(tabs)/` – Tab bar screens
- `app/pantheon-selection.tsx` – Modal/stack screen
- Routing via `useRouter()` hook

---

## 🔄 Game Flow

### Quick Play Mode
1. User taps "Quick Play" on home screen
2. System selects 10 random questions from all pantheons
3. Quiz screen appears with timer and question
4. User answers, gets feedback, earns XP
5. After 10 questions, results screen shows XP earned and streak

### Campaign Mode
1. User selects pantheon from pantheon selection screen
2. Campaign has 5 stages + 1 boss round
3. Each stage = 5 questions from that pantheon
4. Completing stage unlocks next stage
5. Completing all stages unlocks next pantheon

### Daily Challenge
1. One unique 10-question quiz per day
2. Global leaderboard for that day
3. Resets at midnight UTC

### Endless Mode
1. Questions until player gets 3 wrong answers
2. Streak tracking and multiplier (3x, 5x, 10x)
3. XP bonus based on streak length

### Versus Mode (PvP)
1. Real-time 1v1 battles
2. Both players answer same questions
3. Fastest correct answer wins
4. First to 5 wins takes the match

---

## 💾 Data Models

### User Profile
```typescript
interface UserProfile {
  id: string;
  username: string;
  level: number;
  totalXP: number;
  unlockedPantheons: Pantheon[];
  achievements: Achievement[];
  avatarFrame: string;
  createdAt: Date;
}
```

### Quiz Round
```typescript
interface QuizRound {
  id: string;
  mode: GameMode;
  pantheon?: Pantheon;
  questions: Question[];
  answers: (0 | 1 | 2 | 3)[];
  score: number;
  xpEarned: number;
  streak: number;
  completedAt: Date;
}
```

### Leaderboard Entry
```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  totalXP: number;
  avatarFrame: string;
}
```

---

## 🚀 Development Workflow

### Starting Development
```bash
cd /home/ubuntu/mythos-arena
pnpm install          # Install dependencies (if needed)
pnpm dev              # Start dev server
```

### Testing on Device
1. Run `pnpm dev`
2. Open Expo Go on iPhone
3. Scan QR code from terminal
4. App loads instantly

### Making Changes
1. Edit files in `app/`, `components/`, `lib/`, etc.
2. Changes hot-reload automatically
3. Run tests: `pnpm test`
4. Check types: `pnpm check`

### Adding New Screens
1. Create file in `app/` directory (e.g., `app/quiz.tsx`)
2. Use `ScreenContainer` for SafeArea handling
3. Use `useRouter()` for navigation
4. Add route to `app/_layout.tsx` if needed

### Adding New Components
1. Create file in `components/` (e.g., `components/quiz-card.tsx`)
2. Use Tailwind classes for styling
3. Export from component file
4. Import and use in screens

---

## 🔧 Configuration Files

### `app.config.ts`
- App name: "Mythos Arena"
- Bundle ID: space.manus.mythos.arena.t20260413091632
- iOS deployment target: 15.1
- Android min SDK: 24
- Plugins: expo-router, expo-audio, expo-video, expo-splash-screen

### `theme.config.js`
- Color palette definitions
- Light and dark mode colors
- Pantheon-specific accent colors

### `tailwind.config.js`
- Tailwind configuration
- Custom color tokens
- NativeWind preset

### `tsconfig.json`
- TypeScript strict mode enabled
- Path aliases: `@/` = `./`
- React Native types

---

## 📦 Dependencies

### Key Packages
- `expo` – React Native framework
- `expo-router` – File-based routing
- `react-native` – Mobile framework
- `nativewind` – Tailwind CSS for React Native
- `react-native-reanimated` – Animations
- `react-native-gesture-handler` – Touch gestures
- `@tanstack/react-query` – Data fetching
- `@trpc/client` – Type-safe API client
- `vitest` – Testing framework

### Adding New Dependencies
```bash
pnpm add package-name
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/lib/types'"
**Solution:** Check that `tsconfig.json` has path alias `"@/*": ["./*"]`

### Issue: "Pressable onPress not firing"
**Solution:** Never use `className` on Pressable. Use `style` prop instead.

### Issue: "Text clipped at bottom"
**Solution:** Ensure `lineHeight > fontSize`. Use `leading-relaxed` class.

### Issue: "Content under notch on iPhone"
**Solution:** Always wrap screens with `ScreenContainer` component.

### Issue: "Dark mode colors not applying"
**Solution:** Use color tokens directly (e.g., `text-foreground`, `bg-background`). No `dark:` prefix needed.

---

## 📚 Next Steps for Development

### Phase 4: Quiz Gameplay Engine
- [ ] Build quiz screen with timer
- [ ] Implement 15-second countdown
- [ ] Create answer validation and feedback
- [ ] Add animated feedback (green/red flashes)
- [ ] Implement lifelines system

### Phase 5: Game Modes
- [ ] Implement Quick Play logic
- [ ] Implement Campaign progression
- [ ] Implement Daily Challenge
- [ ] Implement Endless mode
- [ ] Implement Versus (PvP)

### Phase 6: Progression System
- [ ] XP and leveling
- [ ] Achievements and badges
- [ ] Avatar frames
- [ ] Player profile screen

### Phase 7: Leaderboards
- [ ] Global leaderboard
- [ ] Daily challenge leaderboard
- [ ] Pantheon-specific leaderboards

### Phase 8: Firebase Integration
- [ ] User authentication
- [ ] Data persistence
- [ ] Real-time PvP sync
- [ ] Push notifications

---

## 🎯 Code Style & Conventions

### Component Structure
```tsx
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface MyComponentProps {
  title: string;
  onPress: () => void;
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  const colors = useColors();

  return (
    <View className="p-4 bg-surface rounded-lg">
      <Text className="text-lg font-bold text-foreground">{title}</Text>
    </View>
  );
}
```

### Naming Conventions
- Components: PascalCase (e.g., `MyComponent`)
- Files: kebab-case (e.g., `my-component.tsx`)
- Functions: camelCase (e.g., `myFunction()`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_LEVEL`)
- Types: PascalCase (e.g., `MyType`)

### Imports
```tsx
// Absolute imports (preferred)
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from '@/components/screen-container';

// Relative imports (for same directory)
import { helper } from './helper';
```

---

## 📖 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [NativeWind Documentation](https://www.nativewind.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vitest Documentation](https://vitest.dev)

---

## 🤝 How Claude Can Help

Claude can:
1. **Review Code** – Check for bugs, performance issues, best practices
2. **Add Features** – Implement new screens, components, or game modes
3. **Fix Bugs** – Debug issues and provide solutions
4. **Optimize** – Improve performance and code quality
5. **Explain** – Clarify architecture and design decisions
6. **Refactor** – Improve code structure and maintainability
7. **Write Tests** – Create unit and integration tests
8. **Document** – Add comments and documentation

---

## 📝 Questions for Claude?

When asking Claude for help, provide:
1. **What you want to do** (e.g., "Add a quiz timer screen")
2. **Which file to edit** (e.g., "Create `app/quiz.tsx`")
3. **Any specific requirements** (e.g., "15-second countdown, red flash on wrong answer")
4. **Error messages** (if debugging)

Claude will then provide complete, working code that fits the project's architecture and style.

---

**Last Updated:** April 14, 2026
**Project Version:** 2fb5599f (Phase 3 Complete)
