import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useColors } from "@/hooks/use-colors";
import { getLevelTitle } from "@/lib/types";
import type { GameMode } from "@/lib/types";

export default function ResultsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state } = useGame();
  const params = useLocalSearchParams<{
    xpEarned: string;
    correctAnswers: string;
    totalQuestions: string;
    funFact: string;
    mode: GameMode;
  }>();

  const xpEarned = parseInt(params.xpEarned ?? "0", 10);
  const correctAnswers = parseInt(params.correctAnswers ?? "0", 10);
  const totalQuestions = parseInt(params.totalQuestions ?? "10", 10);
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const grade =
    accuracy >= 90 ? "S" :
    accuracy >= 70 ? "A" :
    accuracy >= 50 ? "B" :
    accuracy >= 30 ? "C" : "D";

  const gradeColor =
    accuracy >= 90 ? "#d4af37" :
    accuracy >= 70 ? "#16a34a" :
    accuracy >= 50 ? "#2563eb" :
    accuracy >= 30 ? "#f59e0b" : "#dc2626";

  const xpForNextLevel = state.playerLevel * 1000;
  const xpProgressPct = Math.min(100, (state.currentXP / xpForNextLevel) * 100);

  const handlePlayAgain = () => {
    router.replace({
      pathname: "/quiz",
      params: { mode: params.mode },
    });
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-6">

          {/* Grade circle */}
          <View className="items-center mb-8 mt-4">
            <Text className="text-sm text-muted mb-3 uppercase tracking-widest">
              Quiz Complete
            </Text>
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 3,
                borderColor: gradeColor,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 48, fontWeight: "bold", color: gradeColor }}>
                {grade}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">{accuracy}% Accuracy</Text>
            <Text className="text-muted mt-1">
              {correctAnswers}/{totalQuestions} correct
            </Text>
          </View>

          {/* XP + Level stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-primary">⚡ {xpEarned}</Text>
              <Text className="text-xs text-muted mt-1">XP Earned</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-foreground">Lv.{state.playerLevel}</Text>
              <Text className="text-xs text-muted mt-1">{getLevelTitle(state.playerLevel)}</Text>
            </View>
          </View>

          {/* Level progress bar */}
          <View className="bg-surface rounded-xl p-4 border border-border mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-foreground font-semibold">Level Progress</Text>
              <Text className="text-sm text-primary">
                {state.currentXP} / {xpForNextLevel} XP
              </Text>
            </View>
            <View style={{ backgroundColor: colors.background, borderRadius: 4, height: 8 }}>
              <View
                style={{
                  width: `${xpProgressPct}%`,
                  height: "100%",
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>

          {/* Fun fact */}
          {params.funFact ? (
            <View className="bg-surface rounded-xl p-4 border border-border mb-8">
              <Text className="text-xs text-primary font-semibold mb-2 uppercase tracking-wide">
                📚 Did You Know?
              </Text>
              <Text className="text-sm text-foreground leading-relaxed">{params.funFact}</Text>
            </View>
          ) : (
            <View style={{ marginBottom: 32 }} />
          )}

          {/* Action buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handlePlayAgain}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.background, fontWeight: "bold", fontSize: 16 }}>
                Play Again
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/(tabs)")}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>
                Back to Home
              </Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
