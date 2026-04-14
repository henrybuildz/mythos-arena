# Mythos Arena – Complete Source Code Export

This document contains all relevant source code files for Claude to understand and edit the project.

---

## File: app.config.ts
// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID format: space.manus.<project_name_dots>.<timestamp>
// e.g., "my-app" created at 2024-01-15 10:30:45 -> "space.manus.my.app.t20240115103045"
// Bundle ID can only contain letters, numbers, and dots
// Android requires each dot-separated segment to start with a letter
const rawBundleId = "space.manus.mythos.arena.t20260413091632";
const bundleId =
  rawBundleId
    .replace(/[-_]/g, ".") // Replace hyphens/underscores with dots
    .replace(/[^a-zA-Z0-9.]/g, "") // Remove invalid chars
    .replace(/\.+/g, ".") // Collapse consecutive dots
    .replace(/^\.+|\.+$/g, "") // Trim leading/trailing dots
    .toLowerCase()
    .split(".")
    .map((segment) => {
      // Android requires each segment to start with a letter
      // Prefix with 'x' if segment starts with a digit
      return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
    })
    .join(".") || "space.manus.app";
// Extract timestamp from bundle ID and prefix with "manus" for deep link scheme
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  // App branding - update these values directly (do not use env vars)
  appName: "Mythos Arena",
  appSlug: "mythos-arena",
  // S3 URL of the app logo - set this to the URL returned by generate_image when creating custom logo
  // Leave empty to use the default icon from assets/images/icon.png
  logoUrl: "",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",

  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: false,
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#0a0a0a",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: ["POST_NOTIFICATIONS"],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
    meta: {
      description: "Mythos Arena - Epic mythology trivia game with Greek, Norse, Egyptian, Tolkien, Celtic, Hindu, and Japanese legends",
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#d4af37",
        sounds: [],
      },
    ],
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0a0a0a",
        dark: {
          backgroundColor: "#0a0a0a",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          minSdkVersion: 24,
          compileSdkVersion: 34,
        },
        ios: {
          deploymentTarget: "15.1",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: false,
  },
};

export default config;

---
## File: lib/types.ts

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

---
## File: lib/game-context.tsx

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { GameState, GameMode, Pantheon } from "./types";

type GameAction =
  | { type: "SELECT_MODE"; payload: GameMode }
  | { type: "SELECT_PANTHEON"; payload: Pantheon }
  | { type: "ADVANCE_CAMPAIGN"; payload: number }
  | { type: "LEVEL_UP"; payload: number }
  | { type: "UNLOCK_PANTHEON"; payload: Pantheon }
  | { type: "RESET_GAME" };

const initialState: GameState = {
  currentMode: null,
  selectedPantheon: null,
  currentCampaignStage: 0,
  playerLevel: 1,
  unlockedPantheons: ["greek"],
};

