// app/services/mockData.ts

import { dogBreedsData } from "@/app/data/dogBreeds";
import type { AgeQuestion, DogBreed, GameState } from "@/app/types";

/**
 * Mock Data Service
 * - ใช้ในขณะที่ยังไม่มี Backend/Database
 * - เมื่อมี Backend แล้ว → แก้ไขไฟล์นี้เพียงไฟล์เดียว
 */
export class MockDataService {
  // ===================================
  // DOG BREEDS
  // ===================================

  /**
   * ดึงข้อมูลสายพันธุ์ทั้งหมด
   */
  static async getBreeds(): Promise<DogBreed[]> {
    // จำลอง network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return dogBreedsData;
  }

  /**
   * ดึงข้อมูลสายพันธุ์ตาม ID
   */
  static async getBreedById(id: string): Promise<DogBreed | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return dogBreedsData.find((breed) => breed.id === id) || null;
  }

  // ===================================
  // GAME STATE (สำหรับอนาคต)
  // ===================================

  /**
   * บันทึก GameState
   * TODO: เปลี่ยนเป็น database.insert() เมื่อมี Backend
   */
  static async saveGameState(game: GameState): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("💾 [MOCK] Saved game state:", game);

    // TODO: เปลี่ยนเป็น
    // await fetch(`${API_URL}/games`, {
    //   method: 'POST',
    //   body: JSON.stringify(game)
    // });

    return true;
  }

  /**
   * ดึง GameState ตาม ID
   * TODO: เปลี่ยนเป็น database.select() เมื่อมี Backend
   */
  static async getGameState(gameId: string): Promise<GameState | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("📖 [MOCK] Getting game state:", gameId);

    // TODO: เปลี่ยนเป็น
    // const response = await fetch(`${API_URL}/games/${gameId}`);
    // return response.json();

    return null;
  }

  /**
   * อัปเดต GameState
   * TODO: เปลี่ยนเป็น database.update() เมื่อมี Backend
   */
  static async updateGameState(
    gameId: string,
    updates: Partial<GameState>,
  ): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("🔄 [MOCK] Updated game state:", gameId, updates);

    // TODO: เปลี่ยนเป็น
    // await fetch(`${API_URL}/games/${gameId}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify(updates)
    // });

    return true;
  }

  // ===================================
  // QUESTIONS (สำหรับอนาคต)
  // ===================================

  /**
   * ดึงคำถามตามวัย
   * TODO: เปลี่ยนเป็น database.select() เมื่อมี Backend
   */
  static async getQuestionsByAge(age: string): Promise<AgeQuestion[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("📖 [MOCK] Getting questions for age:", age);

    // TODO: เปลี่ยนเป็น
    // const response = await fetch(`${API_URL}/questions?age=${age}`);
    // return response.json();

    return [];
  }

  /**
   * บันทึกคำตอบ
   * TODO: เปลี่ยนเป็น database.insert() เมื่อมี Backend
   */
  static async saveAnswer(
    gameId: string,
    questionId: string,
    choiceId: string,
    isCorrect: boolean,
    points: number,
  ): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("💾 [MOCK] Saved answer:", {
      gameId,
      questionId,
      choiceId,
      isCorrect,
      points,
    });

    // TODO: เปลี่ยนเป็น
    // await fetch(`${API_URL}/games/${gameId}/answers`, {
    //   method: 'POST',
    //   body: JSON.stringify({ questionId, choiceId, isCorrect, points })
    // });

    return true;
  }
}

export default MockDataService;
