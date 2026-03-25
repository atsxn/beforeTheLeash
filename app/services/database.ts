// ============================================
// DATABASE SERVICE - ใช้ในอนาคต
// ตอนนี้ใช้ Mock Data แทน
// ============================================

// ส่งออก Mock Service ก่อนในระหว่างนี้
import { MockDataService } from "./mockData";

export { MockDataService as DatabaseService } from "./mockData";
export default MockDataService;

// ============================================
// เมื่อพร้อมใช้ database แล้ว:
// 1. Uncomment โค้ดด้านล่าง
// 2. ติดตั้ง Drizzle + SQLite
// 3. เปลี่ยนบรรทัดด้านบนเป็น:
//    export { DatabaseService } from './database';
// ============================================

/*
import { db } from '@/app/db/client';
import { dogBreeds, users, simulations } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import type { DogBreed, UserAssessment, SimulationResult } from '@/app/types';

export class DatabaseService {
  
  // ดึงข้อมูลสายพันธุ์ทั้งหมด
  static async getBreeds(): Promise<DogBreed[]> {
    const breeds = await db.select().from(dogBreeds);
    return breeds;
  }

  // ดึงข้อมูลสายพันธุ์ตาม ID
  static async getBreedById(id: string): Promise<DogBreed | null> {
    const [breed] = await db
      .select()
      .from(dogBreeds)
      .where(eq(dogBreeds.id, parseInt(id)));
    return breed || null;
  }

  // บันทึกข้อมูล Assessment
  static async saveUserAssessment(data: UserAssessment): Promise<boolean> {
    try {
      await db.insert(users).values({
        monthlyIncome: data.monthlyIncome,
        housingType: data.housingType,
        freeTimeHours: data.freeTimeHours,
        experience: data.experience,
        createdAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Error saving assessment:', error);
      return false;
    }
  }

  // บันทึกผลการจำลอง
  static async saveSimulationResult(result: SimulationResult): Promise<boolean> {
    try {
      await db.insert(simulations).values({
        userId: 1,
        breedId: 1,
        finalScore: result.finalScore,
        healthScore: result.healthScore,
        happinessScore: result.happinessScore,
        moneySpent: result.moneySpent,
        completedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Error saving simulation:', error);
      return false;
    }
  }

  // ดึงประวัติการจำลอง
  static async getSimulationHistory(): Promise<SimulationResult[]> {
    const history = await db
      .select()
      .from(simulations)
      .orderBy(simulations.completedAt);
    
    return history.map(sim => ({
      finalScore: sim.finalScore,
      healthScore: sim.healthScore,
      happinessScore: sim.happinessScore,
      moneySpent: sim.moneySpent,
      success: sim.finalScore >= 70,
      feedback: [],
    }));
  }
}
*/
