import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (userId) {
      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!profile) {
        return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: profile });
    }

    const where: any = {};
    if (role) {
      where.user = { role: role.toUpperCase() };
    }

    const profiles = await prisma.profile.findMany({
      where,
      take: limit,
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: profiles });
  } catch (error) {
    console.error("[API_PROFILE_GET_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch profiles",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const body = await request.json();
    const {
      userId,
      fullName,
      department,
      jobTitle,
      yearsExperience = 0,
      certifications = "",
      rawBio = "",
    } = body;

    if (!userId || !fullName || !department || !jobTitle) {
      return NextResponse.json(
        { success: false, error: "userId, fullName, department, and jobTitle are required." },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName,
        department,
        jobTitle,
        yearsExperience: Number(yearsExperience),
        certifications,
        rawBio,
      },
      create: {
        userId,
        fullName,
        department,
        jobTitle,
        yearsExperience: Number(yearsExperience),
        certifications,
        rawBio,
        cleanedBio: rawBio,
      },
      include: { user: true },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("[API_PROFILE_POST_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save profile",
      },
      { status: 500 }
    );
  }
}
