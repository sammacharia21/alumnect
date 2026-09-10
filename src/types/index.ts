export type UserRole = "STUDENT" | "ALUMNI" | "ADMIN";

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  bio: string;
  skills: string[];
  interests: string[];
  role: UserRole;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  profileId: string;
  matchedProfileId: string;
  score: number;
}

export interface MentorshipSession {
  id: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
