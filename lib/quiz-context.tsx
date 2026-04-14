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
