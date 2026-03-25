// app/data/dogAges.ts

import { DogAgeData } from "@/app/types";

/**
 * ข้อมูลวัยสุนัข (ทุกพันธุ์ใช้ร่วมกัน)
 */
export const dogAgesData: DogAgeData[] = [
  {
    age: "puppy",
    nameTh: "หมาเด็ก",
    day: 1,
    imageName: "1", // ← เปลี่ยนจาก "golden1" เป็น "1"
    description: "น่ารักมาก ขี้เล่น ต้องการความเอาใจใส่สูง",
    mealsPerDay: 3,
  },
  {
    age: "teen",
    nameTh: "หมาวัยรุ่น",
    day: 2,
    imageName: "2", // ← เปลี่ยนเป็น "2"
    description: "กระตือรือร้น ซุกซน ต้องการออกกำลังกายเยอะ",
    mealsPerDay: 2,
  },
  {
    age: "adult",
    nameTh: "หมาวัยโต",
    day: 3,
    imageName: "3", // ← เปลี่ยนเป็น "3"
    description: "เชื่อฟัง สงบ เป็นผู้ใหญ่แล้ว",
    mealsPerDay: 2,
  },
  {
    age: "senior",
    nameTh: "หมาสูงอายุ",
    day: 4,
    imageName: "4", // ← เปลี่ยนเป็น "4"
    description: "อ่อนโยน ต้องการการดูแลเป็นพิเศษ",
    mealsPerDay: 3,
  },
];

// Helper functions เดิม
export const getAgeDataByDay = (day: number): DogAgeData => {
  return dogAgesData.find((d) => d.day === day) || dogAgesData[0];
};

export const getAgeDataByAge = (age: string): DogAgeData => {
  return dogAgesData.find((d) => d.age === age) || dogAgesData[0];
};
