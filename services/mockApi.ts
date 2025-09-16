import { ApiService } from "./api";
import { Hackathon, Team, Submission, Sponsor, Prize, Issue, User, UserRole, SubmissionState } from "@/types";

const generateId = () => Math.random().toString(36).substring(2, 15);

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
    id: "sponsor1",
    name: "TechCorp",
    description: "Leading technology company",
    logo: "https://via.placeholder.com/200x100",
    website: "https://techcorp.com",
    hackathonId: "hack1",
    employees: [],
    createdAt: new Date(),
  },
];

const mockTeams: Team[] = [
  {
    id: "team1",
    name: "Code Ninjas",
    description: "Elite developers building the future",
    members: [mockUsers[1]],
    hackathonId: "hack1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockSubmissions: Submission[] = [
  {
    id: "sub1",
    title: "AI-Powered Task Manager",
    description: "Revolutionary task management with AI",
    githubLink: "https://github.com/team/project",
    presentationLink: "https://slides.com/presentation",
    state: SubmissionState.READY_TO_DEMO,
    sponsorsUsed: ["sponsor1"],
    teamId: "team1",
    hackathonId: "hack1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockPrizes: Prize[] = [
  {
    id: "prize1",
    title: "Best Overall Project",
    description: "The most impressive project overall",
    value: "$5000",
    hackathonId: "hack1",
    createdAt: new Date(),
  },
];

const mockIssues: Issue[] = [
  {
    id: "issue1",
    title: "WiFi Connection Problems",
    description: "Intermittent WiFi connectivity issues in the main hall",
    reportedBy: "user2",
    status: "open",
    hackathonId: "hack1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockHackathons: Hackathon[] = [
  {
    id: "hack1",
    title: "HackTheMatrix 2024",
    description: "48-hour hackathon focused on AI and blockchain",
    image: "https://via.placeholder.com/800x400",
    location: "San Francisco, CA",
    startTime: new Date("2024-10-15T09:00:00Z"),
    endTime: new Date("2024-10-17T18:00:00Z"),
    pinCode: "1337",
    isStarted: false,
    organisers: [mockUsers[0]],
    sponsors: mockSponsors,
    teams: mockTeams,
    submissions: mockSubmissions,
    prizes: mockPrizes,
    issues: mockIssues,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  async getHackathons(): Promise<Hackathon[]> {
    await this.delay();
    return this.hackathons;
  }

  async getHackathon(id: string): Promise<Hackathon> {
    await this.delay();
    const hackathon = this.hackathons.find(h => h.id === id);
    if (!hackathon) throw new Error("Hackathon not found");
    return hackathon;
  }

  async createHackathon(hackathon: Omit<Hackathon, "id" | "createdAt" | "updatedAt" | "pinCode" | "isStarted" | "organisers" | "sponsors" | "teams" | "submissions" | "prizes" | "issues">): Promise<Hackathon> {
    await this.delay();
    const newHackathon: Hackathon = {
      ...hackathon,
      id: generateId(),
      pinCode: generatePinCode(),
      isStarted: false,
      organisers: [],
      sponsors: [],
      teams: [],
      submissions: [],
      prizes: [],
      issues: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.hackathons.push(newHackathon);
    return newHackathon;
  }

  async updateHackathon(id: string, hackathon: Partial<Hackathon>): Promise<Hackathon> {
    await this.delay();
    const index = this.hackathons.findIndex(h => h.id === id);
    if (index === -1) throw new Error("Hackathon not found");
    
    this.hackathons[index] = {
      ...this.hackathons[index],
      ...hackathon,
      updatedAt: new Date(),
    };
    return this.hackathons[index];
  }

  async startHackathon(id: string): Promise<Hackathon> {
    await this.delay();
    return this.updateHackathon(id, { isStarted: true });
  }

  async generatePinCode(hackathonId: string): Promise<string> {
    await this.delay();
    const newPin = generatePinCode();
    await this.updateHackathon(hackathonId, { pinCode: newPin });
    return newPin;
  }

  async getUsers(hackathonId: string): Promise<User[]> {
    await this.delay();
    return this.users;
  }

  async inviteUser(hackathonId: string, email: string, role: UserRole): Promise<User> {
    await this.delay();
    const newUser: User = {
      id: generateId(),
      name: email.split("@")[0],
      email,
      role,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async inviteUserByPin(pinCode: string, user: Omit<User, "id" | "createdAt" | "role">): Promise<User> {
    await this.delay();
    const hackathon = this.hackathons.find(h => h.pinCode === pinCode);
    if (!hackathon) throw new Error("Invalid pin code");
    
    const newUser: User = {
      ...user,
      id: generateId(),
      role: UserRole.GUEST,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async getTeams(hackathonId: string): Promise<Team[]> {
    await this.delay();
    return this.teams.filter(t => t.hackathonId === hackathonId);
  }

  async getTeam(id: string): Promise<Team> {
    await this.delay();
    const team = this.teams.find(t => t.id === id);
    if (!team) throw new Error("Team not found");
    return team;
  }

  async createTeam(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team> {
    await this.delay();
    const newTeam: Team = {
      ...team,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.teams.push(newTeam);
    return newTeam;
  }

  async updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    await this.delay();
    const index = this.teams.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Team not found");
    
    this.teams[index] = {
      ...this.teams[index],
      ...team,
      updatedAt: new Date(),
    };
    return this.teams[index];
  }

  async joinTeam(teamId: string, userId: string): Promise<Team> {
    await this.delay();
    const team = await this.getTeam(teamId);
    const user = this.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    
    if (!team.members.find(m => m.id === userId)) {
      team.members.push(user);
      return this.updateTeam(teamId, { members: team.members });
    }
    return team;
  }

  async leaveTeam(teamId: string, userId: string): Promise<Team> {
    await this.delay();
    const team = await this.getTeam(teamId);
    team.members = team.members.filter(m => m.id !== userId);
    return this.updateTeam(teamId, { members: team.members });
  }

  async getSubmissions(hackathonId: string): Promise<Submission[]> {
    await this.delay();
    return this.submissions.filter(s => s.hackathonId === hackathonId);
  }

  async getSubmission(id: string): Promise<Submission> {
    await this.delay();
    const submission = this.submissions.find(s => s.id === id);
    if (!submission) throw new Error("Submission not found");
    return submission;
  }

  async createSubmission(submission: Omit<Submission, "id" | "createdAt" | "updatedAt">): Promise<Submission> {
    await this.delay();
    const newSubmission: Submission = {
      ...submission,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.submissions.push(newSubmission);
    return newSubmission;
  }

  async updateSubmission(id: string, submission: Partial<Submission>): Promise<Submission> {
    await this.delay();
    const index = this.submissions.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Submission not found");
    
    this.submissions[index] = {
      ...this.submissions[index],
      ...submission,
      updatedAt: new Date(),
    };
    return this.submissions[index];
  }

  async updateSubmissionState(id: string, state: SubmissionState): Promise<Submission> {
    await this.delay();
    return this.updateSubmission(id, { state });
  }

  async getSponsors(hackathonId: string): Promise<Sponsor[]> {
    await this.delay();
    return this.sponsors.filter(s => s.hackathonId === hackathonId);
  }

  async getSponsor(id: string): Promise<Sponsor> {
    await this.delay();
    const sponsor = this.sponsors.find(s => s.id === id);
    if (!sponsor) throw new Error("Sponsor not found");
    return sponsor;
  }

  async createSponsor(sponsor: Omit<Sponsor, "id" | "createdAt" | "employees">): Promise<Sponsor> {
    await this.delay();
    const newSponsor: Sponsor = {
      ...sponsor,
      id: generateId(),
      employees: [],
      createdAt: new Date(),
    };
    this.sponsors.push(newSponsor);
    return newSponsor;
  }

  async updateSponsor(id: string, sponsor: Partial<Sponsor>): Promise<Sponsor> {
    await this.delay();
    const index = this.sponsors.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Sponsor not found");
    
    this.sponsors[index] = {
      ...this.sponsors[index],
      ...sponsor,
    };
    return this.sponsors[index];
  }

  async inviteSponsorEmployee(sponsorId: string, email: string): Promise<User> {
    await this.delay();
    const sponsor = await this.getSponsor(sponsorId);
    const newUser: User = {
      id: generateId(),
      name: email.split("@")[0],
      email,
      role: UserRole.SPONSOR,
      companyId: sponsorId,
      createdAt: new Date(),
    };
    
    this.users.push(newUser);
    sponsor.employees.push(newUser);
    return newUser;
  }

  async getPrizes(hackathonId: string): Promise<Prize[]> {
    await this.delay();
    return this.prizes.filter(p => p.hackathonId === hackathonId);
  }

  async createPrize(prize: Omit<Prize, "id" | "createdAt">): Promise<Prize> {
    await this.delay();
    const newPrize: Prize = {
      ...prize,
      id: generateId(),
      createdAt: new Date(),
    };
    this.prizes.push(newPrize);
    return newPrize;
  }

  async updatePrize(id: string, prize: Partial<Prize>): Promise<Prize> {
    await this.delay();
    const index = this.prizes.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Prize not found");
    
    this.prizes[index] = {
      ...this.prizes[index],
      ...prize,
    };
    return this.prizes[index];
  }

  async deletePrize(id: string): Promise<void> {
    await this.delay();
    const index = this.prizes.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Prize not found");
    this.prizes.splice(index, 1);
  }

  async getIssues(hackathonId: string): Promise<Issue[]> {
    await this.delay();
    return this.issues.filter(i => i.hackathonId === hackathonId);
  }

  async createIssue(issue: Omit<Issue, "id" | "createdAt" | "updatedAt">): Promise<Issue> {
    await this.delay();
    const newIssue: Issue = {
      ...issue,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.issues.push(newIssue);
    return newIssue;
  }

  async updateIssueStatus(id: string, status: Issue["status"]): Promise<Issue> {
    await this.delay();
    const index = this.issues.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Issue not found");
    
    this.issues[index] = {
      ...this.issues[index],
      status,
      updatedAt: new Date(),
    };
    return this.issues[index];
  }

  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new MockApiService();

