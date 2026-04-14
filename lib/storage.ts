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
