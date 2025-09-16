import { useState, useEffect } from "react";
import { Hackathon } from "@/types";
import { apiService } from "@/services/mockApi";

export function useHackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getHackathons();
      setHackathons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch hackathons");
    } finally {
      setLoading(false);
    }
  };

  const createHackathon = async (hackathon: Omit<Hackathon, "id" | "createdAt" | "updatedAt" | "pinCode" | "isStarted" | "organisers" | "sponsors" | "teams" | "submissions" | "prizes" | "issues">) => {
    try {
      setError(null);
      const newHackathon = await apiService.createHackathon(hackathon);
      setHackathons(prev => [...prev, newHackathon]);
      return newHackathon;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create hackathon");
      throw err;
    }
  };

  const updateHackathon = async (id: string, hackathon: Partial<Hackathon>) => {
    try {
      setError(null);
      const updatedHackathon = await apiService.updateHackathon(id, hackathon);
      setHackathons(prev => prev.map(h => h.id === id ? updatedHackathon : h));
      return updatedHackathon;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update hackathon");
      throw err;
    }
  };

  const startHackathon = async (id: string) => {
    try {
      setError(null);
      const updatedHackathon = await apiService.startHackathon(id);
      setHackathons(prev => prev.map(h => h.id === id ? updatedHackathon : h));
      return updatedHackathon;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start hackathon");
      throw err;
    }
  };

  const generatePinCode = async (hackathonId: string) => {
    try {
      setError(null);
      const newPin = await apiService.generatePinCode(hackathonId);
      setHackathons(prev => prev.map(h => h.id === hackathonId ? { ...h, pinCode: newPin } : h));
      return newPin;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate pin code");
      throw err;
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  return {
    hackathons,
    loading,
    error,
    refetch: fetchHackathons,
    createHackathon,
    updateHackathon,
    startHackathon,
    generatePinCode,
  };
}

export function useHackathon(id: string) {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHackathon = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getHackathon(id);
      setHackathon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch hackathon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathon();
  }, [id]);

  return {
    hackathon,
    loading,
    error,
    refetch: fetchHackathon,
  };
}

