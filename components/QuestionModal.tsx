// app/components/QuestionModal.tsx

import { AgeQuestion } from "@/app/types";
import { ThemedText } from "@/components/themed-text";
import { useState } from "react";
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

interface QuestionModalProps {
  visible: boolean;
  question: AgeQuestion | null;
  onAnswer: (choiceId: string) => void;
  onClose: () => void;
}

export function QuestionModal({
  visible,
  question,
  onAnswer,
  onClose,
}: QuestionModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  if (!question) return null;

  const handleSubmit = () => {
    if (selectedChoice) {
      onAnswer(selectedChoice);
      setSelectedChoice(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>❓ คำถาม</ThemedText>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <ThemedText style={styles.questionText}>
              {question.question}
            </ThemedText>
          </View>

          {/* Choices */}
          <View style={styles.choicesContainer}>
            {question.choices.map((choice) => (
              <TouchableOpacity
                key={choice.id}
                style={[
                  styles.choiceButton,
                  selectedChoice === choice.id && styles.choiceButtonSelected,
                ]}
                onPress={() => setSelectedChoice(choice.id)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.choiceText,
                    selectedChoice === choice.id && styles.choiceTextSelected,
                  ]}
                >
                  {choice.text}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedChoice && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedChoice}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.submitButtonText}>ตอบคำถาม</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  header: {
    marginBottom: 20,
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },

  questionContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    lineHeight: 26,
  },

  choicesContainer: {
    gap: 12,
    marginBottom: 20,
  },

  choiceButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  choiceButtonSelected: {
    borderColor: "#F59E0B",
    backgroundColor: "#FEF3C7",
    borderWidth: 3,
  },

  choiceText: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
  },

  choiceTextSelected: {
    color: "#92400E",
    fontWeight: "700",
  },

  submitButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
