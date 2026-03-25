// app/screens/BreedSelectionScreen.tsx

import { useBreeds } from "@/app/hooks/useBreeds";
import type { DogBreed } from "@/app/types";
import { ThemedText } from "@/components/themed-text";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type SizeFilter = "all" | "small" | "medium" | "large";

export default function BreedSelectionScreen() {
  const router = useRouter();
  const { breeds, loading, error } = useBreeds();
  const [selectedBreed, setSelectedBreed] = useState<DogBreed | null>(null);
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");

  // กรองสายพันธุ์ตาม size
  const filteredBreeds =
    sizeFilter === "all"
      ? breeds
      : breeds.filter((breed) => breed.size === sizeFilter);

  const handleSelectBreed = (breed: DogBreed) => {
    setSelectedBreed(breed);
  };

  const handleNext = () => {
    if (selectedBreed) {
      // TODO: Navigate to SimulationScreen
      console.log("Selected breed:", selectedBreed.name);
      router.push("/screens/SimulationScreen" as any);
    }
  };

  // Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <ThemedText style={styles.loadingText}>กำลังโหลดข้อมูล...</ThemedText>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>เกิดข้อผิดพลาด</ThemedText>
        <ThemedText style={styles.errorMessage}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => {}}>
          <ThemedText style={styles.retryButtonText}>ลองใหม่</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>เลือกสายพันธุ์สุนัข</ThemedText>
          <ThemedText style={styles.subtitle}>
            {filteredBreeds.length} สายพันธุ์
          </ThemedText>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterButtons}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                sizeFilter === "all" && styles.filterButtonActive,
              ]}
              onPress={() => setSizeFilter("all")}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  sizeFilter === "all" && styles.filterButtonTextActive,
                ]}
              >
                ทั้งหมด
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                sizeFilter === "small" && styles.filterButtonActive,
              ]}
              onPress={() => setSizeFilter("small")}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  sizeFilter === "small" && styles.filterButtonTextActive,
                ]}
              >
                สุนัขเล็ก
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                sizeFilter === "medium" && styles.filterButtonActive,
              ]}
              onPress={() => setSizeFilter("medium")}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  sizeFilter === "medium" && styles.filterButtonTextActive,
                ]}
              >
                สุนัขกลาง
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                sizeFilter === "large" && styles.filterButtonActive,
              ]}
              onPress={() => setSizeFilter("large")}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.filterButtonText,
                  sizeFilter === "large" && styles.filterButtonTextActive,
                ]}
              >
                สุนัขใหญ่
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Breed Cards */}
        <View style={styles.breedsContainer}>
          {filteredBreeds.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                ไม่พบสายพันธุ์ในหมวดนี้
              </ThemedText>
            </View>
          ) : (
            filteredBreeds.map((breed) => {
              const isSelected = selectedBreed?.id === breed.id;

              return (
                <TouchableOpacity
                  key={breed.id}
                  style={[
                    styles.breedCard,
                    isSelected && styles.breedCardSelected,
                  ]}
                  onPress={() => handleSelectBreed(breed)}
                  activeOpacity={0.7}
                >
                  {/* Header with Emoji and Name */}
                  <View style={styles.breedHeader}>
                    <View style={styles.breedIconContainer}>
                      <ThemedText style={styles.breedEmoji}>
                        {breed.emoji}
                      </ThemedText>
                    </View>
                    <View style={styles.breedTitleContainer}>
                      <ThemedText style={styles.breedNameTh}>
                        {breed.nameTh}
                      </ThemedText>
                      <ThemedText style={styles.breedNameEn}>
                        {breed.name}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmarkContainer}>
                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                      </View>
                    )}
                  </View>

                  {/* Description */}
                  <ThemedText style={styles.breedDescription}>
                    {breed.description}
                  </ThemedText>

                  {/* Info Grid */}
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <ThemedText style={styles.infoLabel}>ขนาด</ThemedText>
                      <ThemedText style={styles.infoValue}>
                        {getSizeLabel(breed.size)}
                      </ThemedText>
                    </View>

                    <View style={styles.infoItem}>
                      <ThemedText style={styles.infoLabel}>
                        ออกกำลังกาย
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>
                        {getExerciseLabel(breed.exerciseNeeds)}
                      </ThemedText>
                    </View>

                    <View style={styles.infoItem}>
                      <ThemedText style={styles.infoLabel}>ดูแลขน</ThemedText>
                      <ThemedText style={styles.infoValue}>
                        {getGroomingLabel(breed.groomingNeeds)}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Monthly Cost */}
                  <View style={styles.costContainer}>
                    <ThemedText style={styles.costLabel}>
                      ค่าใช้จ่าย/เดือน:
                    </ThemedText>
                    <ThemedText style={styles.costValue}>
                      ~{breed.monthlyCost.toLocaleString()} บาท
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Next Button (Fixed at bottom) */}
        {selectedBreed && (
          <View style={styles.nextButtonContainer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.nextButtonText}>ถัดไป →</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Helper Functions
function getSizeLabel(size: string): string {
  const labels: Record<string, string> = {
    small: "เล็ก",
    medium: "กลาง",
    large: "ใหญ่",
  };
  return labels[size] || size;
}

function getExerciseLabel(level: string): string {
  const labels: Record<string, string> = {
    low: "น้อย",
    moderate: "ปานกลาง",
    high: "มาก",
  };
  return labels[level] || level;
}

function getGroomingLabel(level: string): string {
  const labels: Record<string, string> = {
    low: "ง่าย",
    moderate: "ปานกลาง",
    high: "มาก",
  };
  return labels[level] || level;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF5F0",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 94 : 50,
    paddingBottom: Platform.OS === "ios" ? 134 : 100,
  },

  // Center Container (Loading/Error)
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF5F0",
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },

  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF4444",
    marginBottom: 8,
  },

  errorMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },

  retryButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Header
  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },

  // Filter Section
  filterSection: {
    marginBottom: 24,
  },

  filterButtons: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 24,
  },

  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  filterButtonActive: {
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
  },

  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  filterButtonTextActive: {
    color: "#FFFFFF",
  },

  // Breeds Container
  breedsContainer: {
    gap: 16,
    paddingBottom: 20,
  },

  // Empty State
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },

  // Breed Card
  breedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  breedCardSelected: {
    borderColor: "#2196F3",
    borderWidth: 3,
    backgroundColor: "#EFF6FF",
    shadowColor: "#2196F3",
    shadowOpacity: 0.15,
  },

  // Breed Header
  breedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  breedIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  breedEmoji: {
    fontSize: 32,
  },

  breedTitleContainer: {
    flex: 1,
  },

  breedNameTh: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },

  breedNameEn: {
    fontSize: 14,
    color: "#6B7280",
  },

  checkmarkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },

  checkmark: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Description
  breedDescription: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 16,
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  infoItem: {
    flex: 1,
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },

  // Cost Container
  costContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  costLabel: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
  },

  costValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },

  // Next Button Container
  nextButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FAF5F0",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 58 : 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },

  nextButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
