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
