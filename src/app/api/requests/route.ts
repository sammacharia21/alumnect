import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser, getSessionFromRequest } from "@/lib/auth";
import type { ApiResponse, MentorshipRequestRecord, MentorshipSessionData, Role } from "@/types";
import { RequestStatus } from "@prisma/client";

function parseSessionData(rawNotes?: string | null): MentorshipSessionData {
  if (!rawNotes) {
    return { intro: "", logs: [] };
  }
  try {
    const parsed = JSON.parse(rawNotes);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        intro: parsed.intro || "",
        meetingLink: parsed.meetingLink || "",
        scheduledAt: parsed.scheduledAt || "",
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      };
    }
  } catch {}
  return {
    intro: rawNotes,
    logs: [],
  };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MentorshipRequestRecord[]>>> {
  try {
    const session = getSessionFromRequest(request) || (await getCurrentUser());
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    const requestedRole = searchParams.get("role");
    const status = searchParams.get("status") as RequestStatus | null;

    const where: any = {};
    const isAdmin = session?.role === "ADMIN";

    if (requestedUserId) {
      if (requestedRole === "mentee") {
        where.menteeId = requestedUserId;
      } else if (requestedRole === "mentor") {
        where.mentorId = requestedUserId;
      } else {
        where.OR = [{ menteeId: requestedUserId }, { mentorId: requestedUserId }];
      }
    } else if (!isAdmin && session?.id) {
      if (session.role === "MENTEE") {
        where.menteeId = session.id;
      } else if (session.role === "MENTOR") {
        where.mentorId = session.id;
      } else {
        where.OR = [{ menteeId: session.id }, { mentorId: session.id }];
      }
    }

    if (status && Object.values(RequestStatus).includes(status)) {
      where.status = status;
    }

    const requests = await prisma.mentorshipRequest.findMany({
      where,
      include: {
        mentee: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: true,
          },
        },
        mentor: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted: MentorshipRequestRecord[] = requests.map((r) => ({
      id: r.id,
      menteeId: r.menteeId,
      mentorId: r.mentorId,
      similarityScore: r.similarityScore,
      status: r.status,
      notes: r.notes,
      sessionData: parseSessionData(r.notes),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      mentee: {
        id: r.mentee.id,
        email: r.mentee.email,
        profile: r.mentee.profile
          ? {
              id: r.mentee.profile.id,
              userId: r.mentee.profile.userId,
              fullName: r.mentee.profile.fullName,
              department: r.mentee.profile.department,
              jobTitle: r.mentee.profile.jobTitle,
              yearsExperience: r.mentee.profile.yearsExperience,
              certifications: r.mentee.profile.certifications,
              rawBio: r.mentee.profile.rawBio,
              cleanedBio: r.mentee.profile.cleanedBio,
              createdAt: r.mentee.profile.createdAt.toISOString(),
              updatedAt: r.mentee.profile.updatedAt.toISOString(),
            }
          : null,
      },
      mentor: {
        id: r.mentor.id,
        email: r.mentor.email,
        profile: r.mentor.profile
          ? {
              id: r.mentor.profile.id,
              userId: r.mentor.profile.userId,
              fullName: r.mentor.profile.fullName,
              department: r.mentor.profile.department,
              jobTitle: r.mentor.profile.jobTitle,
              yearsExperience: r.mentor.profile.yearsExperience,
              certifications: r.mentor.profile.certifications,
              rawBio: r.mentor.profile.rawBio,
              cleanedBio: r.mentor.profile.cleanedBio,
              createdAt: r.mentor.profile.createdAt.toISOString(),
              updatedAt: r.mentor.profile.updatedAt.toISOString(),
            }
          : null,
      },
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("[API_REQUESTS_GET_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch mentorship requests",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MentorshipRequestRecord>>> {
  try {
    const session = getSessionFromRequest(request) || (await getCurrentUser());
    const body = await request.json();
    const { mentorId, similarityScore = 0.0, notes = "" } = body;
    const menteeId = body.menteeId || session?.id;

    if (!menteeId || !mentorId) {
      return NextResponse.json(
        { success: false, error: "menteeId and mentorId are both required." },
        { status: 400 }
      );
    }

    // Check if duplicate pending request already exists
    const existing = await prisma.mentorshipRequest.findFirst({
      where: {
        menteeId,
        mentorId,
        status: RequestStatus.PENDING,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "A pending mentorship request already exists for this mentor.",
        },
        { status: 409 }
      );
    }

    const created = await prisma.mentorshipRequest.create({
      data: {
        menteeId,
        mentorId,
        similarityScore: Number(similarityScore),
        status: RequestStatus.PENDING,
        notes: notes || null,
      },
      include: {
        mentee: { select: { id: true, email: true, profile: true } },
        mentor: { select: { id: true, email: true, profile: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        menteeId: created.menteeId,
        mentorId: created.mentorId,
        similarityScore: created.similarityScore,
        status: created.status,
        notes: created.notes,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      message: "Mentorship request submitted successfully.",
    });
  } catch (error) {
    console.error("[API_REQUESTS_POST_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit mentorship request",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = getSessionFromRequest(request) || (await getCurrentUser());
    const body = await request.json();
    const { requestId, status, notes, meetingLink, scheduledAt, newLogNote } = body;

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "requestId is required." },
        { status: 400 }
      );
    }

    if (status && !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "status must be PENDING, APPROVED, or REJECTED." },
        { status: 400 }
      );
    }

    const existing = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: {
        mentee: { select: { email: true, profile: { select: { fullName: true } } } },
        mentor: { select: { email: true, profile: { select: { fullName: true } } } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Mentorship request not found." },
        { status: 404 }
      );
    }

    // Parse current session data
    const sessionData = parseSessionData(existing.notes);

    if (meetingLink !== undefined) {
      sessionData.meetingLink = meetingLink.trim();
    }
    if (scheduledAt !== undefined) {
      sessionData.scheduledAt = scheduledAt;
    }
    if (notes !== undefined && !meetingLink && !scheduledAt && !newLogNote) {
      sessionData.intro = notes;
    }

    if (newLogNote && typeof newLogNote === "string" && newLogNote.trim()) {
      const authorRole: Role = (session?.role as Role) || "MENTEE";
      const authorName =
        session?.fullName ||
        (authorRole === "MENTOR"
          ? existing.mentor.profile?.fullName || "Mentor"
          : existing.mentee.profile?.fullName || "Mentee");

      sessionData.logs.push({
        id: crypto.randomUUID(),
        authorName,
        authorRole,
        text: newLogNote.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: {
        ...(status ? { status: status as RequestStatus } : {}),
        notes: JSON.stringify(sessionData),
      },
      include: {
        mentee: { select: { id: true, email: true, profile: true } },
        mentor: { select: { id: true, email: true, profile: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Mentorship request updated successfully.`,
      data: {
        id: updated.id,
        status: updated.status,
        sessionData: parseSessionData(updated.notes),
      },
    });
  } catch (error) {
    console.error("[API_REQUESTS_PATCH_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update mentorship request",
      },
      { status: 500 }
    );
  }
}

