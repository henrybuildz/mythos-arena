# Quick Start Guide for Claude – Mythos Arena

## 🎯 What is Mythos Arena?

A React Native mobile quiz game where players answer mythology questions, earn XP, level up, and compete on leaderboards.

**Current Status:** Phase 3 Complete
- ✅ Home screen with 5 game modes
- ✅ Pantheon selection (7 mythologies)
- ✅ Game state management
- ✅ 433 quiz questions
- ⏳ Next: Quiz gameplay engine

---

## 📂 Project Structure (Key Files)

```
app/
  (tabs)/index.tsx          ← Home screen (game mode selection)
  pantheon-selection.tsx    ← Pantheon grid with lock/unlock
  _layout.tsx               ← Root layout with providers

lib/
  types.ts                  ← All TypeScript interfaces & constants
  game-context.tsx          ← Global game state (Context + useReducer)
  theme-provider.tsx        ← Dark/light mode toggle

components/
  pantheon-card.tsx         ← Pantheon selection card
  screen-container.tsx      ← SafeArea wrapper (use on all screens)

theme.config.js             ← Color palette (single source of truth)
tailwind.config.js          ← Tailwind configuration
app.config.ts               ← Expo configuration

questions_database.json     ← 433 quiz questions (7 pantheons)
CLAUDE_PROJECT_GUIDE.md     ← Detailed architecture & conventions
COMPLETE_SOURCE_CODE.md     ← All source code in one file
```

---

## 🎮 Game Modes

| Mode | Description |
|------|-------------|
| **Quick Play** | 10 random questions from all pantheons |
| **Campaign** | 5 stages per pantheon (25 questions total) |
| **Daily Challenge** | Unique 10 questions daily, global leaderboard |
| **Endless** | Questions until 3 wrong, streak tracking |
| **Versus** | 1v1 real-time PvP battles |

---

## 🏗️ Architecture

### State Management
```typescript
// Global game state (in lib/game-context.tsx)
interface GameState {
  currentMode: GameMode | null;
  selectedPantheon: Pantheon | null;
  currentCampaignStage: number;
  playerLevel: number;
  unlockedPantheons: Pantheon[];
}

// Access anywhere:
const { state, selectMode, selectPantheon, levelUp } = useGame();
```

### Pantheons (7 Total)
- **Greek** – Unlocked at Level 1
- **Norse** – Unlocked at Level 5
- **Egyptian** – Unlocked at Level 10
- **Tolkien** – Unlocked at Level 15
- **Celtic** – Unlocked at Level 20
- **Hindu** – Unlocked at Level 25
- **Japanese** – Unlocked at Level 30

### Colors (Theme System)
```javascript
// All colors defined in theme.config.js
primary: '#d4af37'        // Gold
secondary: '#c0a080'      // Bronze
background: '#0a0a0a'     // Dark
foreground: '#ffffff'     // White
surface: '#1a1a1a'        // Dark gray
```

---

## 💻 Tech Stack

- **React Native 0.81** + **Expo 54**
- **TypeScript 5.9**
- **NativeWind 4** (Tailwind CSS for React Native)
- **React Context + useReducer** (state management)
- **Vitest** (testing)
- **Express.js + Drizzle** (backend, optional)

---

## 🎨 Styling Guide

### Using Tailwind Classes
```tsx
<View className="flex-1 items-center justify-center p-4 bg-background">
  <Text className="text-2xl font-bold text-foreground">Title</Text>
  <Text className="text-sm text-muted">Subtitle</Text>
</View>
```

### Key Color Tokens
- `bg-background` – Screen background
- `text-foreground` – Primary text
- `text-muted` – Secondary text
- `bg-primary` – Accent (gold)
- `bg-surface` – Cards
- `border-border` – Dividers

### Important: No `className` on Pressable!
```tsx
// ❌ WRONG
<Pressable className="p-4">

// ✅ CORRECT
<Pressable style={{ padding: 16 }} onPress={...}>
```

---

## 📱 Screen Template

Always use `ScreenContainer` for SafeArea handling:

```tsx
import { ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

export default function MyScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="p-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <Text className="text-2xl font-bold text-foreground">Title</Text>
          {/* Your content here */}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
```

---

## 🧪 Testing

