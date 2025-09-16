import { useState, useEffect } from "react";
import { Sponsor, User } from "@/types";
import { apiService } from "@/services/mockApi";

export function useSponsors(hackathonId: string) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsors = async () => {
    if (!hackathonId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSponsors(hackathonId);
      setSponsors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sponsors");
    } finally {
      setLoading(false);
    }
  };

  const createSponsor = async (sponsor: Omit<Sponsor, "id" | "createdAt" | "employees">) => {
    try {
      setError(null);
      const newSponsor = await apiService.createSponsor(sponsor);
      setSponsors(prev => [...prev, newSponsor]);
      return newSponsor;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sponsor");
      throw err;
    }
  };

  const updateSponsor = async (id: string, sponsor: Partial<Sponsor>) => {
    try {
      setError(null);
      const updatedSponsor = await apiService.updateSponsor(id, sponsor);
      setSponsors(prev => prev.map(s => s.id === id ? updatedSponsor : s));
      return updatedSponsor;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update sponsor");
      throw err;
    }
  };

  const inviteSponsorEmployee = async (sponsorId: string, email: string) => {
    try {
      setError(null);
      const newEmployee = await apiService.inviteSponsorEmployee(sponsorId, email);
      setSponsors(prev => prev.map(s => 
        s.id === sponsorId 
          ? { ...s, employees: [...s.employees, newEmployee] }
          : s
      ));
      return newEmployee;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite sponsor employee");
      throw err;
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, [hackathonId]);

  return {
    sponsors,
    loading,
    error,
    refetch: fetchSponsors,
    createSponsor,
    updateSponsor,
    inviteSponsorEmployee,
  };
}

export function useSponsor(id: string) {
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsor = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSponsor(id);
      setSponsor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sponsor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsor();
  }, [id]);

  return {
    sponsor,
    loading,
    error,
    refetch: fetchSponsor,
  };
}

