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
