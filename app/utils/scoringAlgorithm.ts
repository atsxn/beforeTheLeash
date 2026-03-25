// app/utils/scoringAlgorithm.ts

import type { AssessmentChoice } from "@/app/data/assessmentQuestions";

export interface ScoringResult {
  small: number;
  medium: number;
  large: number;
  recommendedSize: "small" | "medium" | "large";
  confidence: number;
}

export function calculateScores(choices: AssessmentChoice[]): ScoringResult {
  let totalSmall = 0;
  let totalMedium = 0;
  let totalLarge = 0;

  // รวมคะแนนทั้งหมด
  choices.forEach((choice) => {
    totalSmall += choice.scores.small;
    totalMedium += choice.scores.medium;
    totalLarge += choice.scores.large;
  });

  // คะแนนเต็ม = จำนวนคำถาม × 10 (Dynamic!)
  const maxScore = choices.length * 10;

  // แปลงเป็นเปอร์เซ็นต์
  const smallPercent = Math.round((totalSmall / maxScore) * 100);
  const mediumPercent = Math.round((totalMedium / maxScore) * 100);
  const largePercent = Math.round((totalLarge / maxScore) * 100);

  // หาคะแนนสูงสุด
  const scores = {
    small: smallPercent,
    medium: mediumPercent,
    large: largePercent,
  };

  const maxPercent = Math.max(smallPercent, mediumPercent, largePercent);

  let recommendedSize: "small" | "medium" | "large" = "small";
  if (maxPercent === mediumPercent) recommendedSize = "medium";
  if (maxPercent === largePercent) recommendedSize = "large";

  // คำนวณความมั่นใจ
  const sortedScores = [smallPercent, mediumPercent, largePercent].sort(
    (a, b) => b - a,
  );
  const scoreDifference = sortedScores[0] - sortedScores[1];
  const confidence = Math.min(100, maxPercent + scoreDifference);

  return {
    small: smallPercent,
    medium: mediumPercent,
    large: largePercent,
    recommendedSize,
    confidence,
  };
}

export function getSizeLabel(size: string): string {
  const labels: Record<string, string> = {
    small: "สุนัขขนาดเล็ก",
    medium: "สุนัขขนาดกลาง",
    large: "สุนัขขนาดใหญ่",
  };
  return labels[size] || size;
}

export function getConfidenceMessage(confidence: number): string {
  if (confidence >= 80) {
    return "เหมาะสมมาก! คุณมีความพร้อมสูงสำหรับสุนัขขนาดนี้";
  } else if (confidence >= 60) {
    return "ค่อนข้างเหมาะสม แต่ควรพิจารณาปัจจัยเพิ่มเติม";
  } else {
    return "ควรพิจารณาทบทวน อาจมีความท้าทายในการเลี้ยง";
  }
}

export function getRecommendedBreeds(
  breeds: any[],
  result: ScoringResult,
): any[] {
  return breeds
    .filter((breed) => breed.size === result.recommendedSize)
    .sort((a, b) => a.monthlyExpense - b.monthlyExpense)
    .slice(0, 3);
}
