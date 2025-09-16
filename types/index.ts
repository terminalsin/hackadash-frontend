import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export enum UserRole {
  ORGANISER = "ORGANISER",
  GUEST = "GUEST",
  SPONSOR = "SPONSOR",
}

export enum SubmissionState {
  DRAFT = "draft",
  READY_TO_DEMO = "ready_to_demo",
  PRESENTED = "presented",
}

export interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  emailAddress: string;
  imageUrl?: string;
  role: UserRole;
  companyId?: string;
  createdAt: Date;
}

// Helper function to create User from Clerk user
export interface ClerkUserAdapter {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  primaryEmailAddress?: {
    emailAddress: string;
  } | null;
  imageUrl?: string;
  publicMetadata?: {
    role?: UserRole;
    companyId?: string;
  };
  createdAt?: Date;
}

// Backend request/response schemas
export interface JoinRequest {
  pin_code: string;
}

export interface InviteRequest {
  user_id: string;
  role: UserRole;
  sponsor_id?: number;
}

export interface HackathonCreate {
  title: string;
  description: string;
  image?: string;
  location: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
}

export interface HackathonUpdate {
  title?: string;
  description?: string;
  image?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
}

export interface TeamCreate {
  name: string;
  description: string;
}

export interface TeamUpdate {
  name?: string;
  description?: string;
}

export interface TeamJoinRequest {
  join_code?: string;
}

export interface SubmissionCreate {
  title: string;
  description: string;
  github_link: string;
  presentation_link?: string;
  sponsor_ids?: number[];
}

export interface SubmissionUpdate {
  title?: string;
  description?: string;
  github_link?: string;
  presentation_link?: string;
  sponsor_ids?: number[];
  state?: SubmissionState;
}

export interface SponsorCreate {
  name: string;
  description: string;
  logo?: string;
  website?: string;
}

export interface PrizeCreate {
  title: string;
  description: string;
  value: string;
  sponsor_id?: number;
}

export interface IssueCreate {
  title: string;
  description: string;
}

export interface IssueUpdate {
  status?: "open" | "in_progress" | "resolved";
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  members: TeamMember[];
  hackathon_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Submission {
  id: number;
  title: string;
  description: string;
  github_link: string;
  presentation_link?: string;
  state: SubmissionState;
  sponsors_used: Sponsor[];
  team_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Sponsor {
  id: number;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  hackathon_id: number;
  employees: User[];
  created_at: Date;
}

export interface Prize {
  id: number;
  title: string;
  description: string;
  value: string;
  sponsor_id?: number;
  hackathon_id: number;
  created_at: Date;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  reporter_user_id: string;
  status: "open" | "resolved" | "in_progress";
  hackathon_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Hackathon {
  id: number;
  title: string;
  description: string;
  image?: string;
  location: string;
  start_time: Date;
  end_time: Date;
  pin_code: string;
  is_started: boolean;
  organisers: User[];
  sponsors: Sponsor[];
  teams: Team[];
  submissions: Submission[];
  prizes: Prize[];
  issues: Issue[];
  created_at: Date;
  updated_at: Date;
}
