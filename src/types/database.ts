import type { Role, RequestStatus } from "./index";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileRecord {
  id: string;
  userId: string;
  fullName: string;
  department: string;
  jobTitle: string;
  yearsExperience: number;
  certifications: string;
  rawBio: string;
  cleanedBio: string;
  embedding?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorshipRequestRecordDB {
  id: string;
  menteeId: string;
  mentorId: string;
  similarityScore: number;
  status: RequestStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorCandidateQueryResult {
  id: string;
  userId: string;
  fullName: string;
  department: string;
  jobTitle: string;
  yearsExperience: number;
  certifications: string;
  rawBio: string;
  similarity: number;
}
