import { describe, it, expect } from "vitest";
import {
  loadQuestionsForMode,
  calculateXP,
  applyFiftyFifty,
  getDailyQuestions,
  shuffleArray,
} from "../quiz-engine";
import type { Question } from "../types";

describe("shuffleArray", () => {
  it("returns same elements in different order", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffleArray([...arr]);
    expect(shuffled).toHaveLength(arr.length);
    expect([...shuffled].sort()).toEqual([...arr].sort());
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
