import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { ApiResponse } from "@/types";
import { RequestStatus } from "@prisma/client";

export async function GET(): Promise<NextResponse<ApiResponse<any[]>>> {
  try {
    const pendingMatches = await prisma.mentorshipRequest.findMany({
      where: { status: RequestStatus.PENDING },
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
      orderBy: { similarityScore: "desc" },
    });

    return NextResponse.json({ success: true, data: pendingMatches });
  } catch (error) {
    console.error("[API_ADMIN_MATCHES_GET_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch pending matches",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { matchId, requestId, approved, status } = await request.json();

    const targetId = matchId || requestId;
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "matchId or requestId is required" },
        { status: 400 }
      );
    }

    let newStatus: RequestStatus;
    if (typeof approved === "boolean") {
      newStatus = approved ? RequestStatus.APPROVED : RequestStatus.REJECTED;
    } else if (status && Object.values(RequestStatus).includes(status)) {
      newStatus = status;
    } else {
      return NextResponse.json(
        { success: false, error: "Either boolean 'approved' or valid 'status' is required" },
        { status: 400 }
      );
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id: targetId },
      data: { status: newStatus },
    });

    return NextResponse.json({
      success: true,
      message: `Match marked as ${newStatus}`,
      data: updated,
    });
  } catch (error) {
    console.error("[API_ADMIN_MATCHES_PATCH_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update match",
      },
      { status: 500 }
    );
  }
}
