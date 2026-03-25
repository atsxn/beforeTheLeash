// app/screens/AssessmentScreen.tsx

import {
  assessmentQuestions,
  type AssessmentChoice,
} from "@/app/data/assessmentQuestions";
import { calculateScores } from "@/app/utils/scoringAlgorithm";
import { ThemedText } from "@/components/themed-text";
import { Itim_400Regular, useFonts } from "@expo-google-fonts/itim";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function AssessmentScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<AssessmentChoice[]>(
    [],
  );

  const [fontsLoaded] = useFonts({
    Itim_400Regular,
  });

  if (!fontsLoaded) return null;

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const totalQuestions = assessmentQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleSelectChoice = (choice: AssessmentChoice) => {
    const newChoices = [...selectedChoices];
    newChoices[currentQuestionIndex] = choice;
    setSelectedChoices(newChoices);

    if (currentQuestionIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 400);
    } else {
      setTimeout(() => {
        showResults(newChoices);
      }, 400);
    }
  };

  const showResults = (choices: AssessmentChoice[]) => {
    const result = calculateScores(choices);

    router.push({
      pathname: "/screens/ResultScreen",
      params: {
        small: result.small.toString(),
        medium: result.medium.toString(),
        large: result.large.toString(),
        recommendedSize: result.recommendedSize,
        confidence: result.confidence.toString(),
      },
    } as any);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.backIcon}>←</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.questionNumber}>
          Question {currentQuestionIndex + 1}/{totalQuestions}
        </ThemedText>

        <View style={styles.spacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Card */}
        <View style={styles.questionCard}>
          <ThemedText style={styles.questionTitle}>
            {currentQuestion.question}
          </ThemedText>

          <ThemedText style={styles.pawDecor}>🐾 🐾 🐾</ThemedText>
        </View>

        {/* Choices */}
        <View style={styles.choicesContainer}>
          {currentQuestion.choices.map((choice) => {
            const isSelected =
              selectedChoices[currentQuestionIndex]?.id === choice.id;

            return (
              <TouchableOpacity
                key={choice.id}
                style={[
                  styles.choiceButton,
                  isSelected && styles.choiceButtonSelected,
                ]}
                onPress={() => handleSelectChoice(choice)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.choiceText,
                    isSelected && styles.choiceTextSelected,
                  ]}
                >
                  {choice.text}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0EA",
  },

  // ===================================
  // Header
  // ===================================
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 26,
    paddingTop: Platform.OS === "ios" ? 30 : 24,
    paddingBottom: 14,
    backgroundColor: "#F5F0EA",
  },

  backButton: {
    width: 44,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 34,
    color: "#5F5F5F",
    fontWeight: "400",
    lineHeight: 32,
    fontFamily: "Itim_400Regular",
  },

  questionNumber: {
    fontSize: 18,
    color: "#F39A3D",
    letterSpacing: 0.2,
    fontFamily: "Itim_400Regular",
  },

  spacer: {
    width: 44,
  },

  // ===================================
  // Progress Bar
  // ===================================
  progressContainer: {
    paddingHorizontal: 28,
    marginBottom: 22,
  },

  progressBarBg: {
    height: 12,
    backgroundColor: "#D9D9DD",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#F39A3D",
    borderRadius: 999,
  },

  // ===================================
  // Scroll View
  // ===================================
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === "ios" ? 54 : 34,
  },

  // ===================================
  // Question Card
  // ===================================
  questionCard: {
    backgroundColor: "#F7F7F8",
    borderRadius: 30,
    paddingHorizontal: 28,
    paddingVertical: 34,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 320,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  questionTitle: {
    fontSize: 24,
    color: "#5C5C5C",
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 26,
    fontFamily: "Itim_400Regular",
  },

  pawDecor: {
    fontSize: 20,
    color: "#B8DCE8",
    letterSpacing: 6,
    fontFamily: "Itim_400Regular",
  },

  // ===================================
  // Choices
  // ===================================
  choicesContainer: {
    gap: 22,
  },

  choiceButton: {
    backgroundColor: "#F7F7F8",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    minHeight: 76,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#C9CDD4",
  },

  choiceButtonSelected: {
    backgroundColor: "#FFF1DC",
    borderColor: "#F39A3D",
  },

  choiceText: {
    fontSize: 18,
    color: "#707887",
    textAlign: "center",
    lineHeight: 28,
    fontFamily: "Itim_400Regular",
  },

  choiceTextSelected: {
    color: "#B96A14",
    fontFamily: "Itim_400Regular",
  },
});
