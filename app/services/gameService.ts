// app/services/gameService.ts

import { getAgeDataByDay } from "@/app/data/dogAges";
import { DogAge, GameState } from "@/app/types";

/**
 * คำนวณว่าผ่านมากี่วันจาก startDate
 */
export const getDaysSinceStart = (startDate: string): number => {
  const start = new Date(startDate);
  const now = new Date();

  const diffMs = now.getTime() - start.getTime();
  //const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffDays = Math.floor(diffMs / (1000 * 60));

  return diffDays;
};

/**
 * คำนวณว่าอยู่ Day ไหน (1-4)
 * Day 0 = วันที่ 1
 * Day 1 = วันที่ 2
 * Day 2 = วันที่ 3
 * Day 3+ = วันที่ 4
 */
export const getCurrentDay = (startDate: string): number => {
  const daysPassed = getDaysSinceStart(startDate);

  if (daysPassed === 0) return 1;
  if (daysPassed === 1) return 2;
  if (daysPassed === 2) return 3;
  return 4; // Day 3+ = วันที่ 4 (สุดท้าย)
};

/**
 * คำนวณวัยปัจจุบัน
 */
export const getCurrentAge = (startDate: string): DogAge => {
  const currentDay = getCurrentDay(startDate);
  const ageData = getAgeDataByDay(currentDay);
  return ageData.age;
};

/**
 * ตรวจสอบว่าเกมจบหรือยัง (วันที่ 4 ผ่านไป 1 วันเต็ม)
 */
export const isGameCompleted = (startDate: string): boolean => {
  const daysPassed = getDaysSinceStart(startDate);
  return daysPassed >= 4; // วันที่ 5 เป็นต้นไป = จบ
};

/**
 * สร้าง GameState ใหม่
 */
export const createNewGame = (
  breedId: string,
  breedName: string,
  breedPrefix: string,
): GameState => {
  const now = new Date().toISOString();

  return {
    id: `game_${Date.now()}`,
    breedId,
    breedName,
    breedPrefix,
    startDate: now,
    currentDay: 1,
    currentAge: "puppy",
    health: 100,
    hunger: 100,
    happiness: 100,
    money: 1000,
    mealsToday: 0,
    answeredQuestions: [],
    totalScore: 0,
    dayScores: [],
  };
};

/**
 * อัปเดต GameState ตามวันเวลาปัจจุบัน
 */
export const updateGameState = (gameState: GameState): GameState => {
  const currentDay = getCurrentDay(gameState.startDate);
  const currentAge = getCurrentAge(gameState.startDate);

  return {
    ...gameState,
    currentDay,
    currentAge,
  };
};

/**
 * รีเซ็ตมื้ออาหารเมื่อเปลี่ยนวัน
 */
export const resetDailyMeals = (gameState: GameState): GameState => {
  return {
    ...gameState,
    mealsToday: 0,
  };
};

/**
 * เพิ่มคะแนนจากการตอบคำถาม
 */
export const addQuestionScore = (
  gameState: GameState,
  questionId: string,
  points: number,
): GameState => {
  return {
    ...gameState,
    answeredQuestions: [...gameState.answeredQuestions, questionId],
    totalScore: gameState.totalScore + points,
  };
};

/**
 * อัปเดตคะแนนประจำวัน
 */
export const updateDayScore = (
  gameState: GameState,
  day: number,
  questionScore: number,
  feedingScore: number,
  healthScore: number,
): GameState => {
  const totalScore = questionScore + feedingScore + healthScore;

  const newDayScore = {
    day,
    age: getCurrentAge(gameState.startDate),
    questionScore,
    feedingScore,
    healthScore,
    totalScore,
  };

  // ลบคะแนนวันเดิม (ถ้ามี) แล้วเพิ่มใหม่
  const dayScores = gameState.dayScores.filter((s) => s.day !== day);

  return {
    ...gameState,
    dayScores: [...dayScores, newDayScore],
  };
};

/**
 * คำนวณคะแนนรวมทั้งหมด
 */
export const calculateTotalScore = (gameState: GameState): number => {
  return gameState.dayScores.reduce(
    (sum, dayScore) => sum + dayScore.totalScore,
    0,
  );
};
