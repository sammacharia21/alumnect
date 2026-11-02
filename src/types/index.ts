export type Role = "MENTOR" | "MENTEE" | "ADMIN";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  department: string;
  jobTitle: string;
  yearsExperience: number;
  certifications: string;
  rawBio: string;
  cleanedBio?: string;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorMatch {
  id: string;
  userId: string;
  fullName: string;
  department: string;
  jobTitle: string;
  yearsExperience: number;
  certifications: string;
  rawBio: string;
  similarity: number;
  compatibilityPercentage: number;
}

export interface SessionLogItem {
  id: string;
  authorName: string;
  authorRole: Role;
  text: string;
  createdAt: string;
}

export interface MentorshipSessionData {
  intro?: string;
  meetingLink?: string;
  scheduledAt?: string;
  logs: SessionLogItem[];
}

export interface MentorshipRequestRecord {
  id: string;
  menteeId: string;
  mentorId: string;
  similarityScore: number;
  status: RequestStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  sessionData?: MentorshipSessionData;
  mentee?: {
    id: string;
    email: string;
    profile?: Profile | null;
  };
  mentor?: {
    id: string;
    email: string;
    profile?: Profile | null;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
