// app/data/assessmentQuestions.ts

/**
 * Dog Ownership Readiness Assessment - 15 Questions
 *
 * Based on research and guidelines from:
 * - ASPCA (American Society for the Prevention of Cruelty to Animals)
 * - AKC (American Kennel Club) Breed Selection Standards
 * - The Humane Society of the United States
 * - Canine Behavioral Assessment & Research Society (CBARQ)
 * - Thai Veterinary Medical Association cost estimates (2024)
 *
 * Assessment covers 7 key areas:
 * 1. Living Space & Environment
 * 2. Financial Capability
 * 3. Time Commitment
 * 4. Activity Level & Lifestyle
 * 5. Experience & Knowledge
 * 6. Grooming Commitment
 * 7. Social Environment & Purpose
 *
 * Scoring System:
 * - Small dogs: Best for limited space, lower activity, first-time owners
 * - Medium dogs: Balanced requirements, moderate activity
 * - Large dogs: Need space, high activity, experienced owners
 */

export interface AssessmentQuestion {
  id: string;
  question: string;
  category: string;
  choices: AssessmentChoice[];
}

export interface AssessmentChoice {
  id: string;
  text: string;
  scores: {
    small: number;
    medium: number;
    large: number;
  };
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // ========================================
  // CATEGORY 1: LIVING SPACE (3 questions)
  // Based on: ASPCA Housing Guidelines
  // ========================================

  {
    id: "q1",
    question: "ขนาดพื้นที่ภายในบ้าน/ห้องของคุณเป็นเท่าไหร่?",
    category: "Living Space",
    choices: [
      {
        id: "q1_c1",
        text: "น้อยกว่า 30 ตร.ม. (คอนโดสตูดิโอ)",
        scores: { small: 10, medium: 2, large: 0 },
      },
      {
        id: "q1_c2",
        text: "30-50 ตร.ม. (คอนโด 1 ห้องนอน)",
        scores: { small: 10, medium: 7, large: 3 },
      },
      {
        id: "q1_c3",
        text: "50-80 ตร.ม. (คอนโด/บ้าน 2 ห้องนอน)",
        scores: { small: 8, medium: 10, large: 6 },
      },
      {
        id: "q1_c4",
        text: "มากกว่า 80 ตร.ม. (บ้านขนาดใหญ่)",
        scores: { small: 7, medium: 10, large: 10 },
      },
    ],
  },

  {
    id: "q2",
    question: "คุณมีพื้นที่กลางแจ้งส่วนตัวหรือไม่?",
    category: "Living Space",
    choices: [
      {
        id: "q2_c1",
        text: "ไม่มีเลย (อาคารสูง/คอนโด)",
        scores: { small: 10, medium: 5, large: 1 },
      },
      {
        id: "q2_c2",
        text: "มีระเบียง/บัลโคนี",
        scores: { small: 10, medium: 7, large: 3 },
      },
      {
        id: "q2_c3",
        text: "มีลานเล็ก ๆ หรือสนามหญ้าเล็ก",
        scores: { small: 8, medium: 10, large: 7 },
      },
      {
        id: "q2_c4",
        text: "มีสนามหญ้า/สวนขนาดใหญ่",
        scores: { small: 6, medium: 10, large: 10 },
      },
    ],
  },

  {
    id: "q3",
    question: "กฎระเบียบของที่พักอาศัยเกี่ยวกับสัตว์เลี้ยง",
    category: "Living Space",
    choices: [
      {
        id: "q3_c1",
        text: "จำกัดขนาดสุนัข (เฉพาะสุนัขเล็ก)",
        scores: { small: 10, medium: 2, large: 0 },
      },
      {
        id: "q3_c2",
        text: "จำกัดน้ำหนัก (ไม่เกิน 15 กก.)",
        scores: { small: 10, medium: 8, large: 0 },
      },
      {
        id: "q3_c3",
        text: "อนุญาตทุกขนาด แต่ห้ามเสียงดัง",
        scores: { small: 9, medium: 8, large: 5 },
      },
      {
        id: "q3_c4",
        text: "ไม่มีข้อจำกัด",
        scores: { small: 8, medium: 10, large: 10 },
      },
    ],
  },

