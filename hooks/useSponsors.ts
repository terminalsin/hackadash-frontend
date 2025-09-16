import { useState, useEffect } from "react";
import { Sponsor, SponsorCreate } from "@/types";
import { apiService } from "@/services";

export function useSponsors(hackathonId: number) {
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

  const createSponsor = async (sponsor: SponsorCreate) => {
    try {
      setError(null);
      const newSponsor = await apiService.createSponsor(hackathonId, sponsor);
      setSponsors(prev => [...prev, newSponsor]);
      return newSponsor;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sponsor");
      throw err;
    }
  };

  // Note: updateSponsor and inviteSponsorEmployee not available in new API

  useEffect(() => {
    fetchSponsors();
  }, [hackathonId]);

  return {
    sponsors,
    loading,
    error,
    refetch: fetchSponsors,
    createSponsor,
  };
}

// Note: The new API doesn't have a getSponsor endpoint
// Individual sponsor fetching would need to be handled differently
// or added to the backend API

