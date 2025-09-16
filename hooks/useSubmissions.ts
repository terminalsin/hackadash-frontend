import { useState, useEffect } from "react";
import { Submission, SubmissionState } from "@/types";
import { apiService } from "@/services/mockApi";

export function useSubmissions(hackathonId: string) {
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

  const createSubmission = async (submission: Omit<Submission, "id" | "createdAt" | "updatedAt">) => {
    try {
      setError(null);
      const newSubmission = await apiService.createSubmission(submission);
      setSubmissions(prev => [...prev, newSubmission]);
      return newSubmission;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create submission");
      throw err;
    }
  };

  const updateSubmission = async (id: string, submission: Partial<Submission>) => {
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

  const updateSubmissionState = async (id: string, state: SubmissionState) => {
    try {
      setError(null);
      const updatedSubmission = await apiService.updateSubmissionState(id, state);
      setSubmissions(prev => prev.map(s => s.id === id ? updatedSubmission : s));
      return updatedSubmission;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update submission state");
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
    updateSubmissionState,
  };
}

export function useSubmission(id: string) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmission = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getSubmission(id);
      setSubmission(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch submission");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  return {
    submission,
    loading,
    error,
    refetch: fetchSubmission,
  };
}

