// app/types/index.ts

// ============================================
// DOG BREED TYPES
// ============================================

export interface DogBreed {
  id: string;
  name: string;
  nameTh: string;
  size: "small" | "medium" | "large";
  emoji: string;
  temperament: string;
  exerciseNeeds: "low" | "medium" | "high";
  groomingNeeds: "low" | "medium" | "high";
  monthlyCost: number;
  description: string;
  healthRisks: string[];
  imagePrefix: string; // "golden" | "pom" | "shiba" ...
}

// ============================================
// DOG AGE TYPES
// ============================================

export type DogAge = "puppy" | "teen" | "adult" | "senior";

export interface DogAgeData {
  age: DogAge;
  nameTh: string; // "หมาเด็ก"
  day: number; // 1
  imageName: string; // "1", "2", "3", "4"
  description: string;
  mealsPerDay: number; // 2 หรือ 3
}

// ============================================
// GAME STATE TYPES
// ============================================

export interface GameState {
  id: string;
  userId?: string;
  breedId: string;
  breedName: string;
  breedPrefix: string; // "golden" | "pom"
  startDate: string; // ISO string "2025-03-20T12:00:00Z"
  currentDay: number; // 1-4
  currentAge: DogAge; // "puppy" | "teen" | "adult" | "senior"
  health: number; // 0-100
  hunger: number; // 0-100
  happiness: number; // 0-100
  money: number; // เงินที่เหลือ
  mealsToday: number; // มื้อที่ให้แล้ววันนี้
  answeredQuestions: string[]; // ID คำถามที่ตอบแล้ว
  totalScore: number; // คะแนนรวม
  dayScores: DayScore[]; // คะแนนแต่ละวัน
  completedAt?: string; // วันที่จบเกม
}

export interface DayScore {
  day: number;
  age: DogAge;
  questionScore: number; // คะแนนจากคำถาม
  feedingScore: number; // คะแนนจากการให้อาหาร
  healthScore: number; // คะแนนจากสุขภาพ
  totalScore: number;
}

// ============================================
// QUESTION TYPES
// ============================================

export interface AgeQuestion {
  id: string;
  age: DogAge; // "puppy" | "teen" | "adult" | "senior"
  question: string; // "ควรให้อาหารกี่มื้อต่อวัน?"
  choices: AgeQuestionChoice[]; // ตัวเลือก
  correctChoiceId: string; // ID ของคำตอบที่ถูก
  points: number; // คะแนนที่ได้ถ้าตอบถูก
}

export interface AgeQuestionChoice {
  id: string;
  text: string; // "2 มื้อ"
  isCorrect: boolean;
}

export interface QuestionAnswer {
  questionId: string;
  choiceId: string;
  isCorrect: boolean;
  points: number;
}

// ============================================
// ASSESSMENT TYPES
// ============================================

export interface UserAssessment {
  monthlyIncome: number;
  housingType: string;
  freeTimeHours: number;
  experience: string;
}

export interface AssessmentResult {
  scores: {
    small: number;
    medium: number;
    large: number;
  };
  recommendedSize: "small" | "medium" | "large";
  confidence: number;
  recommendedBreeds: DogBreed[];
}

// ============================================
// SIMULATION EVENT TYPES (สำหรับอนาคต)
// ============================================

export interface SimulationEvent {
  id: string;
  day: number;
  type: "daily" | "random" | "weather" | "health";
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  text: string;
  cost: number;
  healthImpact: number;
  happinessImpact: number;
}

export interface SimulationState {
  currentDay: number;
  totalDays: number;
  health: number;
  happiness: number;
  money: number;
  events: SimulationEvent[];
}

export interface SimulationResult {
  finalScore: number;
  healthScore: number;
  happinessScore: number;
  moneySpent: number;
  success: boolean;
  feedback: string[];
}