  // ========================================
  // CATEGORY 2: FINANCIAL (3 questions)
  // Based on: ASPCA Cost Calculator + Thai Vet Prices
  // ========================================

  {
    id: "q4",
    question: "รายได้ต่อเดือนของคุณอยู่ในช่วงไหน?",
    category: "Financial",
    choices: [
      {
        id: "q4_c1",
        text: "ต่ำกว่า 15,000 บาท",
        scores: { small: 7, medium: 2, large: 0 },
      },
      {
        id: "q4_c2",
        text: "15,000 - 25,000 บาท",
        scores: { small: 10, medium: 6, large: 2 },
      },
      {
        id: "q4_c3",
        text: "25,000 - 40,000 บาท",
        scores: { small: 10, medium: 10, large: 6 },
      },
      {
        id: "q4_c4",
        text: "มากกว่า 40,000 บาท",
        scores: { small: 9, medium: 10, large: 10 },
      },
    ],
  },

  {
    id: "q5",
    question: "คุณพร้อมใช้เงินเท่าไหร่ต่อเดือนกับสุนัข? (อาหาร ยา ดูแลสุขภาพ)",
    category: "Financial",
    choices: [
      {
        id: "q5_c1",
        text: "ต่ำกว่า 2,000 บาท/เดือน",
        scores: { small: 8, medium: 3, large: 0 },
      },
      {
        id: "q5_c2",
        text: "2,000 - 3,500 บาท/เดือน",
        scores: { small: 10, medium: 8, large: 4 },
      },
      {
        id: "q5_c3",
        text: "3,500 - 5,000 บาท/เดือน",
        scores: { small: 10, medium: 10, large: 8 },
      },
      {
        id: "q5_c4",
        text: "มากกว่า 5,000 บาท/เดือน",
        scores: { small: 9, medium: 10, large: 10 },
      },
    ],
  },

  {
    id: "q6",
    question: "คุณมีเงินสำรองฉุกเฉินสำหรับค่ารักษาสุนัขหรือไม่?",
    category: "Financial",
    choices: [
      {
        id: "q6_c1",
        text: "ไม่มี ต้องกู้ถ้ามีเหตุฉุกเฉิน",
        scores: { small: 6, medium: 2, large: 0 },
      },
      {
        id: "q6_c2",
        text: "มีประมาณ 5,000-10,000 บาท",
        scores: { small: 10, medium: 7, large: 3 },
      },
      {
        id: "q6_c3",
        text: "มี 10,000-30,000 บาท",
        scores: { small: 10, medium: 10, large: 8 },
      },
      {
        id: "q6_c4",
        text: "มีมากกว่า 30,000 บาท หรือมีประกันสัตว์เลี้ยง",
        scores: { small: 9, medium: 10, large: 10 },
      },
    ],
  },

  // ========================================
  // CATEGORY 3: TIME COMMITMENT (3 questions)
  // Based on: The Humane Society Guidelines
  // ========================================

  {
    id: "q7",
    question: "คุณมีเวลาว่างให้กับสุนัขได้กี่ชั่วโมงต่อวัน?",
    category: "Time",
    choices: [
      {
        id: "q7_c1",
        text: "น้อยกว่า 1 ชั่วโมง",
        scores: { small: 6, medium: 2, large: 0 },
      },
      {
        id: "q7_c2",
        text: "1-2 ชั่วโมง",
        scores: { small: 10, medium: 6, large: 3 },
      },
      {
        id: "q7_c3",
        text: "2-4 ชั่วโมง",
        scores: { small: 10, medium: 10, large: 7 },
      },
      {
        id: "q7_c4",
        text: "มากกว่า 4 ชั่วโมง",
        scores: { small: 8, medium: 10, large: 10 },
      },
    ],
  },

