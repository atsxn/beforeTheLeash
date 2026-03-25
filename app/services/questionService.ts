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
): Promise<{ isCorrect: boolean; points: number }> => {
  // TODO: เรียก API จริง
  // const response = await fetch(`${API_URL}/games/${gameId}/answers`, {
  //   method: 'POST',
  //   body: JSON.stringify({ question_id: questionId, choice_id: choiceId })
  // });
  // return response.json();

  // Mock: ตรวจคำตอบ
  const question = mockQuestions.find((q) => q.id === questionId);
  if (!question) return { isCorrect: false, points: 0 };

  const isCorrect = question.correctChoiceId === choiceId;
  return {
    isCorrect,
    points: isCorrect ? question.points : 0,
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
  },
];
