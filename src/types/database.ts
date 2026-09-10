export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  role: "STUDENT" | "ALUMNI" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileRecord {
  id: string;
  userId: string;
  fullName: string;
  bio: string;
  skills: string[];
  interests: string[];
  embedding: number[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchRecord {
  id: string;
  profileId: string;
  matchedProfileId: string;
  score: number;
  approved: boolean;
  createdAt: Date;
}

export interface SessionRecord {
  id: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: Date;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
