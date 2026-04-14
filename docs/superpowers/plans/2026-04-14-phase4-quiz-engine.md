# Phase 4: Quiz Gameplay Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully playable quiz game — quiz screen with timer, answer feedback, lifelines, and a results screen — wired into all game modes (Quick Play, Campaign, Endless, Daily Challenge). Versus mode shows "Coming Soon". Player XP/level persists across sessions via AsyncStorage.

**Architecture:** A `QuizProvider` wraps the app and holds quiz session state (`QuizState` from `lib/types.ts`). A pure `quiz-engine.ts` handles question loading/transformation, XP math, and lifeline logic. Two new screens (`app/quiz.tsx`, `app/results.tsx`) handle gameplay and summary. Navigation passes `mode`, `pantheon`, and `stage` as route params.

**Tech Stack:** React Native 0.81, Expo Router v6, NativeWind v4, React Context + useReducer, AsyncStorage, react-native-svg (timer ring), Vitest (unit tests)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/quiz-engine.ts` | Create | Pure fns: load/transform questions, XP calc, lifelines, daily seed |
| `lib/quiz-context.tsx` | Create | QuizState useReducer + QuizProvider + useQuiz hook |
| `lib/storage.ts` | Create | AsyncStorage read/write for player progress |
| `app/quiz.tsx` | Create | Quiz gameplay screen (timer, questions, answers, lifelines) |
| `app/results.tsx` | Create | Post-quiz results screen (score, XP, fun fact) |
| `app/_layout.tsx` | Modify | Add `quiz` and `results` Stack.Screens; wrap with QuizProvider |
| `app/(tabs)/index.tsx` | Modify | Wire all mode buttons to navigate to quiz or pantheon-selection |
| `app/pantheon-selection.tsx` | Modify | Wire "Start Campaign" to navigate to quiz with params |
| `lib/game-context.tsx` | Modify | Add `ADD_XP` action + AsyncStorage load on mount |
| `lib/__tests__/quiz-engine.test.ts` | Create | Unit tests for pure quiz-engine functions |
| `lib/__tests__/quiz-context.test.ts` | Create | Unit tests for quiz reducer |

---

## Task 1: Quiz Engine (pure functions)

**Files:**
- Create: `lib/quiz-engine.ts`
- Create: `lib/__tests__/quiz-engine.test.ts`

The questions database (`questions_database.json`) uses a different schema than `lib/types.ts`. This task transforms DB records into `Question` objects and provides all pure logic the quiz needs.

Database record shape:
```json
{ "difficulty": "easy", "question": "...", "options": [...], "correct": 0, "fact": "..." }
```

Target `Question` type:
```typescript
{ id, pantheon, difficulty, question, options, correctAnswerIndex, funFact, tags }
```

- [ ] **Step 1: Write failing tests**

Create `lib/__tests__/quiz-engine.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  loadQuestionsForMode,
  calculateXP,
  applyFiftyFifty,
  getDailyQuestions,
  shuffleArray,
} from "../quiz-engine";
import type { Question, GameMode, Pantheon } from "../types";

