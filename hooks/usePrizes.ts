import { useState, useEffect } from "react";
import { Prize } from "@/types";
import { apiService } from "@/services/mockApi";

export function usePrizes(hackathonId: string) {
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

  const createPrize = async (prize: Omit<Prize, "id" | "createdAt">) => {
    try {
      setError(null);
      const newPrize = await apiService.createPrize(prize);
      setPrizes(prev => [...prev, newPrize]);
      return newPrize;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prize");
      throw err;
    }
  };

  const updatePrize = async (id: string, prize: Partial<Prize>) => {
    try {
      setError(null);
      const updatedPrize = await apiService.updatePrize(id, prize);
      setPrizes(prev => prev.map(p => p.id === id ? updatedPrize : p));
      return updatedPrize;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update prize");
      throw err;
    }
  };

  const deletePrize = async (id: string) => {
    try {
      setError(null);
      await apiService.deletePrize(id);
      setPrizes(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete prize");
      throw err;
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, [hackathonId]);

  return {
    prizes,
    loading,
    error,
    refetch: fetchPrizes,
    createPrize,
    updatePrize,
    deletePrize,
  };
}

