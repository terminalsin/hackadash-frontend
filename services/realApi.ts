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
    TeamJoinRequest,
    SubmissionCreate,
    SubmissionUpdate,
    SponsorCreate,
    PrizeCreate,
    IssueCreate,
    JoinRequest,
    InviteRequest
} from "@/types";

const API_BASE_URL = '/api';

class RealApiService implements ApiService {
    private async fetchApi<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Hackathon operations
    async getHackathons(): Promise<Hackathon[]> {
        return this.fetchApi<Hackathon[]>('/hackathons');
    }

    async createHackathon(hackathon: HackathonCreate): Promise<Hackathon> {
        return this.fetchApi<Hackathon>('/hackathons', {
            method: 'POST',
            body: JSON.stringify(hackathon),
        });
    }

    async getHackathon(id: number): Promise<Hackathon> {
        return this.fetchApi<Hackathon>(`/hackathons/${id}`);
    }

    async updateHackathon(id: number, hackathon: HackathonUpdate): Promise<Hackathon> {
        return this.fetchApi<Hackathon>(`/hackathons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(hackathon),
        });
    }

    async joinHackathon(joinRequest: JoinRequest): Promise<{ message: string }> {
        return this.fetchApi<{ message: string }>('/hackathons/join', {
            method: 'POST',
            body: JSON.stringify(joinRequest),
        });
    }

    async inviteUser(hackathonId: number, invite: InviteRequest): Promise<{ message: string }> {
        return this.fetchApi<{ message: string }>(`/hackathons/${hackathonId}/invite`, {
            method: 'POST',
            body: JSON.stringify(invite),
        });
    }

    // Team operations
    async getTeams(hackathonId: number): Promise<Team[]> {
        return this.fetchApi<Team[]>(`/hackathons/${hackathonId}/teams`);
    }

    async createTeam(hackathonId: number, team: TeamCreate): Promise<Team> {
        return this.fetchApi<Team>(`/hackathons/${hackathonId}/teams`, {
            method: 'POST',
            body: JSON.stringify(team),
        });
    }

    async updateTeam(teamId: number, team: TeamUpdate): Promise<Team> {
        return this.fetchApi<Team>(`/teams/${teamId}`, {
            method: 'PUT',
            body: JSON.stringify(team),
        });
    }

    async joinTeam(teamId: number, joinRequest: TeamJoinRequest): Promise<{ message: string; team: Team }> {
        return this.fetchApi<{ message: string; team: Team }>(`/teams/${teamId}/join`, {
            method: 'POST',
            body: JSON.stringify(joinRequest),
        });
    }

    async leaveTeam(teamId: number): Promise<{ message: string; team: Team }> {
        return this.fetchApi<{ message: string; team: Team }>(`/teams/${teamId}/leave`, {
            method: 'POST',
        });
    }

    // Submission operations
    async createSubmission(teamId: number, submission: SubmissionCreate): Promise<Submission> {
        return this.fetchApi<Submission>(`/teams/${teamId}/submissions`, {
            method: 'POST',
            body: JSON.stringify(submission),
        });
    }

    async updateSubmission(submissionId: number, submission: SubmissionUpdate): Promise<Submission> {
        return this.fetchApi<Submission>(`/submissions/${submissionId}`, {
            method: 'PUT',
            body: JSON.stringify(submission),
        });
    }

    async deleteSubmission(submissionId: number): Promise<{ message: string }> {
        return this.fetchApi<{ message: string }>(`/submissions/${submissionId}`, {
            method: 'DELETE',
        });
    }

    async getSubmissions(hackathonId: number): Promise<Submission[]> {
        return this.fetchApi<Submission[]>(`/hackathons/${hackathonId}/submissions`);
    }

    // Sponsor operations
    async createSponsor(hackathonId: number, sponsor: SponsorCreate): Promise<Sponsor> {
        return this.fetchApi<Sponsor>(`/hackathons/${hackathonId}/sponsors`, {
            method: 'POST',
            body: JSON.stringify(sponsor),
        });
    }

    async getSponsors(hackathonId: number): Promise<Sponsor[]> {
        return this.fetchApi<Sponsor[]>(`/hackathons/${hackathonId}/sponsors`);
    }

    // Prize operations
    async createPrize(hackathonId: number, prize: PrizeCreate): Promise<Prize> {
        return this.fetchApi<Prize>(`/hackathons/${hackathonId}/prizes`, {
            method: 'POST',
            body: JSON.stringify(prize),
        });
    }

    async getPrizes(hackathonId: number): Promise<Prize[]> {
        return this.fetchApi<Prize[]>(`/hackathons/${hackathonId}/prizes`);
    }

    // Issue operations
    async createIssue(hackathonId: number, issue: IssueCreate): Promise<Issue> {
        return this.fetchApi<Issue>(`/hackathons/${hackathonId}/issues`, {
            method: 'POST',
            body: JSON.stringify(issue),
        });
    }

    async getIssues(hackathonId: number): Promise<Issue[]> {
        return this.fetchApi<Issue[]>(`/hackathons/${hackathonId}/issues`);
    }
}

export const apiService = new RealApiService();