### Run Tests
```bash
pnpm test                    # All tests
pnpm test lib/__tests__/     # Specific suite
pnpm test --watch            # Watch mode
```

### Test Example
```typescript
import { describe, it, expect } from 'vitest';

describe('MyFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

---

## 🚀 Common Tasks

### Add a New Screen
1. Create file: `app/my-screen.tsx`
2. Use `ScreenContainer` for layout
3. Add route to `app/_layout.tsx` if needed
4. Use `useRouter()` for navigation

### Add a New Component
1. Create file: `components/my-component.tsx`
2. Use Tailwind classes for styling
3. Export from file
4. Import and use in screens

### Add Game Logic
1. Edit `lib/game-context.tsx` to add state/actions
2. Update `lib/types.ts` if adding new types
3. Use `useGame()` hook in screens
4. Write tests in `lib/__tests__/`

### Update Colors
1. Edit `theme.config.js` (single source of truth)
2. Use color tokens in Tailwind classes
3. Access colors in code: `const colors = useColors()`

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `CLAUDE_PROJECT_GUIDE.md` | Detailed architecture, conventions, data models |
| `COMPLETE_SOURCE_CODE.md` | All source code in one file |
| `architecture.md` | System design, Firebase schema, data flow |
| `design.md` | UI/UX design, screen list, user flows |
| `iOS_BUILD_GUIDE.md` | How to build and deploy on iOS |
| `todo.md` | Project task tracking |

---

## 🔧 Key Hooks

### `useGame()`
Access global game state:
```tsx
const { state, selectMode, selectPantheon, levelUp, unlockPantheon } = useGame();
```

### `useColors()`
Get current theme colors:
```tsx
const colors = useColors();
// colors.background, colors.foreground, colors.primary, etc.
```

### `useRouter()`
Navigate between screens:
```tsx
const router = useRouter();
router.push('/pantheon-selection');
```

---

## 🐛 Common Pitfalls

| Issue | Solution |
|-------|----------|
| Text clipped at bottom | Use `leading-relaxed` or `leading-loose` |
| Content under notch | Always use `ScreenContainer` |
| Pressable not responding | Don't use `className`, use `style` prop |
| Dark mode colors wrong | Use color tokens directly, no `dark:` prefix |
| State not persisting | Call `AsyncStorage.setItem()` in reducer |
| Component not re-rendering | Check selector returns stable reference |

---

## 📋 Next Phase (Phase 4): Quiz Gameplay Engine

What needs to be built:
1. **Quiz Screen** – Display question, 4 answer buttons, timer
2. **15-Second Timer** – Countdown with visual ring, color changes
3. **Answer Feedback** – Green flash for correct, red for wrong
4. **Lifelines** – 50/50, Skip, Extra Time buttons
5. **Sound Effects** – Correct chime, wrong buzz, timer alert
6. **Results Screen** – Show XP earned, streak, "Did You Know?" fact

---

## 🤝 How to Ask Claude for Help

**Good Request:**
> "Add a quiz screen at `app/quiz.tsx` with a 15-second countdown timer, 4 multiple-choice buttons, and green/red feedback animations for correct/wrong answers."

**Include:**
- What file to create/edit
- What component/feature to build
- Any specific requirements or styling
- Error messages (if debugging)

**Claude will provide:**
- Complete, working code
- Proper TypeScript types
- Tailwind styling
- Integration with GameContext
- Unit tests

---

## 📞 Quick Reference

| Need | Command |
|------|---------|
| Start dev server | `pnpm dev` |
| Run tests | `pnpm test` |
| Check types | `pnpm check` |
| Format code | `pnpm format` |
| Lint code | `pnpm lint` |
| Install dependency | `pnpm add package-name` |

---

## 📖 Key Files to Read First

1. **`CLAUDE_PROJECT_GUIDE.md`** – Full architecture & conventions
2. **`lib/types.ts`** – All TypeScript interfaces
3. **`lib/game-context.tsx`** – State management pattern
4. **`app/(tabs)/index.tsx`** – Home screen example
5. **`components/screen-container.tsx`** – SafeArea wrapper

---

**Ready to code!** 🚀

Ask Claude to:
- Review existing code
- Add new features
- Fix bugs
- Explain architecture
- Write tests
- Optimize performance

Claude has all the context needed to understand and edit the project effectively.
