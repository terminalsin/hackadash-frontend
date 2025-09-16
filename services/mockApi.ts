import { ApiService } from "./api";
import {
  Hackathon,
  Team,
  TeamMember,
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
  TeamJoinRequest,
  SubmissionCreate,
  SubmissionUpdate,
  SponsorCreate,
  PrizeCreate,
  IssueCreate,
  IssueUpdate,
  JoinRequest,
  InviteRequest
} from "@/types";
import { adaptClerkUser, createMockUser } from "@/lib/clerkUtils";

// Session storage keys
const STORAGE_KEYS = {
  HACKATHONS: 'hackathon_app_hackathons',
  USERS: 'hackathon_app_users',
  TEAMS: 'hackathon_app_teams',
  SUBMISSIONS: 'hackathon_app_submissions',
  SPONSORS: 'hackathon_app_sponsors',
  PRIZES: 'hackathon_app_prizes',
  ISSUES: 'hackathon_app_issues',
  NEXT_ID: 'hackathon_app_next_id'
} as const;

// Utility functions for session storage
const SessionStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      const parsed = JSON.parse(item);
      // Convert date strings back to Date objects
      return SessionStorage.reviveDates(parsed);
    } catch (error) {
      console.warn(`Failed to parse session storage item ${key}:`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set session storage item ${key}:`, error);
    }
  },

  // Recursively convert date strings back to Date objects
  reviveDates: (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      // Check if string is a valid ISO date
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (dateRegex.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => SessionStorage.reviveDates(item));
    }

    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = SessionStorage.reviveDates(obj[key]);
        }
      }
      return result;
    }

    return obj;
  }
};

const generateId = (): number => {
  const currentId = SessionStorage.get(STORAGE_KEYS.NEXT_ID, 1000);
  const nextId = currentId + 1;
  SessionStorage.set(STORAGE_KEYS.NEXT_ID, nextId);
  return currentId;
};

const generatePinCode = () => Math.random().toString().substring(2, 6).padStart(4, '0');

const mockUsers: User[] = [
  createMockUser({
    id: "user1",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    emailAddress: "john@example.com",
    role: UserRole.ORGANISER,
    createdAt: new Date(),
  }),
  createMockUser({
    id: "user2",
    firstName: "Jane",
    lastName: "Smith",
    fullName: "Jane Smith",
    emailAddress: "jane@example.com",
    role: UserRole.GUEST,
    createdAt: new Date(),
  }),
  createMockUser({
    id: "user3",
    firstName: "Alex",
    lastName: "Chen",
    fullName: "Alex Chen",
    emailAddress: "alex@techcorp.com",
    role: UserRole.SPONSOR,
    companyId: "1",
    createdAt: new Date(),
  }),
  createMockUser({
    id: "user4",
    firstName: "Sarah",
    lastName: "Wilson",
    fullName: "Sarah Wilson",
    emailAddress: "sarah@cloudtech.com",
    role: UserRole.SPONSOR,
    companyId: "2",
    createdAt: new Date(),
  }),
  createMockUser({
    id: "user5",
    firstName: "Mike",
    lastName: "Rodriguez",
    fullName: "Mike Rodriguez",
    emailAddress: "mike@aiventures.com",
    role: UserRole.SPONSOR,
    companyId: "3",
    createdAt: new Date(),
  }),
];

const mockSponsors: Sponsor[] = [
  {
    id: 1,
    name: "TechCorp",
    description: "Leading technology company specializing in cloud infrastructure and AI solutions. We provide cutting-edge APIs and development tools for modern applications.",
    logo: "https://via.placeholder.com/200x100/00ff00/000000?text=TechCorp",
    website: "https://techcorp.com",
    hackathon_id: 1,
    employees: [mockUsers[2]], // Alex Chen
    created_at: new Date(),
  },
  {
    id: 2,
    name: "CloudTech Solutions",
    description: "Enterprise cloud computing platform offering scalable infrastructure, serverless functions, and data analytics services for developers worldwide.",
    logo: "https://via.placeholder.com/200x100/0099ff/ffffff?text=CloudTech",
    website: "https://cloudtech.com",
    hackathon_id: 1,
    employees: [mockUsers[3]], // Sarah Wilson
    created_at: new Date(),
  },
  {
    id: 3,
    name: "AI Ventures",
    description: "Machine learning and artificial intelligence company providing pre-trained models, ML APIs, and computer vision solutions for innovative startups.",
    logo: "https://via.placeholder.com/200x100/ff6600/ffffff?text=AI+Ventures",
    website: "https://aiventures.com",
    hackathon_id: 1,
    employees: [mockUsers[4]], // Mike Rodriguez
    created_at: new Date(),
  },
];

const mockTeams: Team[] = [
  {
    id: 1,
    name: "Code Ninjas",
    description: "Elite developers building the future with AI and machine learning",
    members: [{
      id: mockUsers[1].id,
      name: mockUsers[1].fullName || 'Jane Smith',
      email: mockUsers[1].emailAddress,
      role: mockUsers[1].role
    }],
    hackathon_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    name: "Cloud Warriors",
    description: "Infrastructure specialists focused on scalable cloud solutions",
    members: [{
      id: mockUsers[0].id,
      name: mockUsers[0].fullName || 'John Doe',
      email: mockUsers[0].emailAddress,
      role: mockUsers[0].role
    }],
    hackathon_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    name: "DevOps Masters",
    description: "Automation experts building developer productivity tools",
    members: [{
      id: mockUsers[1].id,
      name: mockUsers[1].fullName || 'Jane Smith',
      email: mockUsers[1].emailAddress,
      role: mockUsers[1].role
    }],
    hackathon_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockSubmissions: Submission[] = [
  {
    id: 1,
    title: "AI-Powered Task Manager",
    description: "Revolutionary task management application powered by machine learning algorithms. Uses natural language processing to automatically categorize and prioritize tasks based on context and urgency.",
    github_link: "https://github.com/team/ai-task-manager",
    presentation_link: "https://slides.com/ai-task-manager-demo",
    state: SubmissionState.READY_TO_DEMO,
    sponsors_used: [mockSponsors[0], mockSponsors[2]], // TechCorp + AI Ventures
    team_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    title: "CloudSync Dashboard",
    description: "Real-time analytics dashboard for cloud infrastructure monitoring. Provides insights into resource usage, cost optimization, and performance metrics across multiple cloud providers.",
    github_link: "https://github.com/team/cloudsync-dashboard",
    presentation_link: "https://demo.cloudsync.app",
    state: SubmissionState.PRESENTED,
    sponsors_used: [mockSponsors[1]], // CloudTech Solutions
    team_id: 2,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 3,
    title: "Smart Code Assistant",
    description: "AI-powered code completion and bug detection tool that integrates with popular IDEs. Uses machine learning to suggest optimizations and catch potential issues before deployment.",
    github_link: "https://github.com/team/smart-code-assistant",
    state: SubmissionState.DRAFT,
    sponsors_used: [mockSponsors[0], mockSponsors[2]], // TechCorp + AI Ventures
    team_id: 3,
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
  {
    id: 2,
    title: "Best Use of TechCorp APIs",
    description: "Most innovative use of TechCorp's cloud infrastructure and development APIs",
    value: "$2500",
    sponsor_id: 1,
    hackathon_id: 1,
    created_at: new Date(),
  },
  {
    id: 3,
    title: "CloudTech Innovation Award",
    description: "Best project utilizing CloudTech's serverless and analytics platform",
    value: "$2000",
    sponsor_id: 2,
    hackathon_id: 1,
    created_at: new Date(),
  },
  {
    id: 4,
    title: "AI Ventures ML Excellence",
    description: "Outstanding implementation of machine learning using AI Ventures' tools",
    value: "$3000",
    sponsor_id: 3,
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
    description: "48-hour hackathon focused on AI, cloud computing, and innovative developer tools. Join us for an exciting weekend of coding, collaboration, and cutting-edge technology.",
    image: "https://via.placeholder.com/800x400/000000/00ff00?text=HackTheMatrix+2024",
    location: "San Francisco, CA",
    start_time: new Date("2024-10-15T09:00:00Z"),
    end_time: new Date("2024-10-17T18:00:00Z"),
    pin_code: "1337",
    is_started: true,
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
  private hackathons: Hackathon[];
  private users: User[];
  private teams: Team[];
  private submissions: Submission[];
  private sponsors: Sponsor[];
  private prizes: Prize[];
  private issues: Issue[];

  constructor() {
    // Initialize data from session storage or use defaults
    this.hackathons = SessionStorage.get(STORAGE_KEYS.HACKATHONS, [...mockHackathons]);
    this.users = SessionStorage.get(STORAGE_KEYS.USERS, [...mockUsers]);
    this.teams = SessionStorage.get(STORAGE_KEYS.TEAMS, [...mockTeams]);
    this.submissions = SessionStorage.get(STORAGE_KEYS.SUBMISSIONS, [...mockSubmissions]);
    this.sponsors = SessionStorage.get(STORAGE_KEYS.SPONSORS, [...mockSponsors]);
    this.prizes = SessionStorage.get(STORAGE_KEYS.PRIZES, [...mockPrizes]);
    this.issues = SessionStorage.get(STORAGE_KEYS.ISSUES, [...mockIssues]);

    console.log("hackathons: ", this.hackathons)
    console.log("users: ", this.users)
    console.log("teams: ", this.teams)
    console.log("submissions: ", this.submissions)
    console.log("sponsors: ", this.sponsors)
    console.log("prizes: ", this.prizes)
    console.log("issues: ", this.issues)
    this.saveToStorage();
  }

  /**
   * Get current user from Clerk (client-side only)
   * This method should be called from components that have access to Clerk context
   */
  private getCurrentClerkUser(): any {
    if (typeof window === 'undefined') return null;

    // In a real implementation, this would use the useUser hook
    // For now, we'll return null and rely on the mock users
    return null;
  }

  /**
   * Add or update a user from Clerk data
   */
  addOrUpdateClerkUser(clerkUser: any): User {
    const adaptedUser = adaptClerkUser(clerkUser);
    const existingIndex = this.users.findIndex(u => u.id === adaptedUser.id);

    if (existingIndex >= 0) {
      this.users[existingIndex] = adaptedUser;
    } else {
      this.users.push(adaptedUser);
    }

    this.saveToStorage();
    return adaptedUser;
  }

  /**
   * Get user by ID, checking both mock users and any added Clerk users
   */
  getUserById(id: string): User | null {
    return this.users.find(u => u.id === id) || null;
  }

  /**
   * Get current user ID (should be called with Clerk user ID from components)
   */
  getCurrentUserId(): string {
    // In a real implementation, this would get the current user from Clerk
    // For now, return the first mock user
    return this.users[0]?.id || 'user1';
  }

  /**
   * Set the current user ID (called by Clerk integration)
   */
  private currentUserId: string | null = null;

  setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Get the current user ID, preferring Clerk user if available
   */
  getCurrentUserIdWithClerk(): string {
    return this.currentUserId || this.getCurrentUserId();
  }

  private saveToStorage(): void {
    SessionStorage.set(STORAGE_KEYS.HACKATHONS, this.hackathons);
    SessionStorage.set(STORAGE_KEYS.USERS, this.users);
    SessionStorage.set(STORAGE_KEYS.TEAMS, this.teams);
    SessionStorage.set(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    SessionStorage.set(STORAGE_KEYS.SPONSORS, this.sponsors);
    SessionStorage.set(STORAGE_KEYS.PRIZES, this.prizes);
    SessionStorage.set(STORAGE_KEYS.ISSUES, this.issues);
  }

  async getHackathons(): Promise<Hackathon[]> {
    await this.delay();
    return [...this.hackathons];
  }

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
    this.saveToStorage();
    return newHackathon;
  }

  async getHackathon(id: number): Promise<Hackathon> {
    await this.delay();
    console.log("[mock] getting hackathon", id);
    console.log("hackathons: ", this.hackathons)
    const hackathon = this.hackathons.find((h: Hackathon) => h.id == id);
    console.log("[mock] found ", hackathon)
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
    this.saveToStorage();
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
    this.saveToStorage();
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
    this.saveToStorage();
    return this.teams[index];
  }

  async joinTeam(teamId: number, joinRequest: TeamJoinRequest): Promise<{ message: string; team: Team }> {
    await this.delay();
    const team = this.teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");

    // Check if team is full (max 4 members)
    if (team.members.length >= 4) {
      throw new Error("Team is full");
    }

    // Get current user from Clerk (this would be handled differently in a real app)
    const currentUserId = this.getCurrentUserIdWithClerk();
    const currentUser = this.getUserById(currentUserId);
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Check if user is already in any team for this hackathon
    const userTeam = this.teams.find(t =>
      t.hackathon_id === team.hackathon_id &&
      t.members.some(m => m.id === currentUser.id)
    );

    if (userTeam) {
      throw new Error("User is already in a team for this hackathon");
    }

    // TODO: Validate join_code if provided
    // For now, we'll allow anyone to join without a code

    // Add user to team
    const teamMember = {
      id: currentUser.id,
      name: currentUser.fullName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Unknown User',
      email: currentUser.emailAddress,
      role: currentUser.role
    };

    team.members.push(teamMember);
    team.updated_at = new Date();

    this.saveToStorage();
    return {
      message: "Successfully joined team",
      team: team
    };
  }

  async leaveTeam(teamId: number): Promise<{ message: string; team: Team }> {
    await this.delay();
    const team = this.teams.find(t => t.id === teamId);
    if (!team) throw new Error("Team not found");

    // Get current user from Clerk
    const currentUserId = this.getCurrentUserIdWithClerk();
    const currentUser = this.getUserById(currentUserId);
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Find the user in the team
    const memberIndex = team.members.findIndex(m => m.id === currentUser.id);
    if (memberIndex === -1) {
      throw new Error("User is not a member of this team");
    }

    // Remove user from team
    team.members.splice(memberIndex, 1);
    team.updated_at = new Date();

    this.saveToStorage();
    return {
      message: "Successfully left team",
      team: team
    };
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
    this.saveToStorage();
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
    this.saveToStorage();
    return this.submissions[index];
  }

  async deleteSubmission(submissionId: number): Promise<{ message: string }> {
    await this.delay();
    const index = this.submissions.findIndex(s => s.id === submissionId);
    if (index === -1) throw new Error("Submission not found");

    this.submissions.splice(index, 1);
    this.saveToStorage();
    return { message: "Submission deleted successfully" };
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
    this.saveToStorage();
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
    this.saveToStorage();
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
      reporter_user_id: this.getCurrentUserIdWithClerk(),
      status: "open",
      hackathon_id: hackathonId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.issues.push(newIssue);
    this.saveToStorage();
    return newIssue;
  }

  async updateIssue(issueId: number, issue: IssueUpdate): Promise<Issue> {
    await this.delay();
    const index = this.issues.findIndex(i => i.id === issueId);
    if (index === -1) {
      throw new Error('Issue not found');
    }

    this.issues[index] = {
      ...this.issues[index],
      ...issue,
      updated_at: new Date(),
    };

    this.saveToStorage();
    return this.issues[index];
  }

  async getIssues(hackathonId: number): Promise<Issue[]> {
    await this.delay();
    return this.issues.filter(i => i.hackathon_id === hackathonId);
  }

  // Utility method to reset storage to default values (useful for development/testing)
  resetToDefaults(): void {
    this.hackathons = [...mockHackathons];
    this.users = [...mockUsers];
    this.teams = [...mockTeams];
    this.submissions = [...mockSubmissions];
    this.sponsors = [...mockSponsors];
    this.prizes = [...mockPrizes];
    this.issues = [...mockIssues];
    this.saveToStorage();
    // Reset ID counter
    SessionStorage.set(STORAGE_KEYS.NEXT_ID, 1000);
  }

  // Utility method to clear all data
  clearAll(): void {
    this.hackathons = [];
    this.users = [];
    this.teams = [];
    this.submissions = [];
    this.sponsors = [];
    this.prizes = [];
    this.issues = [];
    this.saveToStorage();
    // Reset ID counter
    SessionStorage.set(STORAGE_KEYS.NEXT_ID, 1000);
  }

  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new MockApiService();

