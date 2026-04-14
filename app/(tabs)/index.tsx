import { ScrollView, Text, View, Pressable, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useGame } from "@/lib/game-context";
import { useColors } from "@/hooks/use-colors";
import { getLevelTitle } from "@/lib/types";

/**
 * Home Screen — Mythos Arena
 *
 * Entry point with game mode selection and live player stats.
 */
export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state } = useGame();

  const haptic = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const goToQuiz = async (mode: string, pantheon?: string) => {
    await haptic();
    router.push({
      pathname: "/quiz",
      params: { mode, ...(pantheon ? { pantheon } : {}) },
    });
  };

  const showVersus = () => {
    Alert.alert("Coming Soon", "Versus mode will be available in a future update!");
  };

  const xpForNextLevel = state.playerLevel * 1000;
  const xpProgress = Math.min(100, (state.currentXP / xpForNextLevel) * 100);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-6">

          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-primary mb-2">Mythos Arena</Text>
            <Text className="text-sm text-muted">Enter the halls of ancient legends</Text>
          </View>

          {/* Player Stats Card */}
          <View className="bg-surface rounded-lg p-5 mb-8 border border-border">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-xs text-muted mb-1">Level {state.playerLevel}</Text>
                <Text className="text-3xl font-bold text-primary">
                  {getLevelTitle(state.playerLevel)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-muted mb-1">Pantheons Unlocked</Text>
                <Text className="text-2xl font-bold text-secondary">
                  {state.unlockedPantheons.length}/7
                </Text>
              </View>
            </View>
            <View className="bg-background rounded-full h-2 overflow-hidden">
              <View className="bg-primary h-full" style={{ width: `${xpProgress}%` }} />
            </View>
            <Text className="text-xs text-muted mt-2">
              {state.currentXP} / {xpForNextLevel} XP to next level
            </Text>
          </View>

          {/* Daily Challenge CTA */}
          <Pressable
            onPress={() => goToQuiz("daily_challenge")}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 20,
              marginBottom: 32,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.background, marginBottom: 4 }}>
              🎯 Daily Challenge
            </Text>
            <Text style={{ fontSize: 14, color: colors.background, opacity: 0.8, marginBottom: 8 }}>
              10 unique questions • Global leaderboard
            </Text>
            <Text style={{ fontSize: 12, color: colors.background, opacity: 0.6 }}>
              Same questions for everyone today
            </Text>
          </Pressable>

          {/* Game Modes Grid */}
          <Text className="text-lg font-bold text-foreground mb-4">Game Modes</Text>

          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={() => goToQuiz("quick_play")}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>⚡</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                Quick Play
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Random 10 questions</Text>
            </Pressable>

            <Pressable
              onPress={async () => { await haptic(); router.push("/pantheon-selection"); }}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🏛️</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                Campaign
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>5 stages per pantheon</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3 mb-8">
            <Pressable
              onPress={() => goToQuiz("endless")}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>♾️</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                Endless
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Questions until 3 wrong</Text>
            </Pressable>

            <Pressable
              onPress={showVersus}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: 0.6,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>⚔️</Text>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
                Versus
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>Coming soon</Text>
            </Pressable>
          </View>

          {/* Quick Links */}
          <View className="flex-row gap-3">
            <Pressable
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                👤 Profile
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                🏆 Leaderboard
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                ⚙️ Settings
              </Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
