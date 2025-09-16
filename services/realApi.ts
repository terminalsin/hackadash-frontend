import { ApiService } from "./api";
import {
    Hackathon,
    Team,
    Submission,
    Sponsor,
    Prize,
    Issue,
    HackathonCreate,
    HackathonUpdate,
    TeamCreate,
    TeamUpdate,
    SubmissionCreate,
    SubmissionUpdate,
    SponsorCreate,
    PrizeCreate,
    IssueCreate,
    JoinRequest,
    InviteRequest
} from "@/types";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class RealApiService implements ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add authentication header if available (Clerk token)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('clerk-token');
            if (token) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`,
                };
            }
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Hackathon operations
    async createHackathon(hackathon: HackathonCreate): Promise<Hackathon> {
        return this.request<Hackathon>('/hackathons', {
            method: 'POST',
            body: JSON.stringify(hackathon),
        });
    }

    async getHackathon(id: number): Promise<Hackathon> {
        return this.request<Hackathon>(`/hackathons/${id}`);
    }

    async updateHackathon(id: number, hackathon: HackathonUpdate): Promise<Hackathon> {
        return this.request<Hackathon>(`/hackathons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(hackathon),
        });
    }

    async joinHackathon(joinRequest: JoinRequest): Promise<{ message: string }> {
        return this.request<{ message: string }>('/hackathons/join', {
            method: 'POST',
            body: JSON.stringify(joinRequest),
        });
    }

    async inviteUser(hackathonId: number, invite: InviteRequest): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/hackathons/${hackathonId}/invite`, {
            method: 'POST',
            body: JSON.stringify(invite),
        });
    }

    // Team operations
    async getTeams(hackathonId: number): Promise<Team[]> {
        return this.request<Team[]>(`/hackathons/${hackathonId}/teams`);
    }

    async createTeam(hackathonId: number, team: TeamCreate): Promise<Team> {
        return this.request<Team>(`/hackathons/${hackathonId}/teams`, {
            method: 'POST',
            body: JSON.stringify(team),
        });
    }

    async updateTeam(teamId: number, team: TeamUpdate): Promise<Team> {
        return this.request<Team>(`/teams/${teamId}`, {
            method: 'PUT',
            body: JSON.stringify(team),
        });
    }

    // Submission operations
    async createSubmission(teamId: number, submission: SubmissionCreate): Promise<Submission> {
        return this.request<Submission>(`/teams/${teamId}/submissions`, {
            method: 'POST',
            body: JSON.stringify(submission),
        });
    }

    async updateSubmission(submissionId: number, submission: SubmissionUpdate): Promise<Submission> {
        return this.request<Submission>(`/submissions/${submissionId}`, {
            method: 'PUT',
            body: JSON.stringify(submission),
        });
    }

    async getSubmissions(hackathonId: number): Promise<Submission[]> {
        return this.request<Submission[]>(`/hackathons/${hackathonId}/submissions`);
    }

    // Sponsor operations
    async createSponsor(hackathonId: number, sponsor: SponsorCreate): Promise<Sponsor> {
        return this.request<Sponsor>(`/hackathons/${hackathonId}/sponsors`, {
            method: 'POST',
            body: JSON.stringify(sponsor),
        });
    }

    async getSponsors(hackathonId: number): Promise<Sponsor[]> {
        return this.request<Sponsor[]>(`/hackathons/${hackathonId}/sponsors`);
    }

    // Prize operations
    async createPrize(hackathonId: number, prize: PrizeCreate): Promise<Prize> {
        return this.request<Prize>(`/hackathons/${hackathonId}/prizes`, {
            method: 'POST',
            body: JSON.stringify(prize),
        });
    }

    async getPrizes(hackathonId: number): Promise<Prize[]> {
        return this.request<Prize[]>(`/hackathons/${hackathonId}/prizes`);
    }

    // Issue operations
    async createIssue(hackathonId: number, issue: IssueCreate): Promise<Issue> {
        return this.request<Issue>(`/hackathons/${hackathonId}/issues`, {
            method: 'POST',
            body: JSON.stringify(issue),
        });
    }

    async getIssues(hackathonId: number): Promise<Issue[]> {
        return this.request<Issue[]>(`/hackathons/${hackathonId}/issues`);
    }
}

export const realApiService = new RealApiService();
