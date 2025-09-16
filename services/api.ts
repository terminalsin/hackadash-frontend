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

export interface ApiService {
  // Hackathon operations
  createHackathon(hackathon: HackathonCreate): Promise<Hackathon>;
  getHackathon(id: number): Promise<Hackathon>;
  updateHackathon(id: number, hackathon: HackathonUpdate): Promise<Hackathon>;
  joinHackathon(joinRequest: JoinRequest): Promise<{ message: string }>;
  inviteUser(hackathonId: number, invite: InviteRequest): Promise<{ message: string }>;

  // Team operations
  getTeams(hackathonId: number): Promise<Team[]>;
  createTeam(hackathonId: number, team: TeamCreate): Promise<Team>;
  updateTeam(teamId: number, team: TeamUpdate): Promise<Team>;

  // Submission operations
  createSubmission(teamId: number, submission: SubmissionCreate): Promise<Submission>;
  updateSubmission(submissionId: number, submission: SubmissionUpdate): Promise<Submission>;
  getSubmissions(hackathonId: number): Promise<Submission[]>;

  // Sponsor operations
  createSponsor(hackathonId: number, sponsor: SponsorCreate): Promise<Sponsor>;
  getSponsors(hackathonId: number): Promise<Sponsor[]>;

  // Prize operations
  createPrize(hackathonId: number, prize: PrizeCreate): Promise<Prize>;
  getPrizes(hackathonId: number): Promise<Prize[]>;

  // Issue operations
  createIssue(hackathonId: number, issue: IssueCreate): Promise<Issue>;
  getIssues(hackathonId: number): Promise<Issue[]>;
}