describe("shuffleArray", () => {
  it("returns same elements in different order", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffleArray([...arr]);
    expect(shuffled).toHaveLength(arr.length);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it("does not mutate the original array", () => {
    const arr = [1, 2, 3];
    const original = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(original);
  });
});

describe("loadQuestionsForMode", () => {
  it("returns 10 questions for quick_play", () => {
    const questions = loadQuestionsForMode("quick_play");
    expect(questions).toHaveLength(10);
  });

  it("returns questions with correct shape", () => {
    const [q] = loadQuestionsForMode("quick_play");
    expect(q).toHaveProperty("id");
    expect(q).toHaveProperty("pantheon");
    expect(q).toHaveProperty("difficulty");
    expect(q).toHaveProperty("question");
    expect(q.options).toHaveLength(4);
    expect(typeof q.correctAnswerIndex).toBe("number");
    expect(q).toHaveProperty("funFact");
  });

  it("returns 10 questions for endless mode", () => {
    const questions = loadQuestionsForMode("endless");
    expect(questions).toHaveLength(10);
  });

  it("returns pantheon-specific questions for campaign", () => {
    const questions = loadQuestionsForMode("campaign", "greek");
    expect(questions.every((q) => q.pantheon === "greek")).toBe(true);
  });

  it("returns 10 questions for daily_challenge (same seed each call)", () => {
    const q1 = loadQuestionsForMode("daily_challenge");
    const q2 = loadQuestionsForMode("daily_challenge");
    expect(q1.map((q) => q.id)).toEqual(q2.map((q) => q.id));
  });
});

describe("calculateXP", () => {
  it("returns 0 for wrong answers", () => {
    expect(calculateXP(false, 10, 0, "easy")).toBe(0);
  });

  it("returns base XP for correct easy answer with no time bonus", () => {
    const xp = calculateXP(true, 0, 0, "easy");
    expect(xp).toBe(100);
  });

  it("applies time bonus for fast answers", () => {
    const slow = calculateXP(true, 1, 0, "easy");
    const fast = calculateXP(true, 14, 0, "easy");
    expect(fast).toBeGreaterThan(slow);
  });

  it("applies streak multiplier at 3+ streak", () => {
    const noStreak = calculateXP(true, 10, 0, "easy");
    const withStreak = calculateXP(true, 10, 3, "easy");
    expect(withStreak).toBeGreaterThan(noStreak);
  });

  it("applies difficulty multiplier for hard", () => {
    const easy = calculateXP(true, 10, 0, "easy");
    const hard = calculateXP(true, 10, 0, "hard");
    expect(hard).toBeGreaterThan(easy);
  });
});

describe("applyFiftyFifty", () => {
  it("returns exactly 2 hidden indices", () => {
    const q: Question = {
      id: "test-1",
      pantheon: "greek",
      difficulty: "easy",
      question: "Q?",
      options: ["A", "B", "C", "D"],
      correctAnswerIndex: 0,
      funFact: "Fact",
      tags: [],
    };
    const hidden = applyFiftyFifty(q);
    expect(hidden).toHaveLength(2);
  });

  it("never hides the correct answer", () => {
    const q: Question = {
      id: "test-2",
      pantheon: "greek",
      difficulty: "easy",
      question: "Q?",
      options: ["A", "B", "C", "D"],
      correctAnswerIndex: 2,
      funFact: "Fact",
      tags: [],
    };
    const hidden = applyFiftyFifty(q);
    expect(hidden).not.toContain(2);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd /Users/babun/Downloads/mythos-arena && pnpm test lib/__tests__/quiz-engine.test.ts
```
Expected: FAIL — "Cannot find module '../quiz-engine'"

- [ ] **Step 3: Implement `lib/quiz-engine.ts`**

Create `lib/quiz-engine.ts`:

```typescript
import questionsDb from "@/questions_database.json";
import type { Question, GameMode, Pantheon, Difficulty } from "./types";

// ─── Internal DB type ────────────────────────────────────────────────────────
interface DbQuestion {
  difficulty: Difficulty;
  question: string;
  options: string[];
  correct: number;
  fact: string;
}

type QuestionsDb = Record<Pantheon, DbQuestion[]>;

const db = questionsDb as QuestionsDb;

// ─── Transform ────────────────────────────────────────────────────────────────
function transformQuestion(dbQ: DbQuestion, pantheon: Pantheon, index: number): Question {
  return {
    id: `${pantheon}-${index}`,
    pantheon,
    difficulty: dbQ.difficulty,
    question: dbQ.question,
    options: dbQ.options,
    correctAnswerIndex: dbQ.correct,
    funFact: dbQ.fact,
    tags: [],
  };
}

function getAllQuestions(): Question[] {
  return (Object.keys(db) as Pantheon[]).flatMap((pantheon) =>
    db[pantheon].map((q, i) => transformQuestion(q, pantheon, i))
  );
}

function getQuestionsForPantheon(pantheon: Pantheon): Question[] {
  return db[pantheon].map((q, i) => transformQuestion(q, pantheon, i));
}

// ─── Fisher-Yates shuffle (returns new array) ─────────────────────────────────
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Seeded PRNG for daily challenge ──────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  const rand = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function todaysSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ─── Daily questions (same set for everyone today) ────────────────────────────
export function getDailyQuestions(): Question[] {
  const seed = todaysSeed();
  return seededShuffle(getAllQuestions(), seed).slice(0, 10);
}

// ─── Load questions for a given mode ─────────────────────────────────────────
export function loadQuestionsForMode(
  mode: GameMode,
  pantheon?: Pantheon,
  _stage?: number
): Question[] {
  switch (mode) {
    case "quick_play":
      return shuffleArray(getAllQuestions()).slice(0, 10);

    case "campaign":
      if (!pantheon) throw new Error("Campaign mode requires a pantheon");
      return shuffleArray(getQuestionsForPantheon(pantheon)).slice(0, 10);

    case "daily_challenge":
      return getDailyQuestions();

    case "endless":
      return shuffleArray(getAllQuestions()).slice(0, 10);

    case "versus":
      return shuffleArray(getAllQuestions()).slice(0, 10);
  }
}

// ─── XP Calculation ───────────────────────────────────────────────────────────
const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

/**
 * Returns XP earned for a single answer.
 * @param isCorrect    Whether the answer was correct
 * @param timeRemaining Seconds left on the timer (0–15)
 * @param streak       Current correct-answer streak
 * @param difficulty   Question difficulty
 */
export function calculateXP(
  isCorrect: boolean,
  timeRemaining: number,
  streak: number,
  difficulty: Difficulty
): number {
  if (!isCorrect) return 0;
  const base = 100;
  const timeBonus = Math.floor((timeRemaining / 15) * 50);
  const raw = (base + timeBonus) * DIFFICULTY_MULTIPLIER[difficulty] * getStreakMultiplier(streak);
  return Math.round(raw);
}

// ─── 50/50 Lifeline ───────────────────────────────────────────────────────────
/**
 * Returns indices of 2 wrong answers to hide.
 * Never hides the correct answer.
 */
export function applyFiftyFifty(question: Question): number[] {
  const wrongIndices = question.options
    .map((_, i) => i)
    .filter((i) => i !== question.correctAnswerIndex);
  return shuffleArray(wrongIndices).slice(0, 2);
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd /Users/babun/Downloads/mythos-arena && pnpm test lib/__tests__/quiz-engine.test.ts
```
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git -C /Users/babun/Downloads/mythos-arena add lib/quiz-engine.ts lib/__tests__/quiz-engine.test.ts
git -C /Users/babun/Downloads/mythos-arena commit -m "feat: add quiz engine with question loading, XP calc, lifelines"
```

---

## Task 2: Quiz Context (state management)

**Files:**
- Create: `lib/quiz-context.tsx`
- Create: `lib/__tests__/quiz-context.test.ts`

Manages the in-progress quiz session. Uses the `QuizState` type already defined in `lib/types.ts`. Adds `hiddenOptionIndices` to track 50/50 state locally in state.

- [ ] **Step 1: Write failing tests**

Create `lib/__tests__/quiz-context.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { quizReducer, initialQuizState } from "../quiz-context";
import type { Question } from "../types";

const mockQuestion: Question = {
  id: "greek-0",
  pantheon: "greek",
  difficulty: "easy",
  question: "Who is the king of the Greek gods?",
  options: ["Zeus", "Poseidon", "Hades", "Apollo"],
  correctAnswerIndex: 0,
  funFact: "Zeus rules from Mount Olympus.",
  tags: [],
};

const mockQuestions = [mockQuestion];

describe("quizReducer", () => {
  it("START_QUIZ initialises state with questions", () => {
    const state = quizReducer(initialQuizState, {
      type: "START_QUIZ",
      payload: { questions: mockQuestions, mode: "quick_play" },
    });
    expect(state.currentRound).not.toBeNull();
    expect(state.currentRound!.questions).toHaveLength(1);
    expect(state.currentQuestionIndex).toBe(0);
    expect(state.timeRemaining).toBe(15);
    expect(state.isAnswered).toBe(false);
  });

  it("ANSWER_QUESTION marks correct answer and sets feedback", () => {
    const started = quizReducer(initialQuizState, {
      type: "START_QUIZ",
      payload: { questions: mockQuestions, mode: "quick_play" },
    });
    const answered = quizReducer(started, {
      type: "ANSWER_QUESTION",
      payload: { selectedAnswerIndex: 0, timeRemaining: 10 },
    });
    expect(answered.isAnswered).toBe(true);
    expect(answered.feedback).toBe("correct");
    expect(answered.streak).toBe(1);
    expect(answered.totalXP).toBeGreaterThan(0);
  });

  it("ANSWER_QUESTION marks wrong answer and resets streak", () => {
    const started = quizReducer(initialQuizState, {
      type: "START_QUIZ",
      payload: { questions: mockQuestions, mode: "quick_play" },
    });
    const withStreak = { ...started, streak: 5 };
    const answered = quizReducer(withStreak, {
      type: "ANSWER_QUESTION",
      payload: { selectedAnswerIndex: 1, timeRemaining: 10 },
    });
    expect(answered.feedback).toBe("wrong");
    expect(answered.streak).toBe(0);
    expect(answered.totalXP).toBe(0);
  });

  it("TICK_TIMER decrements timeRemaining", () => {
    const started = quizReducer(initialQuizState, {
      type: "START_QUIZ",
      payload: { questions: mockQuestions, mode: "quick_play" },
    });
    const ticked = quizReducer(started, { type: "TICK_TIMER" });
    expect(ticked.timeRemaining).toBe(14);
  });

  it("TICK_TIMER does not go below 0", () => {
    const started = quizReducer(initialQuizState, {
      type: "START_QUIZ",
      payload: { questions: mockQuestions, mode: "quick_play" },
    });
    const zeroed = { ...started, timeRemaining: 0 };
    const ticked = quizReducer(zeroed, { type: "TICK_TIMER" });
    expect(ticked.timeRemaining).toBe(0);
  });

  it("USE_LIFELINE_EXTRA_TIME adds 10 seconds", () => {
    const started = quizReducer(initialQuizState, {
      type: "START_QUIZ",
      payload: { questions: mockQuestions, mode: "quick_play" },
    });
    const state = quizReducer(started, { type: "USE_LIFELINE_EXTRA_TIME" });
    expect(state.timeRemaining).toBe(25);
    expect(state.lifelinesUsed.extraTime).toBe(true);
  });

  it("NEXT_QUESTION advances index and resets answer state", () => {
    const twoQuestions = [mockQuestion, { ...mockQuestion, id: "greek-1" }];
    const started = quizReducer(initialQuizState, {
      type: "START_QUIZ",
      payload: { questions: twoQuestions, mode: "quick_play" },
    });
    const answered = quizReducer(started, {
      type: "ANSWER_QUESTION",
      payload: { selectedAnswerIndex: 0, timeRemaining: 10 },
    });
    const next = quizReducer(answered, { type: "NEXT_QUESTION" });
    expect(next.currentQuestionIndex).toBe(1);
    expect(next.isAnswered).toBe(false);
    expect(next.feedback).toBeNull();
    expect(next.selectedAnswerIndex).toBeNull();
    expect(next.timeRemaining).toBe(15);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd /Users/babun/Downloads/mythos-arena && pnpm test lib/__tests__/quiz-context.test.ts
```
Expected: FAIL — "Cannot find module '../quiz-context'"

- [ ] **Step 3: Implement `lib/quiz-context.tsx`**

Create `lib/quiz-context.tsx`:

```typescript
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import type { QuizState, Question, GameMode, QuizRound, QuizAnswer } from "./types";
import { calculateXP } from "./quiz-engine";

// Extend QuizState with 50/50 hidden option tracking
export interface ExtendedQuizState extends QuizState {
  hiddenOptionIndices: number[];
}

type QuizAction =
  | { type: "START_QUIZ"; payload: { questions: Question[]; mode: GameMode } }
  | { type: "ANSWER_QUESTION"; payload: { selectedAnswerIndex: number; timeRemaining: number } }
  | { type: "TICK_TIMER" }
  | { type: "NEXT_QUESTION" }
  | { type: "USE_LIFELINE_FIFTY_FIFTY"; payload: { hiddenIndices: number[] } }
  | { type: "USE_LIFELINE_SKIP" }
  | { type: "USE_LIFELINE_EXTRA_TIME" }
  | { type: "RESET_QUIZ" };

export const initialQuizState: ExtendedQuizState = {
  currentRound: null,
  currentQuestionIndex: 0,
  streak: 0,
  totalXP: 0,
  timeRemaining: 15,
  isAnswered: false,
  selectedAnswerIndex: null,
  feedback: null,
  lifelinesUsed: {
    fiftyFifty: false,
    skip: false,
    extraTime: false,
  },
  hiddenOptionIndices: [],
};

export function quizReducer(state: ExtendedQuizState, action: QuizAction): ExtendedQuizState {
  switch (action.type) {
    case "START_QUIZ": {
      const { questions, mode } = action.payload;
      const round: QuizRound = {
        id: `round-${Date.now()}`,
        userId: "local",
        mode,
        pantheon: questions[0]?.pantheon ?? "greek",
        questions,
        answers: [],
        streak: 0,
        totalXPEarned: 0,
        startedAt: Date.now(),
        status: "in_progress",
      };
      return {
        ...initialQuizState,
        currentRound: round,
      };
    }

    case "ANSWER_QUESTION": {
      if (!state.currentRound || state.isAnswered) return state;
      const { selectedAnswerIndex, timeRemaining } = action.payload;
      const currentQ = state.currentRound.questions[state.currentQuestionIndex];
      const isCorrect = selectedAnswerIndex === currentQ.correctAnswerIndex;
      const newStreak = isCorrect ? state.streak + 1 : 0;
      const xpEarned = calculateXP(isCorrect, timeRemaining, state.streak, currentQ.difficulty);

      const answer: QuizAnswer = {
        questionId: currentQ.id,
        selectedAnswerIndex,
        isCorrect,
        timeToAnswer: (15 - timeRemaining) * 1000,
      };

      return {
        ...state,
        isAnswered: true,
        selectedAnswerIndex,
        feedback: isCorrect ? "correct" : "wrong",
        streak: newStreak,
        totalXP: state.totalXP + xpEarned,
        currentRound: {
          ...state.currentRound,
          answers: [...state.currentRound.answers, answer],
          streak: newStreak,
          totalXPEarned: state.totalXP + xpEarned,
        },
      };
    }

    case "TICK_TIMER":
      if (state.isAnswered || state.timeRemaining <= 0) return state;
      return { ...state, timeRemaining: Math.max(0, state.timeRemaining - 1) };

    case "NEXT_QUESTION":
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        timeRemaining: 15,
        isAnswered: false,
        selectedAnswerIndex: null,
        feedback: null,
        hiddenOptionIndices: [],
      };

    case "USE_LIFELINE_FIFTY_FIFTY":
      return {
        ...state,
        hiddenOptionIndices: action.payload.hiddenIndices,
        lifelinesUsed: { ...state.lifelinesUsed, fiftyFifty: true },
      };

    case "USE_LIFELINE_SKIP":
      return {
        ...state,
        lifelinesUsed: { ...state.lifelinesUsed, skip: true },
        currentQuestionIndex: state.currentQuestionIndex + 1,
        timeRemaining: 15,
        isAnswered: false,
        selectedAnswerIndex: null,
        feedback: null,
        hiddenOptionIndices: [],
      };

    case "USE_LIFELINE_EXTRA_TIME":
      return {
        ...state,
        timeRemaining: state.timeRemaining + 10,
        lifelinesUsed: { ...state.lifelinesUsed, extraTime: true },
      };

    case "RESET_QUIZ":
      return initialQuizState;

    default:
      return state;
  }
}

interface QuizContextType {
  state: ExtendedQuizState;
  startQuiz: (questions: Question[], mode: GameMode) => void;
  answerQuestion: (selectedAnswerIndex: number, timeRemaining: number) => void;
  tickTimer: () => void;
  nextQuestion: () => void;
  useFiftyFifty: (hiddenIndices: number[]) => void;
  useSkip: () => void;
  useExtraTime: () => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);

  const value: QuizContextType = {
    state,
    startQuiz: (questions, mode) =>
      dispatch({ type: "START_QUIZ", payload: { questions, mode } }),
    answerQuestion: (idx, time) =>
      dispatch({ type: "ANSWER_QUESTION", payload: { selectedAnswerIndex: idx, timeRemaining: time } }),
    tickTimer: () => dispatch({ type: "TICK_TIMER" }),
    nextQuestion: () => dispatch({ type: "NEXT_QUESTION" }),
    useFiftyFifty: (hiddenIndices) =>
      dispatch({ type: "USE_LIFELINE_FIFTY_FIFTY", payload: { hiddenIndices } }),
    useSkip: () => dispatch({ type: "USE_LIFELINE_SKIP" }),
    useExtraTime: () => dispatch({ type: "USE_LIFELINE_EXTRA_TIME" }),
    resetQuiz: () => dispatch({ type: "RESET_QUIZ" }),
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd /Users/babun/Downloads/mythos-arena && pnpm test lib/__tests__/quiz-context.test.ts
```
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git -C /Users/babun/Downloads/mythos-arena add lib/quiz-context.tsx lib/__tests__/quiz-context.test.ts
git -C /Users/babun/Downloads/mythos-arena commit -m "feat: add quiz context with useReducer state management"
```

---

## Task 3: Storage Layer (AsyncStorage persistence)

**Files:**
- Create: `lib/storage.ts`

Persists player progress (level, XP, unlocked pantheons) across app restarts.

- [ ] **Step 1: Implement `lib/storage.ts`**

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Pantheon } from "./types";

const KEYS = {
  PLAYER_LEVEL: "@mythos/player_level",
  TOTAL_XP: "@mythos/total_xp",
  UNLOCKED_PANTHEONS: "@mythos/unlocked_pantheons",
} as const;

export interface StoredProgress {
  playerLevel: number;
  totalXP: number;
  unlockedPantheons: Pantheon[];
}

export async function loadProgress(): Promise<StoredProgress | null> {
  try {
    const [levelStr, xpStr, pantheonsStr] = await AsyncStorage.multiGet([
      KEYS.PLAYER_LEVEL,
      KEYS.TOTAL_XP,
      KEYS.UNLOCKED_PANTHEONS,
    ]);
    const level = levelStr[1];
    const xp = xpStr[1];
    const pantheons = pantheonsStr[1];
    if (!level || !xp || !pantheons) return null;
    return {
      playerLevel: parseInt(level, 10),
      totalXP: parseInt(xp, 10),
      unlockedPantheons: JSON.parse(pantheons) as Pantheon[],
    };
  } catch {
    return null;
  }
}

export async function saveProgress(progress: StoredProgress): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [KEYS.PLAYER_LEVEL, String(progress.playerLevel)],
      [KEYS.TOTAL_XP, String(progress.totalXP)],
      [KEYS.UNLOCKED_PANTHEONS, JSON.stringify(progress.unlockedPantheons)],
    ]);
  } catch {
    // Silent fail — app still works without persistence
  }
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/babun/Downloads/mythos-arena add lib/storage.ts
git -C /Users/babun/Downloads/mythos-arena commit -m "feat: add AsyncStorage persistence layer for player progress"
```

---

## Task 4: Update Game Context (XP accumulation + persistence)

**Files:**
- Modify: `lib/game-context.tsx`

Adds `ADD_XP` action that accumulates XP, handles level-up, unlocks pantheons at the right levels, and loads/saves progress via `lib/storage.ts`.

- [ ] **Step 1: Rewrite `lib/game-context.tsx`**

Replace the entire file:

```typescript
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { GameState, GameMode, Pantheon, PANTHEON_METADATA, XP_PER_LEVEL } from "./types";
import { loadProgress, saveProgress } from "./storage";

type GameAction =
  | { type: "SELECT_MODE"; payload: GameMode }
  | { type: "SELECT_PANTHEON"; payload: Pantheon }
  | { type: "ADVANCE_CAMPAIGN"; payload: number }
  | { type: "LEVEL_UP"; payload: number }
  | { type: "UNLOCK_PANTHEON"; payload: Pantheon }
  | { type: "ADD_XP"; payload: number }
  | { type: "LOAD_PROGRESS"; payload: { playerLevel: number; totalXP: number; unlockedPantheons: Pantheon[] } }
  | { type: "RESET_GAME" };

export interface ExtendedGameState extends GameState {
  totalXP: number;
  currentXP: number;
}

const initialState: ExtendedGameState = {
  currentMode: null,
  selectedPantheon: null,
  currentCampaignStage: 0,
  playerLevel: 1,
  unlockedPantheons: ["greek"],
  totalXP: 0,
  currentXP: 0,
};

function getPantheonsForLevel(level: number): Pantheon[] {
  return (Object.keys(PANTHEON_METADATA) as Pantheon[]).filter(
    (p) => PANTHEON_METADATA[p].unlocksAtLevel <= level
  );
}

function gameReducer(state: ExtendedGameState, action: GameAction): ExtendedGameState {
  switch (action.type) {
    case "SELECT_MODE":
      return { ...state, currentMode: action.payload };
    case "SELECT_PANTHEON":
      return { ...state, selectedPantheon: action.payload };
    case "ADVANCE_CAMPAIGN":
      return { ...state, currentCampaignStage: action.payload };
    case "LEVEL_UP":
      return { ...state, playerLevel: action.payload };
    case "UNLOCK_PANTHEON":
      return {
        ...state,
        unlockedPantheons: [...new Set([...state.unlockedPantheons, action.payload])],
      };

    case "ADD_XP": {
      const newTotalXP = state.totalXP + action.payload;
      // Recalculate level from total XP
      let newLevel = 1;
      let xpRemaining = newTotalXP;
      while (xpRemaining >= newLevel * XP_PER_LEVEL) {
        xpRemaining -= newLevel * XP_PER_LEVEL;
        newLevel++;
      }
      const unlockedPantheons = getPantheonsForLevel(newLevel);
      return {
        ...state,
        totalXP: newTotalXP,
        currentXP: xpRemaining,
        playerLevel: newLevel,
        unlockedPantheons,
      };
    }

    case "LOAD_PROGRESS":
      return {
        ...state,
        playerLevel: action.payload.playerLevel,
        totalXP: action.payload.totalXP,
        currentXP: action.payload.totalXP % (action.payload.playerLevel * XP_PER_LEVEL),
        unlockedPantheons: action.payload.unlockedPantheons,
      };

    case "RESET_GAME":
      return initialState;
    default:
      return state;
  }
}

interface GameContextType {
  state: ExtendedGameState;
  selectMode: (mode: GameMode) => void;
  selectPantheon: (pantheon: Pantheon) => void;
  advanceCampaign: (stage: number) => void;
  levelUp: (level: number) => void;
  unlockPantheon: (pantheon: Pantheon) => void;
  addXP: (xp: number) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load persisted progress on mount
  useEffect(() => {
    loadProgress().then((saved) => {
      if (saved) {
        dispatch({ type: "LOAD_PROGRESS", payload: saved });
      }
    });
  }, []);

  // Save progress whenever level or XP changes
  useEffect(() => {
    saveProgress({
      playerLevel: state.playerLevel,
      totalXP: state.totalXP,
      unlockedPantheons: state.unlockedPantheons,
    });
  }, [state.playerLevel, state.totalXP, state.unlockedPantheons]);

  const value: GameContextType = {
    state,
    selectMode: (mode) => dispatch({ type: "SELECT_MODE", payload: mode }),
    selectPantheon: (pantheon) => dispatch({ type: "SELECT_PANTHEON", payload: pantheon }),
    advanceCampaign: (stage) => dispatch({ type: "ADVANCE_CAMPAIGN", payload: stage }),
    levelUp: (level) => dispatch({ type: "LEVEL_UP", payload: level }),
    unlockPantheon: (pantheon) => dispatch({ type: "UNLOCK_PANTHEON", payload: pantheon }),
    addXP: (xp) => dispatch({ type: "ADD_XP", payload: xp }),
    resetGame: () => dispatch({ type: "RESET_GAME" }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
```

- [ ] **Step 2: Run existing tests to make sure nothing broke**

```bash
cd /Users/babun/Downloads/mythos-arena && pnpm test lib/__tests__/game-context.test.ts
```
Expected: PASS (or only failures related to removed actions — check and update test if needed)

- [ ] **Step 3: Commit**

```bash
git -C /Users/babun/Downloads/mythos-arena add lib/game-context.tsx
git -C /Users/babun/Downloads/mythos-arena commit -m "feat: add XP accumulation, level-up logic, and AsyncStorage persistence to GameContext"
```

---

## Task 5: Register New Routes in Root Layout

**Files:**
- Modify: `app/_layout.tsx`

Adds `quiz` and `results` as Stack screens, and wraps the app with `QuizProvider`.

- [ ] **Step 1: Modify `app/_layout.tsx`**

Add the import at the top (after the existing `GameProvider` import):
```typescript
import { QuizProvider } from "@/lib/quiz-context";
```

Wrap `<GameProvider>` with `<QuizProvider>`:
```tsx
<GestureHandlerRootView style={{ flex: 1 }}>
  <GameProvider>
    <QuizProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="oauth/callback" />
            <Stack.Screen name="pantheon-selection" />
            <Stack.Screen name="quiz" />
            <Stack.Screen name="results" />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </trpc.Provider>
    </QuizProvider>
  </GameProvider>
</GestureHandlerRootView>
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/babun/Downloads/mythos-arena add app/_layout.tsx
git -C /Users/babun/Downloads/mythos-arena commit -m "feat: register quiz and results routes, wrap app with QuizProvider"
```

---

## Task 6: Quiz Screen

**Files:**
- Create: `app/quiz.tsx`

The main gameplay screen. Reads `mode`, `pantheon`, `stage` from route params. Runs a timer via `useEffect`/`setInterval`. Shows question, 4 answer buttons, a circular SVG timer ring, lifeline buttons, and progress indicator. On quiz completion navigates to `/results`.

The circular timer uses `react-native-svg` (already installed). The ring stroke-dashoffset animates from 0 to the full circumference as time runs out.

- [ ] **Step 1: Create `app/quiz.tsx`**

```tsx
import React, { useEffect, useCallback, useRef } from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Svg, Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useQuiz } from "@/lib/quiz-context";
import { useGame } from "@/lib/game-context";
import { loadQuestionsForMode, applyFiftyFifty } from "@/lib/quiz-engine";
import { useColors } from "@/hooks/use-colors";
import type { GameMode, Pantheon } from "@/lib/types";

const TIMER_SECONDS = 15;
const RING_SIZE = 80;
const RING_STROKE = 6;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function QuizScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams<{ mode: GameMode; pantheon?: Pantheon; stage?: string }>();
  const { state, startQuiz, answerQuestion, tickTimer, nextQuestion, useFiftyFifty, useSkip, useExtraTime } = useQuiz();
  const { addXP } = useGame();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStarted = useRef(false);

  // Start quiz once on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    const questions = loadQuestionsForMode(
      params.mode,
      params.pantheon,
      params.stage ? parseInt(params.stage, 10) : undefined
    );
    startQuiz(questions, params.mode);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!state.currentRound || state.isAnswered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isAnswered, state.currentRound, state.currentQuestionIndex]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (state.timeRemaining === 0 && !state.isAnswered && state.currentRound) {
      handleAnswer(-1); // -1 = timeout, counts as wrong
    }
  }, [state.timeRemaining]);

  const haptic = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleAnswer = useCallback(
    (index: number) => {
      if (state.isAnswered) return;
      haptic();
      answerQuestion(index, state.timeRemaining);
    },
    [state.isAnswered, state.timeRemaining]
  );

  const handleNext = useCallback(() => {
    if (!state.currentRound) return;
    const questions = state.currentRound.questions;
    const isLastQuestion = state.currentQuestionIndex >= questions.length - 1;

    if (isLastQuestion) {
      // Quiz complete — award XP and navigate to results
      addXP(state.totalXP);
      const lastQ = questions[state.currentQuestionIndex];
      router.replace({
        pathname: "/results",
        params: {
          xpEarned: String(state.totalXP),
          correctAnswers: String(state.currentRound.answers.filter((a) => a.isCorrect).length),
          totalQuestions: String(questions.length),
          funFact: lastQ.funFact,
          mode: params.mode,
        },
      });
    } else {
      nextQuestion();
    }
  }, [state, params.mode]);

  const handleFiftyFifty = useCallback(() => {
    if (state.lifelinesUsed.fiftyFifty || state.isAnswered || !state.currentRound) return;
    const q = state.currentRound.questions[state.currentQuestionIndex];
    const hidden = applyFiftyFifty(q);
    useFiftyFifty(hidden);
    haptic();
  }, [state]);

  const handleSkip = useCallback(() => {
    if (state.lifelinesUsed.skip || !state.currentRound) return;
    haptic();
    const isLast = state.currentQuestionIndex >= state.currentRound.questions.length - 1;
    if (isLast) {
      addXP(state.totalXP);
      router.replace({
        pathname: "/results",
        params: {
          xpEarned: String(state.totalXP),
          correctAnswers: String(state.currentRound.answers.filter((a) => a.isCorrect).length),
          totalQuestions: String(state.currentRound.questions.length),
          funFact: "",
          mode: params.mode,
        },
      });
    } else {
      useSkip();
    }
  }, [state, params.mode]);

  const handleExtraTime = useCallback(() => {
    if (state.lifelinesUsed.extraTime || state.isAnswered) return;
    haptic();
    useExtraTime();
  }, [state]);

  if (!state.currentRound) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground text-lg">Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const questions = state.currentRound.questions;
  const currentQ = questions[state.currentQuestionIndex];
  const progress = (state.currentQuestionIndex + 1) / questions.length;
  const timerProgress = state.timeRemaining / TIMER_SECONDS;
  const strokeOffset = CIRCUMFERENCE * (1 - timerProgress);
  const timerColor =
    state.timeRemaining > 10 ? colors.primary : state.timeRemaining > 5 ? "#f59e0b" : "#ef4444";

  const getButtonStyle = (index: number) => {
    if (!state.isAnswered || state.hiddenOptionIndices.includes(index)) return {};
    if (index === currentQ.correctAnswerIndex) {
      return { backgroundColor: "#16a34a" };
    }
    if (index === state.selectedAnswerIndex) {
      return { backgroundColor: "#dc2626" };
    }
    return {};
  };

  const getButtonTextColor = (index: number) => {
    if (!state.isAnswered) return colors.foreground;
    if (index === currentQ.correctAnswerIndex) return "#ffffff";
    if (index === state.selectedAnswerIndex) return "#ffffff";
    return colors.muted;
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-4">

          {/* Header: progress + timer */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-muted">
                  Question {state.currentQuestionIndex + 1}/{questions.length}
                </Text>
                <Text className="text-xs text-muted">
                  {state.streak > 0 ? `🔥 ${state.streak} streak` : ""}
                </Text>
              </View>
              <View style={{ backgroundColor: colors.surface, borderRadius: 4, height: 6 }}>
                <View
                  style={{
                    width: `${progress * 100}%`,
                    height: "100%",
                    backgroundColor: colors.primary,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            {/* Circular timer */}
            <View className="ml-4 items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                {/* Background ring */}
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={colors.border}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                {/* Countdown ring */}
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={timerColor}
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
              <View style={{ position: "absolute" }}>
                <Text style={{ color: timerColor, fontWeight: "bold", fontSize: 18 }}>
                  {state.timeRemaining}
                </Text>
              </View>
            </View>
          </View>

          {/* XP tally */}
          <Text className="text-xs text-primary text-right mb-3">⚡ {state.totalXP} XP</Text>

          {/* Question */}
          <View className="bg-surface rounded-xl p-5 mb-6 border border-border">
            <Text className="text-base font-semibold text-foreground leading-relaxed">
              {currentQ.question}
            </Text>
          </View>

          {/* Answer Buttons */}
          <View className="gap-3 mb-6">
            {currentQ.options.map((option, index) => {
              const isHidden = state.hiddenOptionIndices.includes(index);
              if (isHidden) return <View key={index} style={{ height: 56 }} />;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleAnswer(index)}
                  disabled={state.isAnswered}
                  style={[
                    {
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: state.isAnswered && index !== state.selectedAnswerIndex && index !== currentQ.correctAnswerIndex ? 0.5 : 1,
                    },
                    getButtonStyle(index),
                  ]}
                >
                  <Text style={{ color: getButtonTextColor(index), fontWeight: "600", fontSize: 15 }}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Feedback message */}
          {state.feedback && (
            <View
              className="rounded-xl p-4 mb-4"
              style={{ backgroundColor: state.feedback === "correct" ? "#16a34a22" : "#dc262622" }}
            >
              <Text
                className="font-bold text-center mb-1"
                style={{ color: state.feedback === "correct" ? "#16a34a" : "#dc2626" }}
              >
                {state.feedback === "correct" ? "✓ Correct!" : "✗ Wrong"}
              </Text>
              {state.feedback === "correct" && (
                <Text className="text-xs text-muted text-center">{currentQ.funFact}</Text>
              )}
            </View>
          )}

          {/* Next button (shown after answering) */}
          {state.isAnswered && (
            <Pressable
              onPress={handleNext}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.background, fontWeight: "bold", fontSize: 16 }}>
                {state.currentQuestionIndex >= questions.length - 1 ? "See Results →" : "Next Question →"}
              </Text>
            </Pressable>
          )}

          {/* Lifelines */}
          <View className="flex-row gap-3 mt-auto">
            <Pressable
              onPress={handleFiftyFifty}
              disabled={state.lifelinesUsed.fiftyFifty || state.isAnswered}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: state.lifelinesUsed.fiftyFifty ? colors.muted : colors.border,
                opacity: state.lifelinesUsed.fiftyFifty ? 0.4 : 1,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>½</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>50/50</Text>
            </Pressable>

            <Pressable
              onPress={handleSkip}
              disabled={state.lifelinesUsed.skip}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: state.lifelinesUsed.skip ? colors.muted : colors.border,
                opacity: state.lifelinesUsed.skip ? 0.4 : 1,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>⏭</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>Skip</Text>
            </Pressable>

            <Pressable
              onPress={handleExtraTime}
              disabled={state.lifelinesUsed.extraTime || state.isAnswered}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: state.lifelinesUsed.extraTime ? colors.muted : colors.border,
                opacity: state.lifelinesUsed.extraTime ? 0.4 : 1,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>⏱+</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>+10s</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/babun/Downloads/mythos-arena add app/quiz.tsx
git -C /Users/babun/Downloads/mythos-arena commit -m "feat: add quiz gameplay screen with timer, answers, lifelines"
```

---

## Task 7: Results Screen

**Files:**
- Create: `app/results.tsx`

Shows score, XP earned, fun fact, and navigation back home or to play again.

- [ ] **Step 1: Create `app/results.tsx`**

```tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useColors } from "@/hooks/use-colors";
import { getLevelTitle } from "@/lib/types";
import type { GameMode } from "@/lib/types";

export default function ResultsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state } = useGame();
  const params = useLocalSearchParams<{
    xpEarned: string;
    correctAnswers: string;
    totalQuestions: string;
    funFact: string;
    mode: GameMode;
  }>();

  const xpEarned = parseInt(params.xpEarned ?? "0", 10);
  const correctAnswers = parseInt(params.correctAnswers ?? "0", 10);
  const totalQuestions = parseInt(params.totalQuestions ?? "10", 10);
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  const grade = accuracy >= 90 ? "S" : accuracy >= 70 ? "A" : accuracy >= 50 ? "B" : accuracy >= 30 ? "C" : "D";
  const gradeColor = accuracy >= 90 ? "#d4af37" : accuracy >= 70 ? "#16a34a" : accuracy >= 50 ? "#2563eb" : accuracy >= 30 ? "#f59e0b" : "#dc2626";

  const handlePlayAgain = () => {
    router.replace({
      pathname: "/quiz",
      params: { mode: params.mode },
    });
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-6">

          {/* Grade */}
          <View className="items-center mb-8 mt-4">
            <Text className="text-sm text-muted mb-2 uppercase tracking-widest">Quiz Complete</Text>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 3,
                borderColor: gradeColor,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 48, fontWeight: "bold", color: gradeColor }}>{grade}</Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">{accuracy}% Accuracy</Text>
            <Text className="text-muted mt-1">
              {correctAnswers}/{totalQuestions} correct
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-primary">⚡ {xpEarned}</Text>
              <Text className="text-xs text-muted mt-1">XP Earned</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-foreground">Lv.{state.playerLevel}</Text>
              <Text className="text-xs text-muted mt-1">{getLevelTitle(state.playerLevel)}</Text>
            </View>
          </View>

          {/* XP progress toward next level */}
          <View className="bg-surface rounded-xl p-4 border border-border mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-foreground font-semibold">Level Progress</Text>
              <Text className="text-sm text-primary">{state.currentXP} / {state.playerLevel * 1000} XP</Text>
            </View>
            <View style={{ backgroundColor: colors.background, borderRadius: 4, height: 8 }}>
              <View
                style={{
                  width: `${Math.min(100, (state.currentXP / (state.playerLevel * 1000)) * 100)}%`,
                  height: "100%",
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>

          {/* Fun Fact */}
          {params.funFact ? (
            <View className="bg-surface rounded-xl p-4 border border-border mb-8">
              <Text className="text-xs text-primary font-semibold mb-2 uppercase tracking-wide">
                📚 Did You Know?
              </Text>
              <Text className="text-sm text-foreground leading-relaxed">{params.funFact}</Text>
            </View>
          ) : null}

          {/* Actions */}
          <View className="gap-3">
            <Pressable
              onPress={handlePlayAgain}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.background, fontWeight: "bold", fontSize: 16 }}>
                Play Again
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/(tabs)")}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
                Back to Home
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/babun/Downloads/mythos-arena add app/results.tsx
git -C /Users/babun/Downloads/mythos-arena commit -m "feat: add results screen with grade, XP, level progress, fun fact"
```

---

## Task 8: Wire Navigation (Home + Pantheon Selection)

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/pantheon-selection.tsx`

Connect every button to an actual route. Versus shows a "Coming Soon" alert.

- [ ] **Step 1: Replace `app/(tabs)/index.tsx`**

```tsx
import { ScrollView, Text, View, Pressable, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useColors } from "@/hooks/use-colors";
import { getLevelTitle } from "@/lib/types";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state } = useGame();

  const haptic = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const goToQuiz = async (mode: string, pantheon?: string) => {
    await haptic();
    router.push({ pathname: "/quiz", params: { mode, ...(pantheon ? { pantheon } : {}) } });
  };

  const showVersus = () => {
    Alert.alert("Coming Soon", "Versus mode will be available in a future update!");
  };

  const xpForNextLevel = state.playerLevel * 1000;
  const xpProgress = Math.min(100, (state.currentXP / xpForNextLevel) * 100);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-primary mb-2">Mythos Arena</Text>
            <Text className="text-sm text-muted">Enter the halls of ancient legends</Text>
          </View>

          {/* Player Stats Card */}
          <View className="bg-surface rounded-lg p-5 mb-8 border border-border">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-xs text-muted mb-1">Level {state.playerLevel}</Text>
                <Text className="text-3xl font-bold text-primary">{getLevelTitle(state.playerLevel)}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted mb-1">Pantheons Unlocked</Text>
                <Text className="text-2xl font-bold text-secondary">
                  {state.unlockedPantheons.length}/7
                </Text>
              </View>
            </View>
            <View className="bg-background rounded-full h-2 overflow-hidden">
              <View className="bg-primary h-full" style={{ width: `${xpProgress}%` }} />
            </View>
            <Text className="text-xs text-muted mt-2">
              {state.currentXP} / {xpForNextLevel} XP to next level
            </Text>
          </View>

          {/* Daily Challenge */}
          <Pressable
            onPress={() => goToQuiz("daily_challenge")}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 20,
              marginBottom: 32,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.background, marginBottom: 4 }}>
              🎯 Daily Challenge
            </Text>
            <Text style={{ fontSize: 14, color: colors.background, opacity: 0.8, marginBottom: 8 }}>
              10 unique questions • 1,500 XP • Global leaderboard
            </Text>
            <Text style={{ fontSize: 12, color: colors.background, opacity: 0.6 }}>
              Resets daily at midnight
            </Text>
          </Pressable>

          {/* Game Modes Grid */}
          <Text className="text-lg font-bold text-foreground mb-4">Game Modes</Text>

          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={() => goToQuiz("quick_play")}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>⚡</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>Quick Play</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Random 10 questions</Text>
            </Pressable>

            <Pressable
              onPress={async () => { await haptic(); router.push("/pantheon-selection"); }}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🏛️</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>Campaign</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>5 stages per pantheon</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3 mb-8">
            <Pressable
              onPress={() => goToQuiz("endless")}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>♾️</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>Endless</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Questions until 3 wrong</Text>
            </Pressable>

            <Pressable
              onPress={showVersus}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: 0.6,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>⚔️</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>Versus</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Coming soon</Text>
            </Pressable>
          </View>

          {/* Quick Links */}
          <View className="flex-row gap-3">
            <Pressable
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>👤 Profile</Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>🏆 Leaderboard</Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>⚙️ Settings</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
```

- [ ] **Step 2: Wire up `app/pantheon-selection.tsx`**

In `handleStartCampaign`, replace the `console.log` with navigation:

```typescript
const handleStartCampaign = () => {
  if (selectedPantheon) {
    router.push({
      pathname: "/quiz",
      params: { mode: "campaign", pantheon: selectedPantheon },
    });
  }
};
```

- [ ] **Step 3: Run the app and verify all modes navigate to quiz**

```bash
cd /Users/babun/Downloads/mythos-arena && npx expo start
```

Test: Quick Play → quiz loads. Campaign → pantheon select → quiz loads. Daily Challenge → quiz loads. Endless → quiz loads. Versus → "Coming Soon" alert.

- [ ] **Step 4: Commit**

```bash
git -C /Users/babun/Downloads/mythos-arena add app/(tabs)/index.tsx app/pantheon-selection.tsx
git -C /Users/babun/Downloads/mythos-arena commit -m "feat: wire all game mode buttons to quiz navigation"
```

---

## Task 9: Push to GitHub + Deploy

- [ ] **Step 1: Run all tests**

```bash
cd /Users/babun/Downloads/mythos-arena && pnpm test
```
Expected: All PASS

- [ ] **Step 2: Push to GitHub**

```bash
git -C /Users/babun/Downloads/mythos-arena push origin main
```

This triggers the GitHub Actions workflow. The updated app will be live at **https://henrybuildz.github.io/mythos-arena/** within ~2 minutes.

---

## Summary of What Gets Built

| Feature | Location |
|---------|----------|
| Question loader + XP math | `lib/quiz-engine.ts` |
| Quiz state reducer | `lib/quiz-context.tsx` |
| Player progress persistence | `lib/storage.ts` |
| Circular countdown timer | `app/quiz.tsx` |
| 4 answer buttons w/ feedback | `app/quiz.tsx` |
| 50/50, Skip, Extra Time lifelines | `app/quiz.tsx` |
| Grade + XP results screen | `app/results.tsx` |
| Level-up from XP | `lib/game-context.tsx` |
| All modes wired | `app/(tabs)/index.tsx` |
| Campaign navigation | `app/pantheon-selection.tsx` |
