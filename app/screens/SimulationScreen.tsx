// app/screens/SimulationScreen.tsx

import { getAgeDataByAge } from "@/app/data/dogAges";
import {
  getCurrentAge,
  getCurrentDay,
  isGameCompleted,
} from "@/app/services/gameService";
import {
  getQuestionsForAge,
  submitAnswer,
} from "@/app/services/questionService";
import type { AgeQuestion } from "@/app/types";
import { ThemedText } from "@/components/themed-text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Itim_400Regular, useFonts } from "@expo-google-fonts/itim";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");
const sw = W / 390; // scale แนวนอน
const sh = H / 844; // scale แนวตั้ง

// ===================================
// ฟังก์ชันโหลดรูปตาม breedPrefix + age
// ===================================
const getDogImage = (breedPrefix: string, ageNumber: string) => {
  const imageName = `${breedPrefix}${ageNumber}`;

  try {
    switch (imageName) {
      // Golden Retriever
      case "golden1":
        return require("@/assets/images/golden1.png");
      case "golden2":
        return require("@/assets/images/golden2.png");
      case "golden3":
        return require("@/assets/images/golden3.png");
      case "golden4":
        return require("@/assets/images/golden4.png");

      // Pomeranian
      case "pom1":
        return require("@/assets/images/pom1.png");
      case "pom2":
        return require("@/assets/images/pom2.png");
      case "pom3":
        return require("@/assets/images/pom3.png");
      case "pom4":
        return require("@/assets/images/pom4.png");

      // Default
      default:
        console.warn(`Image not found: ${imageName}, using golden1`);
        return require("@/assets/images/golden1.png");
    }
  } catch (error) {
    console.warn(`Error loading image: ${imageName}`, error);
    return require("@/assets/images/golden1.png");
  }
};