function gameReducer(state: GameState, action: GameAction): GameState {
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
    case "RESET_GAME":
      return initialState;
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  selectMode: (mode: GameMode) => void;
  selectPantheon: (pantheon: Pantheon) => void;
  advanceCampaign: (stage: number) => void;
  levelUp: (level: number) => void;
  unlockPantheon: (pantheon: Pantheon) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const value: GameContextType = {
    state,
    selectMode: (mode) => dispatch({ type: "SELECT_MODE", payload: mode }),
    selectPantheon: (pantheon) => dispatch({ type: "SELECT_PANTHEON", payload: pantheon }),
    advanceCampaign: (stage) => dispatch({ type: "ADVANCE_CAMPAIGN", payload: stage }),
    levelUp: (level) => dispatch({ type: "LEVEL_UP", payload: level }),
    unlockPantheon: (pantheon) => dispatch({ type: "UNLOCK_PANTHEON", payload: pantheon }),
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

---
## File: app/(tabs)/index.tsx

import { ScrollView, Text, View, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useColors } from "@/hooks/use-colors";

/**
 * Home Screen - Mythos Arena
 *
 * Main entry point with game mode selection and player stats
 */
export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state } = useGame();

  const handleModeSelect = async (mode: string) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log("Selected mode:", mode);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-6">
          {/* Header - Temple Theme */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-primary mb-2">Mythos Arena</Text>
            <Text className="text-sm text-muted">Enter the halls of ancient legends</Text>
          </View>

          {/* Player Stats Card */}
          <View className="bg-surface rounded-lg p-5 mb-8 border border-border">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-xs text-muted mb-1">Level</Text>
                <Text className="text-3xl font-bold text-primary">{state.playerLevel}</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted mb-1">Pantheons Unlocked</Text>
                <Text className="text-2xl font-bold text-secondary">
                  {state.unlockedPantheons.length}/7
                </Text>
              </View>
            </View>

            {/* XP Progress Bar */}
            <View className="bg-background rounded-full h-2 overflow-hidden">
              <View
                className="bg-primary h-full"
                style={{ width: `${(state.playerLevel % 10) * 10}%` }}
              />
            </View>
            <Text className="text-xs text-muted mt-2">XP Progress</Text>
          </View>

          {/* Daily Challenge CTA */}
          <Pressable
            onPress={() => handleModeSelect("daily_challenge")}
            className="bg-primary rounded-lg p-5 mb-8 active:opacity-80"
          >
            <View>
              <Text className="text-lg font-bold text-background mb-1">🎯 Daily Challenge</Text>
              <Text className="text-sm text-background/80 mb-3">
                10 unique questions • 1,500 XP • Global leaderboard
              </Text>
              <Text className="text-xs text-background/60">Resets daily at midnight</Text>
            </View>
          </Pressable>

          {/* Game Modes Grid */}
          <Text className="text-lg font-bold text-foreground mb-4">Game Modes</Text>

          <View className="flex-row gap-3 mb-4">
            {/* Quick Play */}
            <Pressable
              onPress={() => handleModeSelect("quick_play")}
              className="flex-1 bg-surface rounded-lg p-4 border border-border active:opacity-70"
            >
              <Text className="text-2xl mb-2">⚡</Text>
              <Text className="text-sm font-bold text-foreground mb-1">Quick Play</Text>
              <Text className="text-xs text-muted">Random 10 questions</Text>
            </Pressable>

            {/* Campaign */}
            <Pressable
              onPress={() => router.push("/pantheon-selection")}
              className="flex-1 bg-surface rounded-lg p-4 border border-border active:opacity-70"
            >
              <Text className="text-2xl mb-2">🏛️</Text>
              <Text className="text-sm font-bold text-foreground mb-1">Campaign</Text>
              <Text className="text-xs text-muted">5 stages per pantheon</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3 mb-8">
            {/* Endless */}
            <Pressable
              onPress={() => handleModeSelect("endless")}
              className="flex-1 bg-surface rounded-lg p-4 border border-border active:opacity-70"
            >
              <Text className="text-2xl mb-2">♾️</Text>
              <Text className="text-sm font-bold text-foreground mb-1">Endless</Text>
              <Text className="text-xs text-muted">Questions until 3 wrong</Text>
            </Pressable>

            {/* Versus */}
            <Pressable
              onPress={() => handleModeSelect("versus")}
              className="flex-1 bg-surface rounded-lg p-4 border border-border active:opacity-70"
            >
              <Text className="text-2xl mb-2">⚔️</Text>
              <Text className="text-sm font-bold text-foreground mb-1">Versus</Text>
              <Text className="text-xs text-muted">1v1 real-time battles</Text>
            </Pressable>
          </View>

          {/* Quick Links */}
          <View className="flex-row gap-3">
            <Pressable className="flex-1 bg-surface rounded-lg py-3 border border-border active:opacity-70">
              <Text className="text-center text-sm font-semibold text-foreground">👤 Profile</Text>
            </Pressable>

            <Pressable className="flex-1 bg-surface rounded-lg py-3 border border-border active:opacity-70">
              <Text className="text-center text-sm font-semibold text-foreground">🏆 Leaderboard</Text>
            </Pressable>

            <Pressable className="flex-1 bg-surface rounded-lg py-3 border border-border active:opacity-70">
              <Text className="text-center text-sm font-semibold text-foreground">⚙️ Settings</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

---
## File: app/pantheon-selection.tsx

import React, { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { PantheonCard } from "@/components/pantheon-card";
import { useGame } from "@/lib/game-context";
import { Pantheon, PANTHEON_METADATA } from "@/lib/types";

export default function PantheonSelectionScreen() {
  const router = useRouter();
  const { state, selectPantheon } = useGame();
  const [selectedPantheon, setSelectedPantheon] = useState<Pantheon | null>(state.selectedPantheon);

  const pantheons: Pantheon[] = ["greek", "norse", "egyptian", "tolkien", "celtic", "hindu", "japanese"];

  const handleSelectPantheon = (pantheon: Pantheon) => {
    const metadata = PANTHEON_METADATA[pantheon];
    const isUnlocked = state.unlockedPantheons.includes(pantheon);
    const locked = !isUnlocked && state.playerLevel < metadata.unlocksAtLevel;

    if (!locked) {
      setSelectedPantheon(pantheon);
      selectPantheon(pantheon);
    }
  };

  const handleStartCampaign = () => {
    if (selectedPantheon) {
      // TODO: Navigate to campaign screen
      console.log("Starting campaign for pantheon:", selectedPantheon);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-primary mb-2">Pantheon Campaign</Text>
            <Text className="text-sm text-muted">
              Select a mythology pantheon to begin your epic journey
            </Text>
          </View>

          {/* Player Level Info */}
          <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
            <Text className="text-xs text-muted mb-1">Your Level</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-primary">{state.playerLevel}</Text>
              <Text className="text-xs text-muted">
                {state.unlockedPantheons.length} / {pantheons.length} Pantheons Unlocked
              </Text>
            </View>
          </View>

          {/* Pantheon Grid */}
          <View className="flex-row flex-wrap mb-6">
            {pantheons.map((pantheon) => {
              const metadata = PANTHEON_METADATA[pantheon];
              const isUnlocked = state.unlockedPantheons.includes(pantheon);

              return (
                <View key={pantheon} className="w-1/2">
                  <PantheonCard
                    pantheon={pantheon}
                    isUnlocked={isUnlocked}
                    isSelected={selectedPantheon === pantheon}
                    onPress={() => handleSelectPantheon(pantheon)}
                    unlocksAtLevel={metadata.unlocksAtLevel}
                    playerLevel={state.playerLevel}
                  />
                </View>
              );
            })}
          </View>

          {/* Selected Pantheon Info */}
          {selectedPantheon && (
            <View className="bg-surface rounded-lg p-4 mb-6 border-2 border-primary">
              <Text className="text-lg font-bold text-primary mb-2">
                {PANTHEON_METADATA[selectedPantheon].name}
              </Text>
              <Text className="text-sm text-foreground mb-4">
                {PANTHEON_METADATA[selectedPantheon].description}
              </Text>
              <Text className="text-xs text-muted mb-4">
                • 5 stages with 10 questions each
                • Boss round at stage 5 with harder questions
                • Earn XP and unlock achievements
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={() => router.back()}
              className="flex-1 bg-surface border border-border rounded-lg py-3 active:opacity-70"
            >
              <Text className="text-center text-foreground font-semibold">Back</Text>
            </Pressable>

            <Pressable
              onPress={handleStartCampaign}
              disabled={!selectedPantheon}
              className={`flex-1 rounded-lg py-3 active:opacity-80 ${
                selectedPantheon ? "bg-primary" : "bg-muted opacity-50"
              }`}
            >
              <Text className="text-center text-background font-bold">
                {selectedPantheon ? "Start Campaign" : "Select Pantheon"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

---
## File: components/pantheon-card.tsx

import React from "react";
import { Pressable, Text, View } from "react-native";
import { Pantheon, PANTHEON_METADATA } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PantheonCardProps {
  pantheon: Pantheon;
  isUnlocked: boolean;
  isSelected?: boolean;
  onPress: () => void;
  unlocksAtLevel?: number;
  playerLevel?: number;
}

export function PantheonCard({
  pantheon,
  isUnlocked,
  isSelected,
  onPress,
  unlocksAtLevel,
  playerLevel = 1,
}: PantheonCardProps) {
  const metadata = PANTHEON_METADATA[pantheon];
  const locked = !isUnlocked && (unlocksAtLevel ?? 0) > 0 && playerLevel < (unlocksAtLevel ?? 0);

  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed && !locked ? 0.95 : 1 }],
          opacity: locked ? 0.5 : 1,
        },
      ]}
      className="flex-1 m-2"
    >
      <View
        className={cn(
          "rounded-lg p-4 border-2 min-h-32 justify-between",
          isSelected ? "border-primary bg-surface" : "border-border bg-surface/50",
          locked && "opacity-50"
        )}
        style={{
          borderColor: isSelected ? metadata.color : undefined,
          backgroundColor: isSelected ? `${metadata.color}15` : undefined,
        }}
      >
        {/* Pantheon Name */}
        <View>
          <Text
            className="text-lg font-bold text-foreground mb-1"
            style={{ color: isSelected ? metadata.color : undefined }}
          >
            {metadata.name}
          </Text>
          <Text className="text-xs text-muted leading-relaxed">{metadata.description}</Text>
        </View>

        {/* Lock/Unlock Status */}
        <View className="flex-row items-center justify-between mt-3">
          {locked ? (
            <Text className="text-xs text-warning font-semibold">
              Unlocks at Level {unlocksAtLevel}
            </Text>
          ) : isUnlocked ? (
            <Text className="text-xs text-success font-semibold">✓ Unlocked</Text>
          ) : (
            <Text className="text-xs text-muted">Available</Text>
          )}

          {isSelected && (
            <View className="w-5 h-5 rounded-full" style={{ backgroundColor: metadata.color }} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

---
## File: components/screen-container.tsx

import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Tailwind className for the content area.
   */
  className?: string;
  /**
   * Additional className for the outer container (background layer).
   */
  containerClassName?: string;
  /**
   * Additional className for the SafeAreaView (content layer).
   */
  safeAreaClassName?: string;
}

/**
 * A container component that properly handles SafeArea and background colors.
 *
 * The outer View extends to full screen (including status bar area) with the background color,
 * while the inner SafeAreaView ensures content is within safe bounds.
 *
 * Usage:
 * ```tsx
 * <ScreenContainer className="p-4">
 *   <Text className="text-2xl font-bold text-foreground">
 *     Welcome
 *   </Text>
 * </ScreenContainer>
 * ```
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  style,
  ...props
}: ScreenContainerProps) {
  return (
    <View
      className={cn(
        "flex-1",
        "bg-background",
        containerClassName
      )}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={style}
      >
        <View className={cn("flex-1", className)}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

---
## File: theme.config.js

/** @type {const} */
const themeColors = {
  // Primary accent colors (Gold & Bronze)
  primary: { light: '#d4af37', dark: '#d4af37' },
  secondary: { light: '#b87333', dark: '#b87333' },
  
  // Base theme (Dark mode optimized)
  background: { light: '#0a0a0a', dark: '#0a0a0a' },
  surface: { light: '#1a1a1a', dark: '#1a1a1a' },
  foreground: { light: '#f5f5f0', dark: '#f5f5f0' },
  muted: { light: '#8b7355', dark: '#8b7355' },
  border: { light: '#3d3d3d', dark: '#3d3d3d' },
  
  // Status colors
  success: { light: '#4ade80', dark: '#4ade80' },
  warning: { light: '#f59e0b', dark: '#f59e0b' },
  error: { light: '#ef4444', dark: '#ef4444' },
  
  // Pantheon-specific accent colors
  pantheonGreek: { light: '#1e90ff', dark: '#1e90ff' },
  pantheonNorse: { light: '#87ceeb', dark: '#87ceeb' },
  pantheonEgyptian: { light: '#ffd700', dark: '#ffd700' },
  pantheonTolkien: { light: '#4169e1', dark: '#4169e1' },
  pantheonCeltic: { light: '#9370db', dark: '#9370db' },
  pantheonHindu: { light: '#ffd700', dark: '#ffd700' },
  pantheonJapanese: { light: '#dc143c', dark: '#dc143c' },
};

module.exports = { themeColors };

---
## File: tailwind.config.js

const { themeColors } = require("./theme.config");
const plugin = require("tailwindcss/plugin");

const tailwindColors = Object.fromEntries(
  Object.entries(themeColors).map(([name, swatch]) => [
    name,
    {
      DEFAULT: `var(--color-${name})`,
      light: swatch.light,
      dark: swatch.dark,
    },
  ]),
);

// Pantheon-specific color utilities
const pantheonColors = {
  "pantheon-greek": "#1e90ff",
  "pantheon-norse": "#87ceeb",
  "pantheon-egyptian": "#ffd700",
  "pantheon-tolkien": "#4169e1",
  "pantheon-celtic": "#9370db",
  "pantheon-hindu": "#ffd700",
  "pantheon-japanese": "#dc143c",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // Scan all component and app files for Tailwind classes
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}", "./lib/**/*.{js,ts,tsx}", "./hooks/**/*.{js,ts,tsx}"],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: { ...tailwindColors, ...pantheonColors },
      boxShadow: {
        gold: "0 0 20px rgba(212, 175, 55, 0.3)",
        "gold-lg": "0 0 30px rgba(212, 175, 55, 0.5)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)" },
        },
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ':root:not([data-theme="dark"]) &');
      addVariant("dark", ':root[data-theme="dark"] &');
    }),
  ],
};

