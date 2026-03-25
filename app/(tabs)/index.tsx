// app/(tabs)/index.tsx

import { ThemedText } from "@/components/themed-text";
import { Itim_400Regular, useFonts } from "@expo-google-fonts/itim";
import { useRouter } from "expo-router";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Itim_400Regular,
  });

  if (!fontsLoaded) return null;

  const handleStartAssessment = () => {
    router.push("/screens/AssessmentScreen" as any);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleStartAssessment}
      activeOpacity={1}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.header}>
          <ThemedText style={styles.beforeText}>Before</ThemedText>

          <View style={styles.leashWrapper}>
            <ThemedText style={styles.leashText}>the Leash</ThemedText>
            <View style={styles.leashUnderline} />
          </View>
        </View>
      </View>

      {/* Dog */}
      <View style={styles.centerSection}>
        <Image
          source={require("@/assets/images/golden1.png")}
          style={styles.dogImage}
          resizeMode="contain"
        />
      </View>

      {/* Footer */}
      <View style={styles.footerSection}>
        <ThemedText style={styles.touchText}>Touch to start!</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EDC8",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 36 : 20,
  },

  headerSection: {
    width: "100%",
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 90,
  },

  header: {
    alignItems: "center",
  },

  beforeText: {
    fontSize: 50,
    lineHeight: 58,
    fontWeight: "600",
    color: "#1F2A44",
    marginBottom: 8,
    fontFamily: "Itim_400Regular",
  },

  leashWrapper: {
    alignItems: "center",
  },

  leashText: {
    fontSize: 58,
    lineHeight: 66,
    fontWeight: "700",
    color: "#F29A17",
    fontFamily: "Itim_400Regular",
  },

  leashUnderline: {
    width: 250,
    height: 6,
    backgroundColor: "#F29A17",
    borderRadius: 999,
    marginTop: -2,
    transform: [{ rotate: "-2deg" }],
  },

  centerSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },

  dogImage: {
    width: 210,
    height: 210,
  },

  footerSection: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 95,
    paddingBottom: Platform.OS === "ios" ? 70 : 40,
  },

  touchText: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
    color: "#1F2A44",
    fontFamily: "Itim_400Regular",
  },
});
