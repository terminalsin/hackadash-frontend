import { useState, useEffect } from "react";
import { Issue, IssueCreate } from "@/types";
import { apiService } from "@/services";

export function useIssues(hackathonId: number) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    if (!hackathonId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getIssues(hackathonId);
      setIssues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issue: IssueCreate) => {
    try {
      setError(null);
      const newIssue = await apiService.createIssue(hackathonId, issue);
      setIssues(prev => [...prev, newIssue]);
      return newIssue;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create issue");
      throw err;
    }
  };

  // Note: updateIssueStatus not available in new API

  useEffect(() => {
    fetchIssues();
  }, [hackathonId]);

  return {
    issues,
    loading,
    error,
    refetch: fetchIssues,
    createIssue,
  };
}

