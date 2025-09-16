import { useState, useEffect } from "react";
import { Prize, PrizeCreate } from "@/types";
import { apiService } from "@/services";

export function usePrizes(hackathonId: number) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrizes = async () => {
    if (!hackathonId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPrizes(hackathonId);
      setPrizes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prizes");
    } finally {
      setLoading(false);
    }
  };

  const createPrize = async (prize: PrizeCreate) => {
    try {
      setError(null);
      const newPrize = await apiService.createPrize(hackathonId, prize);
      setPrizes(prev => [...prev, newPrize]);
      return newPrize;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prize");
      throw err;
    }
  };

  // Note: updatePrize and deletePrize not available in new API

  useEffect(() => {
    fetchPrizes();
  }, [hackathonId]);

  return {
    prizes,
    loading,
    error,
    refetch: fetchPrizes,
    createPrize,
  };
}

