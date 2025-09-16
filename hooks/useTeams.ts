import { useState, useEffect } from "react";
import { Team } from "@/types";
import { apiService } from "@/services/mockApi";

export function useTeams(hackathonId: string) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    if (!hackathonId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTeams(hackathonId);
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (team: Omit<Team, "id" | "createdAt" | "updatedAt">) => {
    try {
      setError(null);
      const newTeam = await apiService.createTeam(team);
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
      throw err;
    }
  };

  const updateTeam = async (id: string, team: Partial<Team>) => {
    try {
      setError(null);
      const updatedTeam = await apiService.updateTeam(id, team);
      setTeams(prev => prev.map(t => t.id === id ? updatedTeam : t));
      return updatedTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
      throw err;
    }
  };

  const joinTeam = async (teamId: string, userId: string) => {
    try {
      setError(null);
      const updatedTeam = await apiService.joinTeam(teamId, userId);
      setTeams(prev => prev.map(t => t.id === teamId ? updatedTeam : t));
      return updatedTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team");
      throw err;
    }
  };

  const leaveTeam = async (teamId: string, userId: string) => {
    try {
      setError(null);
      const updatedTeam = await apiService.leaveTeam(teamId, userId);
      setTeams(prev => prev.map(t => t.id === teamId ? updatedTeam : t));
      return updatedTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave team");
      throw err;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [hackathonId]);

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
    createTeam,
    updateTeam,
    joinTeam,
    leaveTeam,
  };
}

export function useTeam(id: string) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTeam(id);
      setTeam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  return {
    team,
    loading,
    error,
    refetch: fetchTeam,
  };
}