  {
    id: "q8",
    question: "คุณออกจากบ้านนานแค่ไหนในแต่ละวัน?",
    category: "Time",
    choices: [
      {
        id: "q8_c1",
        text: "มากกว่า 10 ชั่วโมง (ทำงานเต็มวัน + เดินทางไกล)",
        scores: { small: 5, medium: 2, large: 0 },
      },
      {
        id: "q8_c2",
        text: "8-10 ชั่วโมง (ทำงานปกติ)",
        scores: { small: 9, medium: 6, large: 3 },
      },
      {
        id: "q8_c3",
        text: "4-8 ชั่วโมง (ทำงานครึ่งวัน/ทำที่บ้าน)",
        scores: { small: 10, medium: 10, large: 7 },
      },
      {
        id: "q8_c4",
        text: "น้อยกว่า 4 ชั่วโมง (อยู่บ้านเกือบทั้งวัน)",
        scores: { small: 10, medium: 10, large: 10 },
      },
    ],
  },

  {
    id: "q9",
    question: "คุณพร้อมพาสุนัขไปออกกำลังกาย/เดินเล่นบ่อยแค่ไหน?",
    category: "Time",
    choices: [
      {
        id: "q9_c1",
        text: "2-3 ครั้งต่อสัปดาห์",
        scores: { small: 9, medium: 4, large: 1 },
      },
      {
        id: "q9_c2",
        text: "วันละครั้ง (15-30 นาที)",
        scores: { small: 10, medium: 8, large: 4 },
      },
      {
        id: "q9_c3",
        text: "วันละ 2 ครั้ง (30-60 นาที/ครั้ง)",
        scores: { small: 8, medium: 10, large: 8 },
      },
      {
        id: "q9_c4",
        text: "หลายครั้งต่อวัน (มากกว่า 2 ชั่วโมงรวม)",
        scores: { small: 6, medium: 10, large: 10 },
      },
    ],
  },

  // ========================================
  // CATEGORY 4: LIFESTYLE & ACTIVITY (2 questions)
  // Based on: AKC Energy Level Matching
  // ========================================

  {
    id: "q10",
    question: "ระดับพลังงานและไลฟ์สไตล์ของคุณเป็นอย่างไร?",
    category: "Lifestyle",
    choices: [
      {
        id: "q10_c1",
        text: "ชอบอยู่บ้าน ดูหนัง อ่านหนังสือ ไม่ค่อยเคลื่อนไหว",
        scores: { small: 10, medium: 5, large: 2 },
      },
      {
        id: "q10_c2",
        text: "ออกกำลังกายเป็นครั้งคราว เดินเล่นสวนสาธารณะ",
        scores: { small: 9, medium: 9, large: 5 },
      },
      {
        id: "q10_c3",
        text: "ออกกำลังกายบ่อย วิ่ง ปั่นจักรยาน",
        scores: { small: 6, medium: 10, large: 9 },
      },
      {
        id: "q10_c4",
        text: "มีพลังงานสูง ชอบกิจกรรมกลางแจ้ง เดินป่า ปีนเขา",
        scores: { small: 3, medium: 8, large: 10 },
      },
    ],
  },

  {
    id: "q11",
    question: "คุณเดินทางหรือไปต่างจังหวัดบ่อยแค่ไหน?",
    category: "Lifestyle",
    choices: [
      {
        id: "q11_c1",
        text: "บ่อยมาก (เดือนละหลายครั้ง)",
        scores: { small: 8, medium: 4, large: 2 },
      },
      {
        id: "q11_c2",
        text: "ค่อนข้างบ่อย (เดือนละ 1-2 ครั้ง)",
        scores: { small: 10, medium: 7, large: 4 },
      },
      {
        id: "q11_c3",
        text: "นาน ๆ ครั้ง (2-3 เดือนครั้ง)",
        scores: { small: 10, medium: 10, large: 8 },
      },
      {
        id: "q11_c4",
        text: "แทบไม่เดินทางเลย",
        scores: { small: 9, medium: 10, large: 10 },
      },
    ],
  },

  // ========================================
  // CATEGORY 5: EXPERIENCE (2 questions)
  // Based on: First-Time Owner Guidelines
  // ========================================

