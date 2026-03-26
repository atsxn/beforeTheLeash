// app/screens/GameOverScreen.tsx

import { ThemedText } from "@/components/themed-text";
import { Itim_400Regular, useFonts } from "@expo-google-fonts/itim";
import { useRouter } from "expo-router";
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function GameOverScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Itim_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top */}
        <View style={styles.topRow}>
          <View style={styles.heartStatRow}>
            <ThemedText style={styles.heartEmoji}>❤️</ThemedText>
            <View style={styles.emptyStatBar} />
          </View>

          <View style={styles.deadBadge}>
            <ThemedText style={styles.deadBadgeText}>เสียชีวิต</ThemedText>
          </View>
        </View>

        {/* RIP */}
        <View style={styles.imageWrapper}>
          <Image
            source={require("@/assets/images/rip.png")}
            style={styles.ripImage}
            resizeMode="contain"
          />
        </View>

        {/* Message */}
        <View style={styles.messageBox}>
          <ThemedText style={styles.messageTextTop}>
            เป็นเจ้าของที่ดีไม่ใช่เรื่องง่ายๆเลย...
          </ThemedText>
          <ThemedText style={styles.messageTextBottom}>
            มาพยายามกันใหม่อีกครั้งนะ!
          </ThemedText>
        </View>

        {/* Retry */}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.push("/" as any)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.retryText}>
            เลี้ยงน้องหมาใหม่อีกครั้ง
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#4F5058",
  },

  container: {
    flex: 1,
    backgroundColor: "#4F5058",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 16,
    alignItems: "center",
  },

  // ================= TOP =================

  topRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  heartStatRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  heartEmoji: {
    fontSize: 30,
    marginRight: 6,
    fontFamily: "Itim_400Regular",
  },

  emptyStatBar: {
    width: 80,
    height: 14,
    backgroundColor: "#98A1BA",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#22252E",
  },

  deadBadge: {
    backgroundColor: "#F0D76B",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },

  deadBadgeText: {
    fontSize: 18,
    color: "#111",
    fontFamily: "Itim_400Regular",
  },

  // ================= RIP =================

  imageWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  ripImage: {
    width: 260,
    height: 260,
  },

  // ================= MESSAGE =================

  messageBox: {
    width: "100%",
    backgroundColor: "#EFE5B8",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#E69A2D",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 24,
  },

  messageTextTop: {
    fontSize: 16,
    textAlign: "center",
    color: "#5B5B5B",
    fontFamily: "Itim_400Regular",
    marginBottom: 6,
  },

  messageTextBottom: {
    fontSize: 15,
    textAlign: "center",
    color: "#5B5B5B",
    fontFamily: "Itim_400Regular",
  },

  // ================= RETRY =================

  retryButton: {
    marginBottom: Platform.OS === "ios" ? 30 : 20,
  },

  retryText: {
    fontSize: 22,
    color: "#F2A533",
    textDecorationLine: "underline",
    fontFamily: "Itim_400Regular",
  },
});