---
## File: package.json

{
  "name": "app-template",
  "version": "1.0.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "concurrently -k \"pnpm dev:server\" \"pnpm dev:metro\"",
    "dev:server": "cross-env NODE_ENV=development tsx watch server/_core/index.ts",
    "dev:metro": "cross-env EXPO_USE_METRO_WORKSPACE_ROOT=1 npx expo start --web --port ${EXPO_PORT:-8081}",
    "build": "esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc --noEmit",
    "lint": "expo lint",
    "format": "prettier --write .",
    "test": "vitest run",
    "db:push": "drizzle-kit generate && drizzle-kit migrate",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "qr": "node scripts/generate_qr.mjs"
  },
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "^2.2.0",
    "@react-navigation/bottom-tabs": "^7.8.12",
    "@react-navigation/elements": "^2.9.2",
    "@react-navigation/native": "^7.1.25",
    "@tanstack/react-query": "^5.90.12",
    "@trpc/client": "11.7.2",
    "@trpc/react-query": "11.7.2",
    "@trpc/server": "11.7.2",
    "axios": "^1.13.2",
    "clsx": "^2.1.1",
    "cookie": "^1.1.1",
    "dotenv": "^16.6.1",
    "drizzle-orm": "^0.44.7",
    "expo": "~54.0.29",
    "expo-audio": "~1.1.0",
    "expo-build-properties": "^1.0.10",
    "expo-constants": "~18.0.12",
    "expo-font": "~14.0.10",
    "expo-haptics": "~15.0.8",
    "expo-image": "~3.0.11",
    "expo-keep-awake": "~15.0.8",
    "expo-linking": "~8.0.10",
    "expo-notifications": "~0.32.15",
    "expo-router": "~6.0.19",
    "expo-secure-store": "~15.0.8",
    "expo-splash-screen": "~31.0.12",
    "expo-status-bar": "~3.0.9",
    "expo-symbols": "~1.0.8",
    "expo-system-ui": "~6.0.9",
    "expo-video": "~3.0.15",
    "expo-web-browser": "~15.0.10",
    "express": "^4.22.1",
    "jose": "6.1.0",
    "mysql2": "^3.16.0",
    "nativewind": "^4.2.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.6",
    "react-native-safe-area-context": "~5.6.2",
    "react-native-screens": "~4.16.0",
    "react-native-svg": "15.12.1",
    "react-native-web": "~0.21.2",
    "react-native-worklets": "0.5.1",
    "superjson": "^1.13.3",
    "tailwind-merge": "^2.6.0",
    "zod": "^4.2.1"
  },
  "devDependencies": {
    "@expo/ngrok": "^4.1.3",
    "@types/cookie": "^0.6.0",
    "@types/express": "^4.17.25",
    "@types/node": "^22.19.3",
    "@types/qrcode": "^1.5.6",
    "@types/react": "~19.1.17",
    "concurrently": "^9.2.1",
    "cross-env": "^7.0.3",
    "drizzle-kit": "^0.31.8",
    "esbuild": "^0.25.12",
    "eslint": "^9.39.2",
    "eslint-config-expo": "~10.0.0",
    "prettier": "^3.7.4",
    "qrcode": "^1.5.4",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.21.0",
    "typescript": "~5.9.3",
    "vitest": "^2.1.9"
  },
  "packageManager": "pnpm@9.12.0"
}