  {
    id: "q12",
    question: "คุณมีประสบการณ์การเลี้ยงสุนัขหรือไม่?",
    category: "Experience",
    choices: [
      {
        id: "q12_c1",
        text: "ไม่เคยเลย นี่จะเป็นครั้งแรก",
        scores: { small: 10, medium: 5, large: 1 },
      },
      {
        id: "q12_c2",
        text: "เคยเลี้ยงสัตว์อื่น (แมว นก ปลา)",
        scores: { small: 10, medium: 7, large: 3 },
      },
      {
        id: "q12_c3",
        text: "เคยเลี้ยงสุนัขเล็ก-กลาง",
        scores: { small: 10, medium: 10, large: 6 },
      },
      {
        id: "q12_c4",
        text: "เคยเลี้ยงสุนัขหลายขนาด มีประสบการณ์มาก",
        scores: { small: 10, medium: 10, large: 10 },
      },
    ],
  },

  {
    id: "q13",
    question: "คุณมีความรู้เกี่ยวกับการฝึกสุนัขมากน้อยแค่ไหน?",
    category: "Experience",
    choices: [
      {
        id: "q13_c1",
        text: "ไม่มีเลย ไม่เคยฝึกสุนัข",
        scores: { small: 10, medium: 6, large: 2 },
      },
      {
        id: "q13_c2",
        text: "มีพื้นฐาน รู้จักคำสั่งง่าย ๆ (นั่ง นอน)",
        scores: { small: 10, medium: 9, large: 5 },
      },
      {
        id: "q13_c3",
        text: "ค่อนข้างมาก เคยฝึกสุนัขหลายตัว",
        scores: { small: 10, medium: 10, large: 8 },
      },
      {
        id: "q13_c4",
        text: "เชี่ยวชาญ เคยเข้าคอร์สฝึกสุนัข",
        scores: { small: 9, medium: 10, large: 10 },
      },
    ],
  },

  // ========================================
  // CATEGORY 6: GROOMING (2 questions)
  // Based on: Breed Maintenance Requirements
  // ========================================

  {
    id: "q14",
    question: "คุณพร้อมดูแลขน แปรง และอาบน้ำสุนัขบ่อยแค่ไหน?",
    category: "Grooming",
    choices: [
      {
        id: "q14_c1",
        text: "น้อยที่สุด (เดือนละครั้ง พาไปร้าน)",
        scores: { small: 8, medium: 6, large: 8 },
      },
      {
        id: "q14_c2",
        text: "ปานกลาง (สัปดาห์ละ 1-2 ครั้ง)",
        scores: { small: 10, medium: 9, large: 7 },
      },
      {
        id: "q14_c3",
        text: "บ่อย (แทบทุกวัน แปรงขน)",
        scores: { small: 9, medium: 10, large: 9 },
      },
      {
        id: "q14_c4",
        text: "พร้อมดูแลเต็มที่ทุกวัน",
        scores: { small: 8, medium: 10, large: 10 },
      },
    ],
  },

  {
    id: "q15",
    question: "คุณรับได้กับขนหลุดในบ้านมากน้อยแค่ไหน?",
    category: "Grooming",
    choices: [
      {
        id: "q15_c1",
        text: "ไม่ได้เลย ต้องการสุนัขขนสั้น/ไม่ผลัดขน",
        scores: { small: 10, medium: 7, large: 5 },
      },
      {
        id: "q15_c2",
        text: "รับได้นิดหน่อย ถ้าไม่มากเกินไป",
        scores: { small: 10, medium: 9, large: 6 },
      },
      {
        id: "q15_c3",
        text: "รับได้ ดูดฝุ่นเป็นประจำก็ไม่เป็นไร",
        scores: { small: 8, medium: 10, large: 9 },
      },
      {
        id: "q15_c4",
        text: "ไม่เป็นปัญหาเลย",
        scores: { small: 7, medium: 10, large: 10 },
      },
    ],
  },
];

export default assessmentQuestions;
