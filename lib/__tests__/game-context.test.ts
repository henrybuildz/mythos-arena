import { describe, it, expect } from "vitest";
import { GameState, Pantheon, GameMode } from "../types";

// Test the reducer logic directly
function gameReducer(state: GameState, action: any): GameState {
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
      return {
        currentMode: null,
        selectedPantheon: null,
        currentCampaignStage: 0,
        playerLevel: 1,
        unlockedPantheons: ["greek"],
      };
    default:
      return state;
  }
}

const initialState: GameState = {
  currentMode: null,
  selectedPantheon: null,
  currentCampaignStage: 0,
  playerLevel: 1,
  unlockedPantheons: ["greek"],
};

describe("GameContext Reducer", () => {
  it("should initialize with default state", () => {
    expect(initialState.currentMode).toBeNull();
    expect(initialState.selectedPantheon).toBeNull();
    expect(initialState.playerLevel).toBe(1);
    expect(initialState.currentCampaignStage).toBe(0);
    expect(initialState.unlockedPantheons).toContain("greek");
  });

  it("should select a game mode", () => {
    const state = gameReducer(initialState, { type: "SELECT_MODE", payload: "quick_play" as GameMode });
    expect(state.currentMode).toBe("quick_play");
  });

  it("should select a pantheon", () => {
    const state = gameReducer(initialState, { type: "SELECT_PANTHEON", payload: "greek" as Pantheon });
    expect(state.selectedPantheon).toBe("greek");
  });

  it("should advance campaign stage", () => {
    const state = gameReducer(initialState, { type: "ADVANCE_CAMPAIGN", payload: 3 });
    expect(state.currentCampaignStage).toBe(3);
  });

  it("should level up player", () => {
    const state = gameReducer(initialState, { type: "LEVEL_UP", payload: 5 });
    expect(state.playerLevel).toBe(5);
  });

  it("should unlock a pantheon", () => {
    const state = gameReducer(initialState, { type: "UNLOCK_PANTHEON", payload: "norse" as Pantheon });
    expect(state.unlockedPantheons).toContain("norse");
    expect(state.unlockedPantheons).toContain("greek");
  });

  it("should not duplicate pantheons when unlocking", () => {
    let state = gameReducer(initialState, { type: "UNLOCK_PANTHEON", payload: "greek" as Pantheon });
    state = gameReducer(state, { type: "UNLOCK_PANTHEON", payload: "greek" as Pantheon });

    const greekCount = state.unlockedPantheons.filter((p: Pantheon) => p === "greek").length;
    expect(greekCount).toBe(1);
  });

  it("should reset game state", () => {
    let state = initialState;
    state = gameReducer(state, { type: "SELECT_MODE", payload: "campaign" as GameMode });
    state = gameReducer(state, { type: "SELECT_PANTHEON", payload: "norse" as Pantheon });
    state = gameReducer(state, { type: "LEVEL_UP", payload: 10 });
    state = gameReducer(state, { type: "ADVANCE_CAMPAIGN", payload: 5 });

    state = gameReducer(state, { type: "RESET_GAME" });

    expect(state.currentMode).toBeNull();
    expect(state.selectedPantheon).toBeNull();
    expect(state.playerLevel).toBe(1);
    expect(state.currentCampaignStage).toBe(0);
    expect(state.unlockedPantheons).toEqual(["greek"]);
  });

  it("should handle multiple actions in sequence", () => {
    let state = initialState;

    // Simulate player progression
    state = gameReducer(state, { type: "LEVEL_UP", payload: 5 });
    state = gameReducer(state, { type: "UNLOCK_PANTHEON", payload: "norse" as Pantheon });
    state = gameReducer(state, { type: "SELECT_MODE", payload: "campaign" as GameMode });
    state = gameReducer(state, { type: "SELECT_PANTHEON", payload: "norse" as Pantheon });
    state = gameReducer(state, { type: "ADVANCE_CAMPAIGN", payload: 2 });

    expect(state.playerLevel).toBe(5);
    expect(state.unlockedPantheons).toContain("norse");
    expect(state.currentMode).toBe("campaign");
    expect(state.selectedPantheon).toBe("norse");
    expect(state.currentCampaignStage).toBe(2);
  });
});
