/**
 * Shared TypeScript types and interfaces for Mythos Arena
 */

export type Pantheon = "greek" | "norse" | "egyptian" | "tolkien" | "celtic" | "hindu" | "japanese";
export type Difficulty = "easy" | "medium" | "hard";
export type GameMode = "quick_play" | "campaign" | "daily_challenge" | "endless" | "versus";

export interface Question {
  id: string;
  pantheon: Pantheon;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  funFact: string;
  tags: string[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswerIndex: number;
  isCorrect: boolean;
  timeToAnswer: number; // milliseconds
}

export interface QuizRound {
  id: string;
  userId: string;
  mode: GameMode;
  pantheon: Pantheon;
  questions: Question[];
  answers: QuizAnswer[];
  streak: number;
  totalXPEarned: number;
  startedAt: number;
  completedAt?: number;
  status: "in_progress" | "completed" | "abandoned";
}

export interface PlayerScore {
  id: string;
  userId: string;
  roundId: string;
  mode: GameMode;
  pantheon: Pantheon;
  score: number;
  xpEarned: number;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  condition: {
    type: "score" | "streak" | "pantheon_completion" | "level" | "mode";
    value: any;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  level: number;
  totalXP: number;
  currentXP: number;
  title: string;
  unlockedPantheons: Pantheon[];
  unlockedAvatarFrames: string[];
  achievements: Achievement[];
  createdAt: number;
  lastActiveAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  level: number;
  totalScore: number;
  totalXP: number;
  winRate: number;
  lastUpdated: number;
}

export interface PvPMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  questions: Question[];
  player1Answers: QuizAnswer[];
  player2Answers: QuizAnswer[];
  player1Score: number;
  player2Score: number;
  winnerId: string;
  status: "waiting" | "in_progress" | "completed";
  createdAt: number;
  completedAt?: number;
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  questions: Question[];
  leaderboard: LeaderboardEntry[];
  createdAt: number;
  expiresAt: number;
}

// Game state types
export interface GameState {
  currentMode: GameMode | null;
  selectedPantheon: Pantheon | null;
  currentCampaignStage: number;
  playerLevel: number;
  unlockedPantheons: Pantheon[];
}

export interface QuizState {
  currentRound: QuizRound | null;
  currentQuestionIndex: number;
  streak: number;
  totalXP: number;
  timeRemaining: number;
  isAnswered: boolean;
  selectedAnswerIndex: number | null;
  feedback: "correct" | "wrong" | null;
  lifelinesUsed: {
    fiftyFifty: boolean;
    skip: boolean;
    extraTime: boolean;
  };
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Pantheon metadata
export const PANTHEON_METADATA: Record<Pantheon, { name: string; unlocksAtLevel: number; color: string; description: string }> = {
  greek: {
    name: "Greek",
    unlocksAtLevel: 1,
    color: "#1e90ff",
    description: "Gods of Mount Olympus, heroes, and ancient wisdom",
  },
  norse: {
    name: "Norse",
    unlocksAtLevel: 5,
    color: "#87ceeb",
    description: "Vikings, Ragnarok, and the World Tree",
  },
  egyptian: {
    name: "Egyptian",
    unlocksAtLevel: 10,
    color: "#ffd700",
    description: "Pharaohs, pyramids, and the afterlife",
  },
  tolkien: {
    name: "Tolkien Legendarium",
    unlocksAtLevel: 15,
    color: "#4169e1",
    description: "Middle-earth, elves, dwarves, and the One Ring",
  },
  celtic: {
    name: "Celtic",
    unlocksAtLevel: 20,
    color: "#9370db",
    description: "Druids, warriors, and the Otherworld",
  },
  hindu: {
    name: "Hindu",
    unlocksAtLevel: 25,
    color: "#ffd700",
    description: "Devas, avatars, and cosmic cycles",
  },
  japanese: {
    name: "Japanese/Shinto",
    unlocksAtLevel: 30,
    color: "#dc143c",
    description: "Kami, spirits, and sacred traditions",
  },
};

// Player level titles
export const LEVEL_TITLES: Record<number, string> = {
  1: "Mortal",
  5: "Initiate",
  10: "Acolyte",
  15: "Sage",
  20: "Mystic",
  25: "Demigod",
  30: "Hero",
  35: "Champion",
  40: "Titan",
  45: "Godling",
  50: "Allfather",
};

// XP thresholds for each level
export const XP_PER_LEVEL = 1000;

export function getLevelTitle(level: number): string {
  for (let i = 50; i >= 1; i--) {
    if (level >= i && LEVEL_TITLES[i]) {
      return LEVEL_TITLES[i];
    }
  }
  return "Mortal";
}

export function getNextLevelXP(level: number): number {
  return level * XP_PER_LEVEL;
}

export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getNextLevelXP(i);
  }
  return total;
}
