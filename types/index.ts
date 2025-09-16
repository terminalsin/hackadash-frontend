import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export enum UserRole {
  ORGANISER = "organiser",
  GUEST = "guest",
  SPONSOR = "sponsor",
}

export enum SubmissionState {
  DRAFT = "draft",
  READY_TO_DEMO = "ready_to_demo",
  PRESENTED = "presented",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: User[];
  hackathonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  githubLink: string;
  presentationLink?: string;
  presentationFile?: string;
  state: SubmissionState;
  sponsorsUsed: string[];
  teamId: string;
  hackathonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sponsor {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  hackathonId: string;
  employees: User[];
  createdAt: Date;
}

export interface Prize {
  id: string;
  title: string;
  description: string;
  value: string;
  sponsorId?: string;
  hackathonId: string;
  createdAt: Date;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  reportedBy: string;
  status: "open" | "resolved" | "in_progress";
  hackathonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hackathon {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: string;
  startTime: Date;
  endTime: Date;
  pinCode: string;
  isStarted: boolean;
  organisers: User[];
  sponsors: Sponsor[];
  teams: Team[];
  submissions: Submission[];
  prizes: Prize[];
  issues: Issue[];
  createdAt: Date;
  updatedAt: Date;
}
