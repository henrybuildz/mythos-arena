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
 * @param isCorrect     Whether the answer was correct
 * @param timeRemaining Seconds left on the timer (0–15)
 * @param streak        Current correct-answer streak before this answer
 * @param difficulty    Question difficulty
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
