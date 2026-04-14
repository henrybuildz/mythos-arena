import React, { useEffect, useCallback, useRef } from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Svg, Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useQuiz } from "@/lib/quiz-context";
import { useGame } from "@/lib/game-context";
import { loadQuestionsForMode, applyFiftyFifty } from "@/lib/quiz-engine";
import { useColors } from "@/hooks/use-colors";
import type { GameMode, Pantheon } from "@/lib/types";

const TIMER_SECONDS = 15;
const RING_SIZE = 80;
const RING_STROKE = 6;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function QuizScreen() {
  const router = useRouter();
  const colors = useColors();
  const params = useLocalSearchParams<{ mode: GameMode; pantheon?: Pantheon; stage?: string }>();
  const { state, startQuiz, answerQuestion, tickTimer, nextQuestion, useFiftyFifty, useSkip, useExtraTime } =
    useQuiz();
  const { addXP } = useGame();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasStarted = useRef(false);

  // Start quiz once on mount
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    const questions = loadQuestionsForMode(
      params.mode,
      params.pantheon,
      params.stage ? parseInt(params.stage, 10) : undefined
    );
    startQuiz(questions, params.mode);
  }, []);

  // Countdown timer — restart whenever we move to a new question
  useEffect(() => {
    if (!state.currentRound || state.isAnswered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isAnswered, state.currentRound, state.currentQuestionIndex]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (state.timeRemaining === 0 && !state.isAnswered && state.currentRound) {
      // -1 = timeout, always wrong
      answerQuestion(-1, 0);
    }
  }, [state.timeRemaining]);

  const haptic = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleAnswer = useCallback(
    (index: number) => {
      if (state.isAnswered) return;
      haptic();
      answerQuestion(index, state.timeRemaining);
    },
    [state.isAnswered, state.timeRemaining]
  );

  const navigateToResults = useCallback(
    (quizState: typeof state) => {
      if (!quizState.currentRound) return;
      addXP(quizState.totalXP);
      const questions = quizState.currentRound.questions;
      const lastAnsweredIdx = Math.min(
        quizState.currentQuestionIndex,
        questions.length - 1
      );
      const funFact = questions[lastAnsweredIdx]?.funFact ?? "";
      router.replace({
        pathname: "/results",
        params: {
          xpEarned: String(quizState.totalXP),
          correctAnswers: String(quizState.currentRound.answers.filter((a) => a.isCorrect).length),
          totalQuestions: String(questions.length),
          funFact,
          mode: params.mode,
        },
      });
    },
    [params.mode]
  );

  const handleNext = useCallback(() => {
    if (!state.currentRound) return;
    const isLastQuestion =
      state.currentQuestionIndex >= state.currentRound.questions.length - 1;
    if (isLastQuestion) {
      navigateToResults(state);
    } else {
      nextQuestion();
    }
  }, [state, navigateToResults]);

  const handleFiftyFifty = useCallback(() => {
    if (state.lifelinesUsed.fiftyFifty || state.isAnswered || !state.currentRound) return;
    const q = state.currentRound.questions[state.currentQuestionIndex];
    const hidden = applyFiftyFifty(q);
    useFiftyFifty(hidden);
    haptic();
  }, [state]);

  const handleSkip = useCallback(() => {
    if (state.lifelinesUsed.skip || !state.currentRound) return;
    haptic();
    const isLast =
      state.currentQuestionIndex >= state.currentRound.questions.length - 1;
    if (isLast) {
      navigateToResults(state);
    } else {
      useSkip();
    }
  }, [state, navigateToResults]);

  const handleExtraTime = useCallback(() => {
    if (state.lifelinesUsed.extraTime || state.isAnswered) return;
    haptic();
    useExtraTime();
  }, [state]);

  if (!state.currentRound) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground text-lg">Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const questions = state.currentRound.questions;
  const currentQ = questions[state.currentQuestionIndex];
  const progress = (state.currentQuestionIndex + 1) / questions.length;
  const timerProgress = state.timeRemaining / TIMER_SECONDS;
  const strokeOffset = CIRCUMFERENCE * (1 - timerProgress);
  const timerColor =
    state.timeRemaining > 10
      ? colors.primary
      : state.timeRemaining > 5
        ? "#f59e0b"
        : "#ef4444";

  const getButtonStyle = (index: number) => {
    if (!state.isAnswered || state.hiddenOptionIndices.includes(index)) return {};
    if (index === currentQ.correctAnswerIndex) return { backgroundColor: "#16a34a" };
    if (index === state.selectedAnswerIndex) return { backgroundColor: "#dc2626" };
    return {};
  };

  const getButtonTextColor = (index: number): string => {
    if (!state.isAnswered) return colors.foreground;
    if (index === currentQ.correctAnswerIndex) return "#ffffff";
    if (index === state.selectedAnswerIndex) return "#ffffff";
    return colors.muted;
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 p-4">

          {/* Header: progress bar + circular timer */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-muted">
                  Question {state.currentQuestionIndex + 1}/{questions.length}
                </Text>
                {state.streak > 0 && (
                  <Text className="text-xs text-primary">🔥 {state.streak} streak</Text>
                )}
              </View>
              <View style={{ backgroundColor: colors.surface, borderRadius: 4, height: 6 }}>
                <View
                  style={{
                    width: `${progress * 100}%`,
                    height: "100%",
                    backgroundColor: colors.primary,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            {/* Circular countdown ring */}
            <View
              className="ml-4 items-center justify-center"
              style={{ width: RING_SIZE, height: RING_SIZE }}
            >
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={colors.border}
                  strokeWidth={RING_STROKE}
                  fill="none"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={timerColor}
                  strokeWidth={RING_STROKE}
                  fill="none"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>
              <View style={{ position: "absolute" }}>
                <Text style={{ color: timerColor, fontWeight: "bold", fontSize: 18 }}>
                  {state.timeRemaining}
                </Text>
              </View>
            </View>
          </View>

          {/* XP tally */}
          <Text className="text-xs text-primary text-right mb-3">⚡ {state.totalXP} XP</Text>

          {/* Question card */}
          <View className="bg-surface rounded-xl p-5 mb-6 border border-border">
            <Text className="text-base font-semibold text-foreground leading-relaxed">
              {currentQ.question}
            </Text>
          </View>

          {/* Answer buttons */}
          <View className="gap-3 mb-6">
            {currentQ.options.map((option, index) => {
              const isHidden = state.hiddenOptionIndices.includes(index);
              if (isHidden) return <View key={index} style={{ height: 56 }} />;

              const isAnswered = state.isAnswered;
              const isCorrect = index === currentQ.correctAnswerIndex;
              const isSelected = index === state.selectedAnswerIndex;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleAnswer(index)}
                  disabled={isAnswered}
                  style={[
                    {
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      opacity: isAnswered && !isCorrect && !isSelected ? 0.45 : 1,
                    },
                    getButtonStyle(index),
                  ]}
                >
                  <Text
                    style={{
                      color: getButtonTextColor(index),
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Feedback */}
          {state.feedback && (
            <View
              className="rounded-xl p-4 mb-4"
              style={{
                backgroundColor:
                  state.feedback === "correct" ? "#16a34a22" : "#dc262622",
              }}
            >
              <Text
                className="font-bold text-center mb-1"
                style={{
                  color: state.feedback === "correct" ? "#16a34a" : "#dc2626",
                }}
              >
                {state.feedback === "correct" ? "✓ Correct!" : "✗ Wrong"}
              </Text>
              {state.feedback === "correct" && (
                <Text className="text-xs text-muted text-center">{currentQ.funFact}</Text>
              )}
            </View>
          )}

          {/* Next / Results button */}
          {state.isAnswered && (
            <Pressable
              onPress={handleNext}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{ color: colors.background, fontWeight: "bold", fontSize: 16 }}
              >
                {state.currentQuestionIndex >= questions.length - 1
                  ? "See Results →"
                  : "Next Question →"}
              </Text>
            </Pressable>
          )}

          {/* Lifelines */}
          <View className="flex-row gap-3 mt-auto pt-2">
            {/* 50/50 */}
            <Pressable
              onPress={handleFiftyFifty}
              disabled={state.lifelinesUsed.fiftyFifty || state.isAnswered}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: state.lifelinesUsed.fiftyFifty ? colors.muted : colors.border,
                opacity: state.lifelinesUsed.fiftyFifty ? 0.4 : 1,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>½</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>50/50</Text>
            </Pressable>

            {/* Skip */}
            <Pressable
              onPress={handleSkip}
              disabled={state.lifelinesUsed.skip}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: state.lifelinesUsed.skip ? colors.muted : colors.border,
                opacity: state.lifelinesUsed.skip ? 0.4 : 1,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>⏭</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>Skip</Text>
            </Pressable>

            {/* Extra Time */}
            <Pressable
              onPress={handleExtraTime}
              disabled={state.lifelinesUsed.extraTime || state.isAnswered}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 10,
                borderWidth: 1,
                borderColor: state.lifelinesUsed.extraTime ? colors.muted : colors.border,
                opacity: state.lifelinesUsed.extraTime ? 0.4 : 1,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>⏱+</Text>
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>+10s</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
