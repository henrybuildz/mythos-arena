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
