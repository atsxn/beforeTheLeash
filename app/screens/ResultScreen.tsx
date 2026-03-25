// app/screens/ResultScreen.tsx

import { createNewGame } from "@/app/services/gameService";
import { ThemedText } from "@/components/themed-text";
import { Itim_400Regular, useFonts } from "@expo-google-fonts/itim";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type RecommendedSize = "small" | "medium" | "large";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [fontsLoaded] = useFonts({
    Itim_400Regular,
  });

  if (!fontsLoaded) return null;

  const recommendedSize =
    (params.recommendedSize as RecommendedSize) || "small";

  const resultData = getResultData(recommendedSize);

  const handleStartSimulation = () => {
    const breedId =
      recommendedSize === "small"
        ? "pom"
        : recommendedSize === "medium"
          ? "beagle"
          : "golden";

    const breedPrefix = recommendedSize === "small" ? "pom" : "golden";

    const newGame = createNewGame(breedId, resultData.breedName, breedPrefix);

    router.push({
      pathname: "/screens/SimulationScreen",
      params: {
        gameId: newGame.id,
        breedId: newGame.breedId,
        breedName: newGame.breedName,
        breedPrefix: newGame.breedPrefix,
        startDate: newGame.startDate,
      },
    } as any);
  };

  const handleRetryAssessment = () => {
    router.push("/screens/AssessmentScreen" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBox}>
          <ThemedText style={styles.headerText}>ผลการประเมิน</ThemedText>
        </View>

        {/* Result Card */}
        <View style={styles.resultCard}>
          <ThemedText style={styles.resultTitle}>
            คุณเหมาะกับสุนัขพันธุ์{resultData.sizeLabel}!
          </ThemedText>

          <Image
            source={resultData.image}
            style={styles.dogImage}
            resizeMode="contain"
          />

          <View style={styles.recommendTextWrap}>
            <ThemedText style={styles.recommendText}>
              สายพันธุ์ที่แนะนำ
            </ThemedText>
            <ThemedText style={styles.breedText}>
              “{resultData.breedName}”
            </ThemedText>
          </View>
        </View>

        {/* Main Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleStartSimulation}
        >
          <ThemedText style={styles.primaryButtonText}>
            เริ่มเลี้ยงสุนัขของคุณ
          </ThemedText>
        </TouchableOpacity>

        {/* Retry */}
        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.75}
          onPress={handleRetryAssessment}
        >
          <ThemedText style={styles.retryText}>ทำแบบประเมินใหม่</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getResultData(size: RecommendedSize) {
  if (size === "small") {
    return {
      sizeLabel: "เล็ก",
      breedName: "ปอมเมอเรเนียน",
      image: require("@/assets/images/pom1.png"),
    };
  }

  if (size === "medium") {
    return {
      sizeLabel: "กลาง",
      breedName: "บีเกิ้ล",
      image: require("@/assets/images/golden1.png"), // ยังไม่มี beagle
    };
  }

  return {
    sizeLabel: "ใหญ่",
    breedName: "โกลเด้น รีทรีฟเวอร์",
    image: require("@/assets/images/golden1.png"),
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FEF3C7", // ✅ พื้นหลังใหม่
  },

  container: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingHorizontal: 20,
  },

  // ===== Header =====
  headerBox: {
    width: "100%",
    height: 80,
    backgroundColor: "#FFFFFF", // ✅ เปลี่ยนเป็นขาว
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 28,
  },

  headerText: {
    fontSize: 26,
    color: "#111",
    fontFamily: "Itim_400Regular",
  },

  // ===== Result Card =====
  resultCard: {
    width: "100%",
    backgroundColor: "#FFFFFF", // ✅ เปลี่ยนเป็นขาว
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#D1D5DB",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 16,
    marginBottom: 28,
  },

  resultTitle: {
    fontSize: 24,
    color: "#222",
    textAlign: "center",
    fontFamily: "Itim_400Regular",
    marginBottom: 12,
  },

  dogImage: {
    width: 200,
    height: 200,
    marginBottom: 12,
  },

  recommendTextWrap: {
    alignItems: "center",
  },

  recommendText: {
    fontSize: 22,
    color: "#222",
    fontFamily: "Itim_400Regular",
  },

  breedText: {
    fontSize: 22,
    color: "#222",
    fontFamily: "Itim_400Regular",
  },

  // ===== Button =====
  primaryButton: {
    width: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  primaryButtonText: {
    fontSize: 22,
    color: "#FFF",
    fontFamily: "Itim_400Regular",
  },

  retryButton: {
    paddingVertical: 6,
  },

  retryText: {
    fontSize: 18,
    color: "#6B7280",
    fontFamily: "Itim_400Regular",
  },
});
