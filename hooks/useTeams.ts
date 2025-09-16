import { useState, useEffect } from "react";
import { Team, TeamCreate, TeamUpdate, TeamJoinRequest } from "@/types";
import { apiService } from "@/services";

export function useTeams(hackathonId: number) {
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

  const createTeam = async (team: TeamCreate) => {
    try {
      setError(null);
      const newTeam = await apiService.createTeam(hackathonId, team);
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
      throw err;
    }
  };

  const updateTeam = async (id: number, team: TeamUpdate) => {
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

  const joinTeam = async (teamId: number, joinRequest: TeamJoinRequest) => {
    try {
      setError(null);
      const result = await apiService.joinTeam(teamId, joinRequest);
      // Update the team in the local state with the updated team data
      setTeams(prev => prev.map(t => t.id === teamId ? result.team : t));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team");
      throw err;
    }
  };

  const leaveTeam = async (teamId: number) => {
    try {
      setError(null);
      const result = await apiService.leaveTeam(teamId);
      // Update the team in the local state with the updated team data
      setTeams(prev => prev.map(t => t.id === teamId ? result.team : t));
      return result;
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

// Note: The new API doesn't have a getTeam endpoint
// Individual team fetching would need to be handled differently
// or added to the backend API

