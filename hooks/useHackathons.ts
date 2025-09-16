import { useState, useEffect } from "react";
import { Hackathon, HackathonCreate, HackathonUpdate, JoinRequest, InviteRequest } from "@/types";
import { apiService } from "@/services";

export function useHackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Note: The new API doesn't have a getHackathons endpoint
  // This hook would need to be updated based on actual requirements
  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implement based on actual backend endpoint
      setHackathons([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch hackathons");
    } finally {
      setLoading(false);
    }
  };

  const createHackathon = async (hackathon: HackathonCreate) => {
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

  const updateHackathon = async (id: number, hackathon: HackathonUpdate) => {
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

  const joinHackathon = async (joinRequest: JoinRequest) => {
    try {
      setError(null);
      const result = await apiService.joinHackathon(joinRequest);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join hackathon");
      throw err;
    }
  };

  const inviteUser = async (hackathonId: number, invite: InviteRequest) => {
    try {
      setError(null);
      const result = await apiService.inviteUser(hackathonId, invite);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite user");
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
    joinHackathon,
    inviteUser,
  };
}

export function useHackathon(id: number) {
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

