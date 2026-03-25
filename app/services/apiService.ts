// app/services/apiService.ts

import type { DogBreed, GameState, Question } from "@/app/types";

// =====================================
// API Configuration
// =====================================
const API_BASE_URL = "http://localhost:8080/api";

// =====================================
// Breeds API
// =====================================
export const fetchBreeds = async (): Promise<DogBreed[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/breeds`);
    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to fetch breeds");
    }

    // แปลง response จาก Backend ให้ตรงกับ Frontend
    return result.data.map((breed: any) => ({
      id: breed.id_breed.toString(),
      name: breed.breeds_name,
      nameTh: breed.breeds_name,
      imagePrefix: getImagePrefixByBreedId(breed.id_breed),
      size: breed.size,
      description: `สุนัขพันธุ์ ${breed.breeds_name}`,
      goodFor: ["ครอบครัว"],
      exerciseLevel: "medium" as const,
      groomingLevel: "medium" as const,
    }));
  } catch (error) {
    console.error("Error fetching breeds:", error);
    throw error;
  }
};

export const fetchBreedById = async (id: string): Promise<DogBreed> => {
  try {
    const response = await fetch(`${API_BASE_URL}/breeds/${id}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error("Breed not found");
    }

    const breed = result.data;
    return {
      id: breed.id_breed.toString(),
      name: breed.breeds_name,
      nameTh: breed.breeds_name,
      imagePrefix: getImagePrefixByBreedId(breed.id_breed),
      size: breed.size,
      description: `สุนัขพันธุ์ ${breed.breeds_name}`,
      goodFor: ["ครอบครัว"],
      exerciseLevel: "medium" as const,
      groomingLevel: "medium" as const,
    };
  } catch (error) {
    console.error("Error fetching breed:", error);
    throw error;
  }
};

// ฟังก์ชันแปลง breed_id เป็น imagePrefix
function getImagePrefixByBreedId(breedId: number): string {
  const prefixMap: { [key: number]: string } = {
    1: "golden", // โกลเด้น รีทรีฟเวอร์
    2: "pom", // พอมเมอเรเนียน
    3: "beagle",
    4: "shih",
    5: "poodle",
    6: "husky",
    7: "shiba",
    8: "corgi",
  };
  return prefixMap[breedId] || "golden";
}

// =====================================
// Game API
// =====================================
export const createGame = async (
  breedId: string,
  breedName: string,
  breedPrefix: string,
): Promise<GameState> => {
  try {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        breed_id: parseInt(breedId),
        breed_name: breedName,
        breed_prefix: breedPrefix,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to create game");
    }

    // แปลง response จาก Backend
    const game = result.data;
    return {
      id: game.id,
      breedId: game.breed_id.toString(),
      breedName: game.breed_name,
      breedPrefix: game.breed_prefix,
      startDate: game.start_date,
      currentDay: game.current_day,
      currentAge: game.current_age,
      health: game.health,
      hunger: game.hunger,
      happiness: game.happiness,
      money: game.money,
      mealsToday: game.meals_today,
      answeredQuestions: game.answered_questions || [],
      totalScore: game.total_score,
    };
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

export const fetchGameById = async (gameId: string): Promise<GameState> => {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error("Game not found");
    }

    const game = result.data;
    return {
      id: game.id,
      breedId: game.breed_id.toString(),
      breedName: game.breed_name,
      breedPrefix: game.breed_prefix,
      startDate: game.start_date,
      currentDay: game.current_day,
      currentAge: game.current_age,
      health: game.health,
      hunger: game.hunger,
      happiness: game.happiness,
      money: game.money,
      mealsToday: game.meals_today,
      answeredQuestions: game.answered_questions || [],
      totalScore: game.total_score,
    };
  } catch (error) {
    console.error("Error fetching game:", error);
    throw error;
  }
};

export const updateGameStats = async (
  gameId: string,
  stats: {
    health?: number;
    hunger?: number;
    happiness?: number;
    money?: number;
  },
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/stats`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stats),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to update game stats");
    }
  } catch (error) {
    console.error("Error updating game stats:", error);
    throw error;
  }
};

// =====================================
// Questions API
// =====================================
export const fetchQuestionsByBreed = async (
  breedId: string,
): Promise<Question[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/questions?breed_id=${breedId}`,
    );
    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to fetch questions");
    }

    // แปลง response จาก Backend
    return result.data.map((q: any) => ({
      id: q.question_id.toString(),
      question: q.scenario_text,
      choices: q.choices.map((c: any) => ({
        id: c.choice_id.toString(),
        text: c.choice_text,
        isCorrect: c.hp_change > 0,
        healthChange: c.hp_change,
        hungerChange: c.hunger_change,
        happinessChange: c.happiness_change,
        cost: c.cost,
      })),
    }));
  } catch (error) {
    console.error("Error fetching questions:", error);
    // ถ้าไม่มีคำถาม ให้ return array ว่าง
    return [];
  }
};

export const submitAnswer = async (
  gameId: string,
  questionId: string,
  choiceId: string,
): Promise<{ isCorrect: boolean; points: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        game_id: gameId,
        question_id: parseInt(questionId),
        choice_id: parseInt(choiceId),
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to submit answer");
    }

    return {
      isCorrect: result.is_correct,
      points: result.points,
    };
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
};
