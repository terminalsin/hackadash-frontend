import { Hackathon, Team, Submission, Sponsor, Prize, Issue, User, UserRole, SubmissionState } from "@/types";

export interface ApiService {
  // Hackathon operations
  getHackathons(): Promise<Hackathon[]>;
  getHackathon(id: string): Promise<Hackathon>;
  createHackathon(hackathon: Omit<Hackathon, "id" | "createdAt" | "updatedAt" | "pinCode" | "isStarted" | "organisers" | "sponsors" | "teams" | "submissions" | "prizes" | "issues">): Promise<Hackathon>;
  updateHackathon(id: string, hackathon: Partial<Hackathon>): Promise<Hackathon>;
  startHackathon(id: string): Promise<Hackathon>;
  generatePinCode(hackathonId: string): Promise<string>;
  
  // User operations
  getUsers(hackathonId: string): Promise<User[]>;
  inviteUser(hackathonId: string, email: string, role: UserRole): Promise<User>;
  inviteUserByPin(pinCode: string, user: Omit<User, "id" | "createdAt" | "role">): Promise<User>;
  
  // Team operations
  getTeams(hackathonId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team>;
  createTeam(team: Omit<Team, "id" | "createdAt" | "updatedAt">): Promise<Team>;
  updateTeam(id: string, team: Partial<Team>): Promise<Team>;
  joinTeam(teamId: string, userId: string): Promise<Team>;
  leaveTeam(teamId: string, userId: string): Promise<Team>;
  
  // Submission operations
  getSubmissions(hackathonId: string): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission>;
  createSubmission(submission: Omit<Submission, "id" | "createdAt" | "updatedAt">): Promise<Submission>;
  updateSubmission(id: string, submission: Partial<Submission>): Promise<Submission>;
  updateSubmissionState(id: string, state: SubmissionState): Promise<Submission>;
  
  // Sponsor operations
  getSponsors(hackathonId: string): Promise<Sponsor[]>;
  getSponsor(id: string): Promise<Sponsor>;
  createSponsor(sponsor: Omit<Sponsor, "id" | "createdAt" | "employees">): Promise<Sponsor>;
  updateSponsor(id: string, sponsor: Partial<Sponsor>): Promise<Sponsor>;
  inviteSponsorEmployee(sponsorId: string, email: string): Promise<User>;
  
  // Prize operations
  getPrizes(hackathonId: string): Promise<Prize[]>;
  createPrize(prize: Omit<Prize, "id" | "createdAt">): Promise<Prize>;
  updatePrize(id: string, prize: Partial<Prize>): Promise<Prize>;
  deletePrize(id: string): Promise<void>;
  
  // Issue operations
  getIssues(hackathonId: string): Promise<Issue[]>;
  createIssue(issue: Omit<Issue, "id" | "createdAt" | "updatedAt">): Promise<Issue>;
  updateIssueStatus(id: string, status: Issue["status"]): Promise<Issue>;
}

