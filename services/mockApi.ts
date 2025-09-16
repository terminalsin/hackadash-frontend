import { ApiService } from "./api";
import {
  Hackathon,
  Team,
  Submission,
  Sponsor,
  Prize,
  Issue,
  User,
  UserRole,
  SubmissionState,
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

const generateId = () => Math.floor(Math.random() * 1000000);

const generatePinCode = () => Math.random().toString().substring(2, 6).padStart(4, '0');

const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    role: UserRole.ORGANISER,
    createdAt: new Date(),
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: UserRole.GUEST,
    createdAt: new Date(),
  },
];

const mockSponsors: Sponsor[] = [
  {
    id: 1,
    name: "TechCorp",
    description: "Leading technology company",
    logo: "https://via.placeholder.com/200x100",
    website: "https://techcorp.com",
    hackathon_id: 1,
    employees: [],
    created_at: new Date(),
  },
];

const mockTeams: Team[] = [
  {
    id: 1,
    name: "Code Ninjas",
    description: "Elite developers building the future",
    members: [mockUsers[1]],
    hackathon_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockSubmissions: Submission[] = [
  {
    id: 1,
    title: "AI-Powered Task Manager",
    description: "Revolutionary task management with AI",
    github_link: "https://github.com/team/project",
    presentation_link: "https://slides.com/presentation",
    state: SubmissionState.READY_TO_DEMO,
    sponsors_used: [mockSponsors[0]],
    team_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockPrizes: Prize[] = [
  {
    id: 1,
    title: "Best Overall Project",
    description: "The most impressive project overall",
    value: "$5000",
    hackathon_id: 1,
    created_at: new Date(),
  },
];

const mockIssues: Issue[] = [
  {
    id: 1,
    title: "WiFi Connection Problems",
    description: "Intermittent WiFi connectivity issues in the main hall",
    reporter_user_id: "user2",
    status: "open",
    hackathon_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockHackathons: Hackathon[] = [
  {
    id: 1,
    title: "HackTheMatrix 2024",
    description: "48-hour hackathon focused on AI and blockchain",
    image: "https://via.placeholder.com/800x400",
    location: "San Francisco, CA",
    start_time: new Date("2024-10-15T09:00:00Z"),
    end_time: new Date("2024-10-17T18:00:00Z"),
    pin_code: "1337",
    is_started: false,
    organisers: [mockUsers[0]],
    sponsors: mockSponsors,
    teams: mockTeams,
    submissions: mockSubmissions,
    prizes: mockPrizes,
    issues: mockIssues,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export class MockApiService implements ApiService {
  private hackathons = [...mockHackathons];
  private users = [...mockUsers];
  private teams = [...mockTeams];
  private submissions = [...mockSubmissions];
  private sponsors = [...mockSponsors];
  private prizes = [...mockPrizes];
  private issues = [...mockIssues];

  async createHackathon(hackathon: HackathonCreate): Promise<Hackathon> {
    await this.delay();
    const newHackathon: Hackathon = {
      id: generateId(),
      title: hackathon.title,
      description: hackathon.description,
      image: hackathon.image,
      location: hackathon.location,
      start_time: new Date(hackathon.start_time),
      end_time: new Date(hackathon.end_time),
      pin_code: generatePinCode(),
      is_started: false,
      organisers: [],
      sponsors: [],
      teams: [],
      submissions: [],
      prizes: [],
      issues: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.hackathons.push(newHackathon);
    return newHackathon;
  }

  async getHackathon(id: number): Promise<Hackathon> {
    await this.delay();
    const hackathon = this.hackathons.find(h => h.id === id);
    if (!hackathon) throw new Error("Hackathon not found");
    return hackathon;
  }

  async updateHackathon(id: number, hackathon: HackathonUpdate): Promise<Hackathon> {
    await this.delay();
    const index = this.hackathons.findIndex(h => h.id === id);
    if (index === -1) throw new Error("Hackathon not found");

    const updates: Partial<Hackathon> = {
      updated_at: new Date(),
    };

    if (hackathon.title) updates.title = hackathon.title;
    if (hackathon.description) updates.description = hackathon.description;
    if (hackathon.image) updates.image = hackathon.image;
    if (hackathon.location) updates.location = hackathon.location;
    if (hackathon.start_time) updates.start_time = new Date(hackathon.start_time);
    if (hackathon.end_time) updates.end_time = new Date(hackathon.end_time);

    this.hackathons[index] = {
      ...this.hackathons[index],
      ...updates,
    };
    return this.hackathons[index];
  }

  async joinHackathon(joinRequest: JoinRequest): Promise<{ message: string }> {
    await this.delay();
    const hackathon = this.hackathons.find(h => h.pin_code === joinRequest.pin_code);
    if (!hackathon) throw new Error("Invalid pin code");
    return { message: "Successfully joined hackathon" };
  }

  async inviteUser(hackathonId: number, invite: InviteRequest): Promise<{ message: string }> {
    await this.delay();
    const hackathon = this.hackathons.find(h => h.id === hackathonId);
    if (!hackathon) throw new Error("Hackathon not found");
    return { message: "User invited successfully" };
  }

  async getTeams(hackathonId: number): Promise<Team[]> {
    await this.delay();
    return this.teams.filter(t => t.hackathon_id === hackathonId);
  }

  async createTeam(hackathonId: number, team: TeamCreate): Promise<Team> {
    await this.delay();
    const newTeam: Team = {
      id: generateId(),
      name: team.name,
      description: team.description,
      members: [],
      hackathon_id: hackathonId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.teams.push(newTeam);
    return newTeam;
  }

  async updateTeam(teamId: number, team: TeamUpdate): Promise<Team> {
    await this.delay();
    const index = this.teams.findIndex(t => t.id === teamId);
    if (index === -1) throw new Error("Team not found");

    const updates: Partial<Team> = {
      updated_at: new Date(),
    };

    if (team.name) updates.name = team.name;
    if (team.description) updates.description = team.description;

    this.teams[index] = {
      ...this.teams[index],
      ...updates,
    };
    return this.teams[index];
  }

  async createSubmission(teamId: number, submission: SubmissionCreate): Promise<Submission> {
    await this.delay();
    const team = this.teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");

    const sponsors = submission.sponsor_ids
      ? this.sponsors.filter(s => submission.sponsor_ids!.includes(s.id))
      : [];

    const newSubmission: Submission = {
      id: generateId(),
      title: submission.title,
      description: submission.description,
      github_link: submission.github_link,
      presentation_link: submission.presentation_link,
      state: SubmissionState.DRAFT,
      sponsors_used: sponsors,
      team_id: teamId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.submissions.push(newSubmission);
    return newSubmission;
  }

  async updateSubmission(submissionId: number, submission: SubmissionUpdate): Promise<Submission> {
    await this.delay();
    const index = this.submissions.findIndex(s => s.id === submissionId);
    if (index === -1) throw new Error("Submission not found");

    const updates: Partial<Submission> = {
      updated_at: new Date(),
    };

    if (submission.title) updates.title = submission.title;
    if (submission.description) updates.description = submission.description;
    if (submission.github_link) updates.github_link = submission.github_link;
    if (submission.presentation_link) updates.presentation_link = submission.presentation_link;
    if (submission.sponsor_ids) {
      updates.sponsors_used = this.sponsors.filter(s => submission.sponsor_ids!.includes(s.id));
    }

    this.submissions[index] = {
      ...this.submissions[index],
      ...updates,
    };
    return this.submissions[index];
  }

  async getSubmissions(hackathonId: number): Promise<Submission[]> {
    await this.delay();
    return this.submissions.filter(s => {
      const team = this.teams.find(t => t.id === s.team_id);
      return team && team.hackathon_id === hackathonId;
    });
  }

  async createSponsor(hackathonId: number, sponsor: SponsorCreate): Promise<Sponsor> {
    await this.delay();
    const newSponsor: Sponsor = {
      id: generateId(),
      name: sponsor.name,
      description: sponsor.description,
      logo: sponsor.logo,
      website: sponsor.website,
      hackathon_id: hackathonId,
      employees: [],
      created_at: new Date(),
    };
    this.sponsors.push(newSponsor);
    return newSponsor;
  }

  async getSponsors(hackathonId: number): Promise<Sponsor[]> {
    await this.delay();
    return this.sponsors.filter(s => s.hackathon_id === hackathonId);
  }

  async createPrize(hackathonId: number, prize: PrizeCreate): Promise<Prize> {
    await this.delay();
    const newPrize: Prize = {
      id: generateId(),
      title: prize.title,
      description: prize.description,
      value: prize.value,
      sponsor_id: prize.sponsor_id,
      hackathon_id: hackathonId,
      created_at: new Date(),
    };
    this.prizes.push(newPrize);
    return newPrize;
  }

  async getPrizes(hackathonId: number): Promise<Prize[]> {
    await this.delay();
    return this.prizes.filter(p => p.hackathon_id === hackathonId);
  }

  async createIssue(hackathonId: number, issue: IssueCreate): Promise<Issue> {
    await this.delay();
    const newIssue: Issue = {
      id: generateId(),
      title: issue.title,
      description: issue.description,
      reporter_user_id: "current-user", // In a real app, this would come from auth
      status: "open",
      hackathon_id: hackathonId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.issues.push(newIssue);
    return newIssue;
  }

  async getIssues(hackathonId: number): Promise<Issue[]> {
    await this.delay();
    return this.issues.filter(i => i.hackathon_id === hackathonId);
  }

  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new MockApiService();

