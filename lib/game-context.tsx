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

    case "LOAD_PROGRESS": {
      const { playerLevel, totalXP, unlockedPantheons } = action.payload;
      // Recalculate currentXP from totalXP
      let level = 1;
      let xpRemaining = totalXP;
      while (xpRemaining >= level * XP_PER_LEVEL) {
        xpRemaining -= level * XP_PER_LEVEL;
        level++;
      }
      return {
        ...state,
        playerLevel,
        totalXP,
        currentXP: xpRemaining,
        unlockedPantheons,
      };
    }

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
