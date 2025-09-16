import { useState, useEffect } from "react";
import { Submission, SubmissionCreate, SubmissionUpdate } from "@/types";
import { apiService } from "@/services";

export function useSubmissions(hackathonId: number) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!hackathonId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSubmissions(hackathonId);
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const createSubmission = async (teamId: number, submission: SubmissionCreate) => {
    try {
      setError(null);
      const newSubmission = await apiService.createSubmission(teamId, submission);
      setSubmissions(prev => [...prev, newSubmission]);
      return newSubmission;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create submission");
      throw err;
    }
  };

  const updateSubmission = async (id: number, submission: SubmissionUpdate) => {
    try {
      setError(null);
      const updatedSubmission = await apiService.updateSubmission(id, submission);
      setSubmissions(prev => prev.map(s => s.id === id ? updatedSubmission : s));
      return updatedSubmission;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update submission");
      throw err;
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [hackathonId]);

  return {
    submissions,
    loading,
    error,
    refetch: fetchSubmissions,
    createSubmission,
    updateSubmission,
  };
}

// Note: The new API doesn't have a getSubmission endpoint
// Individual submission fetching would need to be handled differently
// or added to the backend API