export default function SimulationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useFonts({ Itim_400Regular });

  const gameId = (params.gameId as string) || "";
  const breedName = (params.breedName as string) || "Golden Retriever";
  const breedPrefix = (params.breedPrefix as string) || "golden";
  const startDate = (params.startDate as string) || new Date().toISOString();

  // วัน / ช่วงวัย
  const [currentDay, setCurrentDay] = useState(getCurrentDay(startDate));
  const [currentAge, setCurrentAge] = useState(getCurrentAge(startDate));
  const [ageData, setAgeData] = useState(getAgeDataByAge(currentAge));

  // ค่าสถานะ
  const [health, setHealth] = useState(100);
  const [hunger, setHunger] = useState(70);
  const [happiness, setHappiness] = useState(0);

  // ระบบอาหาร / คะแนน
  const [mealsToday, setMealsToday] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // ระบบคำถาม
  const [questions, setQuestions] = useState<AgeQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<AgeQuestion | null>(
    null,
  );
  const [showQuestion, setShowQuestion] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [playsThisAge, setPlaysThisAge] = useState(0);

  // ระบบเงิน (mock จาก database)
  const [money, setMoney] = useState(5000);
  const HOSPITAL_COST = 1000;

  // ระบบโรงพยาบาล
  const [showHospital, setShowHospital] = useState(false);

  // ระบบเฉลย
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    explanation: string;
  } | null>(null);

  // ===================================
  // 💩 ระบบ Poop
  // ===================================
  const [showPoop, setShowPoop] = useState(false);
  const [poopSpawnTime, setPoopSpawnTime] = useState<number | null>(null);

  // ===================================
  // 🍖💧 ระบบอาหาร + น้ำ
  // ===================================
  const [hasFoodInFeeder, setHasFoodInFeeder] = useState(true);
  const [hasWaterInBowl, setHasWaterInBowl] = useState(true);
  const [lastFeedTime, setLastFeedTime] = useState<number | null>(null);
  const [lastWaterTime, setLastWaterTime] = useState<number | null>(null);

  // โหลดสถานะอาหาร/น้ำ
  useEffect(() => {
    loadFoodWaterState();
  }, []);

  const loadFoodWaterState = async () => {
    try {
      const savedFeedTime = await AsyncStorage.getItem(`feed_${gameId}`);
      if (savedFeedTime) {
        const feedTime = parseInt(savedFeedTime);
        const now = Date.now();
        const diff = now - feedTime;

        if (diff < 18000000) {
          setHasFoodInFeeder(false);
          setLastFeedTime(feedTime);
        } else {
          setHasFoodInFeeder(true);
          await AsyncStorage.removeItem(`feed_${gameId}`);
        }
      }

      const savedWaterTime = await AsyncStorage.getItem(`water_${gameId}`);
      if (savedWaterTime) {
        const waterTime = parseInt(savedWaterTime);
        const now = Date.now();
        const diff = now - waterTime;

        if (diff < 10000) {
          setHasWaterInBowl(false);
          setLastWaterTime(waterTime);
        } else {
          setHasWaterInBowl(true);
          await AsyncStorage.removeItem(`water_${gameId}`);
        }
      }
    } catch (error) {
      console.error("Error loading food/water state:", error);
    }
  };

  // ตรวจสอบอาหาร/น้ำ ทุก 10 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      if (!hasFoodInFeeder && lastFeedTime) {
        const diff = now - lastFeedTime;
        if (diff >= 18000000) {
          setHasFoodInFeeder(true);
          setLastFeedTime(null);
          AsyncStorage.removeItem(`feed_${gameId}`);
        }
      }

      if (!hasWaterInBowl && lastWaterTime) {
        const diff = now - lastWaterTime;
        if (diff >= 10000) {
          setHasWaterInBowl(true);
          setLastWaterTime(null);
          AsyncStorage.removeItem(`water_${gameId}`);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [hasFoodInFeeder, hasWaterInBowl, lastFeedTime, lastWaterTime, gameId]);

  // โหลดสถานะ Poop
  useEffect(() => {
    loadPoopState();
  }, []);

  const loadPoopState = async () => {
    try {
      const savedPoopTime = await AsyncStorage.getItem(`poop_${gameId}`);
      if (savedPoopTime) {
        const spawnTime = parseInt(savedPoopTime);
        const now = Date.now();
        const diff = now - spawnTime;

        if (diff < 3600000) {
          setShowPoop(true);
          setPoopSpawnTime(spawnTime);
        } else {
          const hoursPassed = Math.floor(diff / 3600000);
          const healthLoss = Math.min(hoursPassed * 10, 100);

          setHealth((prev) => Math.max(0, prev - healthLoss));
          await AsyncStorage.removeItem(`poop_${gameId}`);

          Alert.alert("⚠️ ไม่เก็บขี้", `หัวใจลด ${healthLoss}%`);
        }
      }
    } catch (error) {
      console.error("Error loading poop state:", error);
    }
  };

  // ตรวจสอบ Poop ทุก 10 วินาที
  useEffect(() => {
    if (!showPoop || !poopSpawnTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - poopSpawnTime;

      if (diff >= 3600000) {
        setHealth((prev) => Math.max(0, prev - 10));
        setShowPoop(false);
        setPoopSpawnTime(null);
        AsyncStorage.removeItem(`poop_${gameId}`);

        Alert.alert("⚠️ ไม่เก็บขี้", "หัวใจลด 10%");
        clearInterval(interval);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [showPoop, poopSpawnTime, gameId]);

  // โหลดคำถามเมื่อเปลี่ยนวัย
  useEffect(() => {
    loadQuestionsForAge(currentAge);
  }, [currentAge]);

  const loadQuestionsForAge = async (age: string) => {
    try {
      const qs = await getQuestionsForAge(age as any);
      setQuestions(qs);

      setMealsToday(0);
      setPlaysThisAge(0);
      setHappiness(0);
      setAnsweredQuestions([]);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const showRandomQuestion = (qs: AgeQuestion[]) => {
    const unanswered = qs.filter((q) => !answeredQuestions.includes(q.id));

    if (unanswered.length > 0) {
      const randomQ = unanswered[Math.floor(Math.random() * unanswered.length)];
      setCurrentQuestion(randomQ);
      setShowQuestion(true);
    } else {
      Alert.alert("เก่งมาก!", "ตอบคำถามครบทุกข้อในวัยนี้แล้ว");
    }
  };

  const handleAnswerQuestion = async (choiceId: string) => {
    if (!currentQuestion || !gameId) {
      setShowQuestion(false);
      return;
    }

    try {
      const result = await submitAnswer(gameId, currentQuestion.id, choiceId);

      setShowQuestion(false);
      setAnsweredQuestions((prev) => [...prev, currentQuestion.id]);

      if (result.isCorrect) {
        setTotalScore((prev) => prev + result.points);
      }

      setLastResult({ isCorrect: result.isCorrect, explanation: result.explanation });
      setShowExplanation(true);
    } catch (error) {
      Alert.alert("Error", "ไม่สามารถบันทึกคำตอบได้");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newDay = getCurrentDay(startDate);
      const newAge = getCurrentAge(startDate);

      if (newDay !== currentDay) {
        setCurrentDay(newDay);
      }

      if (newAge !== currentAge) {
        if (playsThisAge < 4) {
          const healthLoss = (4 - playsThisAge) * 10;
          setHealth((prev) => Math.max(0, prev - healthLoss));

          Alert.alert(
            "⚠️ ดูแลไม่ดีพอ",
            `คุณกดลูกบอลแค่ ${playsThisAge}/4 ครั้ง\nหัวใจลด ${healthLoss}%`,
            [{ text: "รับทราบ" }],
          );
        }

        setCurrentAge(newAge);
        const newAgeData = getAgeDataByAge(newAge);
        setAgeData(newAgeData);

        Alert.alert(
          "🎉 สุนัขโตขึ้นแล้ว!",
          `ตอนนี้ ${breedName} เป็น${newAgeData.nameTh}แล้ว`,
        );
      }

      if (health <= 0) {
        clearInterval(interval);
        router.push("/screens/GameOverScreen" as any);
      }

      if (isGameCompleted(startDate)) {
        Alert.alert("จบเกม!", "คุณเลี้ยงสุนัขครบ 4 วันแล้ว ขอบคุณที่เล่น!", [
          { text: "OK", onPress: () => clearInterval(interval) },
        ]);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [
    currentDay,
    currentAge,
    startDate,
    breedName,
    playsThisAge,
    health,
    router,
  ]);

  const handleFeed = async () => {
    if (!hasFoodInFeeder) {
      Alert.alert("⚠️ ไม่มีอาหาร");
      return;
    }

    if (mealsToday >= ageData.mealsPerDay) {
      Alert.alert(
        "⚠️ ให้อาหารเกิน",
        `${ageData.nameTh} ควรกินแค่ ${ageData.mealsPerDay} มื้อต่อวัน`,
      );
      return;
    }

    setHunger((prev) => Math.min(100, prev + 20));
    setHealth((prev) => Math.min(100, prev + 5));
    setMealsToday((prev) => prev + 1);

    const now = Date.now();
    setHasFoodInFeeder(false);
    setLastFeedTime(now);
    await AsyncStorage.setItem(`feed_${gameId}`, now.toString());

    setShowPoop(true);
    setPoopSpawnTime(now);
    await AsyncStorage.setItem(`poop_${gameId}`, now.toString());

    Alert.alert("ให้อาหารแล้ว");
  };

  const handleCleanPoop = async () => {
    setShowPoop(false);
    setPoopSpawnTime(null);
    await AsyncStorage.removeItem(`poop_${gameId}`);

    Alert.alert("สะอาดแล้ว");
  };

  const handleWater = async () => {
    if (!hasWaterInBowl) {
      Alert.alert("⚠️ ไม่มีน้ำ");
      return;
    }

    setHealth((prev) => Math.min(100, prev + 10));

    const now = Date.now();
    setHasWaterInBowl(false);
    setLastWaterTime(now);
    await AsyncStorage.setItem(`water_${gameId}`, now.toString());

    Alert.alert("💧 ให้น้ำแล้ว", "หัวใจ +10%");
  };

  const handlePlay = () => {
    if (playsThisAge >= 4) {
      Alert.alert("✅ เล่นครบแล้ว", "คุณเล่นกับหมาครบ 4 ครั้งในวัยนี้แล้ว", [
        { text: "OK" },
      ]);
      return;
    }

    setHappiness((prev) => Math.min(100, prev + 25));
    setHunger((prev) => Math.max(0, prev - 10));
    setPlaysThisAge((prev) => prev + 1);

    if (questions.length > 0) {
      showRandomQuestion(questions);
    } else {
      Alert.alert("เล่นแล้ว", `ความสุข +25%`);
    }
  };

  const handleShop = () => {
    Alert.alert("ร้านค้า", "ร้านค้า (Coming Soon)");
  };

  const handleHospital = () => {
    setShowHospital(true);
  };

  const handleHospitalConfirm = () => {
    setMoney((prev) => prev - HOSPITAL_COST);
    setHealth((prev) => Math.min(100, prev + 20));
    setShowHospital(false);
  };

  const dogImage = getDogImage(breedPrefix, ageData.imageName);

  const DOG_FIXED_BOTTOM = Math.round(460 * sh);
  const DOG_CENTER_X = Math.round(214 * sw);
  const dogSizeMap: Record<string, number> = {
    "1": Math.round(120 * sw),
    "2": Math.round(188 * sw),
    "3": Math.round(224 * sw),
    "4": Math.round(224 * sw),
  };
  const dogSize = dogSizeMap[ageData.imageName] ?? Math.round(224 * sw);
  const dogDynamicStyle = {
    width: dogSize,
    height: dogSize,
    top: DOG_FIXED_BOTTOM - dogSize,
    left: DOG_CENTER_X - dogSize / 2,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Stats Bars */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.heartWrap}>
              <ThemedText style={styles.heartText}>❤️</ThemedText>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${health}%`, backgroundColor: "#FF4444" },
                ]}
              />
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={[styles.circleIcon, styles.orangeIcon]}>
              <ThemedText style={styles.iconText}>🍴</ThemedText>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${hunger}%`, backgroundColor: "#FF9800" },
                ]}
              />
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={[styles.circleIcon, styles.yellowIcon]}>
              <ThemedText style={styles.iconText}>☺️</ThemedText>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${happiness}%`, backgroundColor: "#FFD700" },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Age Badge */}
        <View style={styles.ageBadge}>
          <ThemedText style={styles.ageText}>
            ช่วงวัย : {ageData.nameTh}
          </ThemedText>
        </View>

        {/* Play Counter Badge */}
        <View style={styles.playBadge}>
          <Image
            source={require("@/assets/images/ball.png")}
            style={styles.playBadgeBall}
            resizeMode="contain"
          />
          <ThemedText style={styles.playText}>{playsThisAge}/4</ThemedText>
        </View>

        {/* Dog Image */}
        <Image
          source={dogImage}
          style={[styles.dogImage, dogDynamicStyle]}
          resizeMode="contain"
        />

        {/* 💩 Poop */}
        {showPoop && (
          <TouchableOpacity
            style={styles.poopButton}
            onPress={handleCleanPoop}
            activeOpacity={0.8}
          >
            <Image
              source={require("@/assets/images/poop.png")}
              style={styles.poopImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

        {/* 💧 Water */}
        <TouchableOpacity
          style={styles.waterButton}
          onPress={handleWater}
          activeOpacity={0.8}
        >
          <Image
            source={
              hasWaterInBowl
                ? require("@/assets/images/water1.png")
                : require("@/assets/images/water.png")
            }
            style={styles.waterImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 🍖 Food */}
        <TouchableOpacity
          style={styles.foodButton}
          onPress={handleFeed}
          activeOpacity={0.8}
        >
          <Image
            source={
              hasFoodInFeeder
                ? require("@/assets/images/feeder1.png")
                : require("@/assets/images/feeder.png")
            }
            style={styles.foodImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* ⚽ Ball */}
        <TouchableOpacity
          style={styles.ballButton}
          onPress={handlePlay}
          activeOpacity={0.8}
        >
          <Image
            source={require("@/assets/images/ball.png")}
            style={styles.ballImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Question Modal */}
        {showQuestion && currentQuestion && (
          <View style={styles.questionOverlay}>
            <View style={styles.questionBackdrop} pointerEvents="none" />

            <View style={styles.questionBox}>
              <ThemedText style={styles.questionText}>
                {currentQuestion.question}
              </ThemedText>
            </View>

            <View style={styles.choicesContainer}>
              {currentQuestion.choices.map((choice) => (
                <TouchableOpacity
                  key={choice.id}
                  style={styles.choiceButton}
                  activeOpacity={0.85}
                  onPress={() => handleAnswerQuestion(choice.id)}
                >
                  <ThemedText style={styles.choiceText}>
                    {choice.text}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Explanation Overlay */}
        {showExplanation && lastResult && (
          <View style={styles.questionOverlay}>
            <View style={styles.questionBackdrop} pointerEvents="none" />

            <View
              style={[
                styles.explanationTitleBox,
                lastResult.isCorrect
                  ? styles.explanationCorrect
                  : styles.explanationWrong,
              ]}
            >
              <ThemedText style={styles.explanationTitleText}>
                {lastResult.isCorrect
                  ? "ถูกต้อง!"
                  : "ยังไม่ใช่นะ ลองดูวิธีที่ถูกต้องกันเถอะ!"}
              </ThemedText>
            </View>

            <View
              style={[
                styles.explanationBox,
                lastResult.isCorrect
                  ? styles.explanationCorrect
                  : styles.explanationWrong,
              ]}
            >
              <ThemedText style={styles.explanationText}>
                {lastResult.explanation}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={styles.explanationButton}
              activeOpacity={0.85}
              onPress={() => setShowExplanation(false)}
            >
              <ThemedText style={styles.explanationButtonText}>
                กดเพื่อเลี้ยงน้องหมาต่อ
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Menu */}
        <TouchableOpacity
          style={styles.shopButton}
          onPress={handleShop}
          activeOpacity={0.85}
        >
          <ThemedText style={styles.bottomEmoji}>🏪</ThemedText>
          <ThemedText style={styles.bottomText}>ร้านค้า</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hospitalButton}
          onPress={handleHospital}
          activeOpacity={0.85}
        >
          <ThemedText style={styles.bottomEmoji}>🏥</ThemedText>
          <ThemedText style={styles.bottomText}>โรงพยาบาล</ThemedText>
        </TouchableOpacity>

        {/* Hospital Modal */}
        {showHospital && (
          <View style={styles.hospitalOverlay}>
            <View style={styles.questionBackdrop} pointerEvents="none" />

            <ImageBackground
              source={require("@/assets/images/bill.png")}
              style={styles.billBg}
              resizeMode="stretch"
            >
              <View style={styles.billContent}>
                <ThemedText style={styles.billTitle}>ใบเสร็จค่ารักษา</ThemedText>

                <View style={styles.billRow}>
                  <ThemedText style={styles.billLabel}>ยอดเงินปัจจุบัน</ThemedText>
                  <ThemedText style={styles.billValue}>{money.toLocaleString()} บาท</ThemedText>
                </View>

                <View style={styles.billRow}>
                  <ThemedText style={[styles.billLabel, { color: "#DD2E44" }]}>หักค่ารักษา</ThemedText>
                  <ThemedText style={[styles.billValue, { color: "#DD2E44" }]}>
                    -{HOSPITAL_COST.toLocaleString()} บาท
                  </ThemedText>
                </View>

                <View style={styles.billDivider} />

                <View style={styles.billRow}>
                  <ThemedText style={styles.billLabelBold}>ยอดเงินคงเหลือ</ThemedText>
                  <ThemedText style={styles.billValueBold}>
                    {(money - HOSPITAL_COST).toLocaleString()} บาท
                  </ThemedText>
                </View>
              </View>
            </ImageBackground>

            <View style={styles.hospitalButtons}>
              <TouchableOpacity
                style={styles.hospitalBtnNo}
                activeOpacity={0.85}
                onPress={() => setShowHospital(false)}
              >
                <ThemedText style={styles.hospitalBtnText}>ไม่รักษา</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.hospitalBtnYes}
                activeOpacity={0.85}
                onPress={handleHospitalConfirm}
              >
                <ThemedText style={styles.hospitalBtnText}>ตกลง</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5EDC8",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5EDC8",
    position: "relative",
    width: "100%",
    height: "100%",
    paddingTop: Platform.OS === "android" ? 8 : 0,
  },

  statsContainer: {
    position: "absolute",
    top: 50,
    left: 28,
    width: 160,
    zIndex: 5,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  heartWrap: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  heartText: {
    fontSize: 26,
    lineHeight: 28,
    fontFamily: "Itim",
  },

  circleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.8,
    borderColor: "#222",
    marginRight: 8,
  },

  orangeIcon: {
    backgroundColor: "#F2A51B",
  },

  yellowIcon: {
    backgroundColor: "#F5DE3C",
  },

  iconText: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: "Itim",
  },

  barTrack: {
    width: 128,
    height: 14,
    backgroundColor: "#D9D9D9",
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#1F1F1F",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 12,
  },

  ageBadge: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#F4CF2E",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 156,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  ageText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    fontFamily: "Itim",
  },

  playBadge: {
    position: "absolute",
    top: 90,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    zIndex: 5,
  },

  playBadgeBall: {
    width: 18,
    height: 18,
  },

  playText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
    fontFamily: "Itim",
  },

  dogImage: {
    position: "absolute",
    width: 178,
    height: 178,
    left: 125,
    top: 330,
  },

  poopButton: {
    position: "absolute",
    left: Math.round(290 * sw),
    top: Math.round(448 * sh),
    zIndex: 1,
  },

  poopImage: {
    width: Math.round(42 * sw),
    height: Math.round(42 * sw),
  },

  waterButton: {
    position: "absolute",
    left: Math.round(62 * sw),
    top: Math.round(465 * sh),
  },

  waterImage: {
    width: Math.round(78 * sw),
    height: Math.round(78 * sw),
  },

  foodButton: {
    position: "absolute",
    left: Math.round(122 * sw),
    top: Math.round(492 * sh),
  },

  foodImage: {
    width: Math.round(86 * sw),
    height: Math.round(86 * sw),
  },

  ballButton: {
    position: "absolute",
    left: Math.round(255 * sw),
    top: Math.round(509 * sh),
  },

  ballImage: {
    width: Math.round(38 * sw),
    height: Math.round(38 * sw),
  },

  questionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 20,
  },

  questionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 20,
  },

  questionBox: {
    width: "84%",
    backgroundColor: "#F7F7F7",
    borderRadius: 34,
    paddingHorizontal: 26,
    paddingVertical: 34,
    borderWidth: 3,
    borderColor: "#D7D7D7",
    marginTop: 210,
    marginBottom: 20,
    zIndex: 21,
  },

  questionText: {
    fontSize: 17,
    lineHeight: 42,
    textAlign: "center",
    color: "#5F6368",
    fontWeight: "700",
    fontFamily: "Itim",
  },

  choicesContainer: {
    width: "84%",
    alignItems: "center",
    gap: 18,
    zIndex: 21,
  },

  choiceButton: {
    width: "100%",
    minHeight: 84,
    backgroundColor: "#F8F8F8",
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "#D1D5DB",
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  choiceText: {
    fontSize: 15,
    lineHeight: 32,
    textAlign: "center",
    color: "#6B7280",
    fontWeight: "700",
    fontFamily: "Itim",
  },

  shopButton: {
    position: "absolute",
    left: 98,
    bottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  hospitalButton: {
    position: "absolute",
    right: 62,
    bottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomEmoji: {
    fontSize: 54,
    lineHeight: 58,
    marginBottom: 6,
    fontFamily: "Itim",
  },

  bottomText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    fontFamily: "Itim",
  },

  // ===== Explanation Overlay =====
  explanationTitleBox: {
    width: "84%",
    borderRadius: 34,
    paddingHorizontal: 26,
    paddingVertical: 22,
    borderWidth: 3,
    marginTop: 180,
    marginBottom: 16,
    zIndex: 21,
    alignItems: "center",
  },

  explanationTitleText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Itim",
    color: "#1F2A44",
    textAlign: "center",
  },

  explanationBox: {
    width: "84%",
    borderRadius: 34,
    paddingHorizontal: 26,
    paddingVertical: 24,
    borderWidth: 3,
    marginBottom: 20,
    zIndex: 21,
    alignItems: "center",
  },

  explanationText: {
    fontSize: 16,
    lineHeight: 34,
    textAlign: "center",
    color: "#1F2A44",
    fontFamily: "Itim",
  },

  explanationCorrect: {
    backgroundColor: "#B9E6B0",
    borderColor: "#7CB342",
  },

  explanationWrong: {
    backgroundColor: "#EC9191",
    borderColor: "#DD2E44",
  },

  explanationButton: {
    width: "84%",
    backgroundColor: "#FFF9C4",
    borderRadius: 34,
    borderWidth: 3,
    borderColor: "#F29A17",
    paddingVertical: 20,
    alignItems: "center",
    zIndex: 21,
  },

  explanationButtonText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Itim",
    color: "#1F2A44",
  },

  // ===== Hospital Modal =====
  hospitalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  billBg: {
    width: W * 0.82,
    height: Math.round(W * 0.82 * 1.55),
    zIndex: 21,
    justifyContent: "flex-start",
    overflow: "hidden",
  },

  billContent: {
    paddingHorizontal: 45,
    paddingTop: Math.round(W * 0.82 * 1.55 * 0.18),
  },

  billTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Itim",
    color: "#1F2A44",
    textAlign: "center",
    marginBottom: 12,
  },

  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  billLabel: {
    fontSize: 15,
    fontFamily: "Itim",
    color: "#333",
  },

  billLabelBold: {
    fontSize: 16,
    fontFamily: "Itim",
    fontWeight: "700",
    color: "#1F2A44",
  },

  billValue: {
    fontSize: 15,
    fontFamily: "Itim",
    color: "#333",
  },

  billValueBold: {
    fontSize: 16,
    fontFamily: "Itim",
    fontWeight: "700",
    color: "#1F2A44",
  },

  billDivider: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#AAA",
    marginVertical: 8,
  },

  hospitalButtons: {
    flexDirection: "row",
    gap: 14,
    marginTop: 20,
    paddingHorizontal: 24,
    width: W * 0.82,
    zIndex: 21,
  },

  hospitalBtnNo: {
    flex: 1,
    backgroundColor: "#DD2E44",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },

  hospitalBtnYes: {
    flex: 1,
    backgroundColor: "#8DD67F",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
  },

  hospitalBtnText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Itim",
    color: "#FFFFFF",
  },
});
