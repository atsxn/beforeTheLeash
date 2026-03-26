// app/services/questionService.ts

import { AgeQuestion, DogAge } from "@/app/types";

/**
 * ดึงคำถามสำหรับวัยนั้น ๆ จาก API
 * (ตอนนี้ใช้ mock data ก่อน รอ backend)
 */
export const getQuestionsForAge = async (
  age: DogAge,
): Promise<AgeQuestion[]> => {
  // TODO: เรียก API จริง
  // const response = await fetch(`${API_URL}/questions?age=${age}`);
  // return response.json();

  // Mock data ชั่วคราว
  return mockQuestions.filter((q) => q.age === age);
};

/**
 * บันทึกคำตอบ
 */
export const submitAnswer = async (
  gameId: string,
  questionId: string,
  choiceId: string,
): Promise<{ isCorrect: boolean; points: number; explanation: string }> => {
  const question = mockQuestions.find((q) => q.id === questionId);
  if (!question) return { isCorrect: false, points: 0, explanation: "" };

  const isCorrect = question.correctChoiceId === choiceId;
  return {
    isCorrect,
    points: isCorrect ? question.points : 0,
    explanation: question.explanation,
  };
};

// ===================================
// Mock Data (ใช้ก่อนรอ Backend)
// ===================================

const mockQuestions: AgeQuestion[] = [
  // หมาเด็ก
  {
    id: "q1_puppy",
    age: "puppy",
    question: "หมาเด็กควรกินอาหารกี่มื้อต่อวัน?",
    choices: [
      { id: "c1", text: "2 มื้อ", isCorrect: false },
      { id: "c2", text: "3 มื้อ", isCorrect: true },
      { id: "c3", text: "4 มื้อ", isCorrect: false },
    ],
    correctChoiceId: "c2",
    points: 10,
    explanation:
      "ลูกสุนัขต้องการพลังงานสูงเพื่อการเจริญเติบโต ควรแบ่งอาหารเป็น 3 มื้อต่อวัน เพื่อให้ระบบย่อยอาหารทำงานได้อย่างเหมาะสม",
  },
  {
    id: "q2_puppy",
    age: "puppy",
    question: "หมาเด็กควรออกกำลังกายวันละกี่ครั้ง?",
    choices: [
      { id: "c1", text: "1 ครั้ง", isCorrect: false },
      { id: "c2", text: "2-3 ครั้ง", isCorrect: true },
      { id: "c3", text: "ไม่ต้อง", isCorrect: false },
    ],
    correctChoiceId: "c2",
    points: 10,
    explanation:
      "ลูกสุนัขมีพลังงานสูงและต้องการการเคลื่อนไหวหลายครั้งต่อวัน แต่ไม่ควรออกกำลังกายหนักเกินไปในครั้งเดียว การเล่น 2-3 ครั้งสั้น ๆ ดีที่สุด",
  },

  // หมาวัยรุ่น
  {
    id: "q1_teen",
    age: "teen",
    question: "หมาวัยรุ่นควรกินอาหารกี่มื้อต่อวัน?",
    choices: [
      { id: "c1", text: "2 มื้อ", isCorrect: true },
      { id: "c2", text: "3 มื้อ", isCorrect: false },
      { id: "c3", text: "4 มื้อ", isCorrect: false },
    ],
    correctChoiceId: "c1",
    points: 10,
    explanation:
      "สุนัขวัยรุ่นเริ่มมีระบบย่อยอาหารที่สมบูรณ์ขึ้น สามารถลดมื้ออาหารเหลือ 2 มื้อต่อวัน เช้าและเย็น เพื่อควบคุมน้ำหนักที่เหมาะสม",
  },

  // หมาโต
  {
    id: "q1_adult",
    age: "adult",
    question: "หมาโตควรกินอาหารกี่มื้อต่อวัน?",
    choices: [
      { id: "c1", text: "2 มื้อ", isCorrect: true },
      { id: "c2", text: "3 มื้อ", isCorrect: false },
      { id: "c3", text: "1 มื้อ", isCorrect: false },
    ],
    correctChoiceId: "c1",
    points: 10,
    explanation:
      "สุนัขโตเต็มวัยควรกิน 2 มื้อต่อวัน คือเช้าและเย็น การให้อาหารสม่ำเสมอช่วยรักษาระดับพลังงานและสุขภาพระบบย่อยอาหาร",
  },

  // สูงอายุ
  {
    id: "q1_senior",
    age: "senior",
    question: "หมาสูงอายุควรกินอาหารกี่มื้อต่อวัน?",
    choices: [
      { id: "c1", text: "2 มื้อ", isCorrect: false },
      { id: "c2", text: "3 มื้อ", isCorrect: true },
      { id: "c3", text: "1 มื้อ", isCorrect: false },
    ],
    correctChoiceId: "c2",
    points: 10,
    explanation:
      "สุนัขสูงอายุมีระบบย่อยอาหารที่อ่อนแอลง ควรแบ่งอาหารเป็น 3 มื้อเล็ก ๆ ต่อวัน เพื่อลดภาระต่อระบบย่อยและรักษาระดับน้ำตาลในเลือดให้คงที่",
  },
];
