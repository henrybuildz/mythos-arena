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
      router.push({
        pathname: "/quiz",
        params: { mode: "campaign", pantheon: selectedPantheon },
      });
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
