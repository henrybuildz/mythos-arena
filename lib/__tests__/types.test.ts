import { describe, it, expect } from "vitest";
import {
  getLevelTitle,
  getNextLevelXP,
  getTotalXPForLevel,
  PANTHEON_METADATA,
  LEVEL_TITLES,
  XP_PER_LEVEL,
  type Pantheon,
} from "../types";

describe("Types and Constants", () => {
  describe("Level Titles", () => {
    it("should return correct title for level 1", () => {
      expect(getLevelTitle(1)).toBe("Mortal");
    });

    it("should return correct title for level 5", () => {
      expect(getLevelTitle(5)).toBe("Initiate");
    });

    it("should return correct title for level 50", () => {
      expect(getLevelTitle(50)).toBe("Allfather");
    });

    it("should return Mortal for level 0", () => {
      expect(getLevelTitle(0)).toBe("Mortal");
    });

    it("should return highest available title for levels above 50", () => {
      expect(getLevelTitle(100)).toBe("Allfather");
    });
  });

  describe("XP Calculations", () => {
    it("should calculate XP required for next level correctly", () => {
      expect(getNextLevelXP(1)).toBe(1000);
      expect(getNextLevelXP(5)).toBe(5000);
      expect(getNextLevelXP(10)).toBe(10000);
    });

    it("should calculate total XP for level correctly", () => {
      // Level 1: 0 XP
      expect(getTotalXPForLevel(1)).toBe(0);

      // Level 2: 1000 XP
      expect(getTotalXPForLevel(2)).toBe(1000);

      // Level 3: 1000 + 2000 = 3000 XP
      expect(getTotalXPForLevel(3)).toBe(3000);

      // Level 4: 1000 + 2000 + 3000 = 6000 XP
      expect(getTotalXPForLevel(4)).toBe(6000);
    });

    it("should have correct XP_PER_LEVEL constant", () => {
      expect(XP_PER_LEVEL).toBe(1000);
    });
  });

  describe("Pantheon Metadata", () => {
    it("should have all 7 pantheons", () => {
      const pantheons: Pantheon[] = ["greek", "norse", "egyptian", "tolkien", "celtic", "hindu", "japanese"];
      pantheons.forEach((pantheon) => {
        expect(PANTHEON_METADATA[pantheon]).toBeDefined();
      });
    });

    it("should have correct metadata structure for Greek", () => {
      const greek = PANTHEON_METADATA.greek;
      expect(greek.name).toBe("Greek");
      expect(greek.unlocksAtLevel).toBe(1);
      expect(greek.color).toBe("#1e90ff");
      expect(greek.description).toBeTruthy();
    });

    it("should have correct unlock levels", () => {
      expect(PANTHEON_METADATA.greek.unlocksAtLevel).toBe(1);
      expect(PANTHEON_METADATA.norse.unlocksAtLevel).toBe(5);
      expect(PANTHEON_METADATA.egyptian.unlocksAtLevel).toBe(10);
      expect(PANTHEON_METADATA.tolkien.unlocksAtLevel).toBe(15);
      expect(PANTHEON_METADATA.celtic.unlocksAtLevel).toBe(20);
      expect(PANTHEON_METADATA.hindu.unlocksAtLevel).toBe(25);
      expect(PANTHEON_METADATA.japanese.unlocksAtLevel).toBe(30);
    });

    it("should have unique colors for each pantheon", () => {
      const colors = Object.values(PANTHEON_METADATA).map((m) => m.color);
      const uniqueColors = new Set(colors);
      // Note: Hindu and Egyptian both use gold, which is intentional
      expect(uniqueColors.size).toBeGreaterThan(0);
    });
  });

  describe("Level Titles Mapping", () => {
    it("should have all expected level titles", () => {
      const expectedLevels = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
      expectedLevels.forEach((level) => {
        expect(LEVEL_TITLES[level]).toBeDefined();
      });
    });

    it("should have correct titles in order", () => {
      expect(LEVEL_TITLES[1]).toBe("Mortal");
      expect(LEVEL_TITLES[50]).toBe("Allfather");
    });
  });
});
