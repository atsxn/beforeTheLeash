import { DatabaseService } from "@/app/services/database";
import type { DogBreed } from "@/app/types";
import { useEffect, useState } from "react";

export function useBreeds() {
  const [breeds, setBreeds] = useState<DogBreed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBreeds();
  }, []);

  const loadBreeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DatabaseService.getBreeds();
      setBreeds(data);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลสายพันธุ์ได้");
      console.error("Error loading breeds:", err);
    } finally {
      setLoading(false);
    }
  };

  return { breeds, loading, error, reload: loadBreeds };
}
export default useBreeds;
