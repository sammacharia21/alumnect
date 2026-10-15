import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { ApiResponse, MentorshipRequestRecord } from "@/types";
import { RequestStatus } from "@prisma/client";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MentorshipRequestRecord[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const where: any = {
      status: RequestStatus.APPROVED,
    };

    if (userId) {
      where.OR = [{ menteeId: userId }, { mentorId: userId }];
    }

    const sessions = await prisma.mentorshipRequest.findMany({
      where,
      include: {
        mentee: { select: { id: true, email: true, profile: true } },
        mentor: { select: { id: true, email: true, profile: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted: MentorshipRequestRecord[] = sessions.map((s) => ({
      id: s.id,
      menteeId: s.menteeId,
      mentorId: s.mentorId,
      similarityScore: s.similarityScore,
      status: s.status,
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      mentee: {
        id: s.mentee.id,
        email: s.mentee.email,
        profile: s.mentee.profile
          ? {
              id: s.mentee.profile.id,
              userId: s.mentee.profile.userId,
              fullName: s.mentee.profile.fullName,
              department: s.mentee.profile.department,
              jobTitle: s.mentee.profile.jobTitle,
              yearsExperience: s.mentee.profile.yearsExperience,
              certifications: s.mentee.profile.certifications,
              rawBio: s.mentee.profile.rawBio,
              cleanedBio: s.mentee.profile.cleanedBio,
              createdAt: s.mentee.profile.createdAt.toISOString(),
              updatedAt: s.mentee.profile.updatedAt.toISOString(),
            }
          : null,
      },
      mentor: {
        id: s.mentor.id,
        email: s.mentor.email,
        profile: s.mentor.profile
          ? {
              id: s.mentor.profile.id,
              userId: s.mentor.profile.userId,
              fullName: s.mentor.profile.fullName,
              department: s.mentor.profile.department,
              jobTitle: s.mentor.profile.jobTitle,
              yearsExperience: s.mentor.profile.yearsExperience,
              certifications: s.mentor.profile.certifications,
              rawBio: s.mentor.profile.rawBio,
              cleanedBio: s.mentor.profile.cleanedBio,
              createdAt: s.mentor.profile.createdAt.toISOString(),
              updatedAt: s.mentor.profile.updatedAt.toISOString(),
            }
          : null,
      },
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("[API_SESSIONS_GET_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch active sessions",
      },
      { status: 500 }
    );
  }
}
