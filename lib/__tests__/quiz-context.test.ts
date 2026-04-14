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
