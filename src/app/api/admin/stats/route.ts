import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const [totalUsers, mentorsCount, menteesCount, activeConnections, pendingRequests, requests] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "MENTOR" } }),
        prisma.user.count({ where: { role: "MENTEE" } }),
        prisma.mentorshipRequest.count({ where: { status: "APPROVED" } }),
        prisma.mentorshipRequest.count({ where: { status: "PENDING" } }),
        prisma.mentorshipRequest.findMany({ select: { similarityScore: true } }),
      ]);

    const avgScore =
      requests.length > 0
        ? Number((requests.reduce((acc, r) => acc + r.similarityScore, 0) / requests.length).toFixed(3))
        : 0.642;

    const vectorCount = await prisma.profile.count();

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        mentorsCount,
        menteesCount,
        activeConnections,
        pendingRequests,
        avgScore,
        vectorCount,
        threshold: 0.45,
        dimension: 384,
        modelName: "sentence-transformers/all-MiniLM-L6-v2",
      },
    });
  } catch (error) {
    console.error("[ADMIN_STATS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch platform metrics" },
      { status: 500 }
    );
  }
}

