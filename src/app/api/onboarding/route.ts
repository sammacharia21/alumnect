import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateEmbedding } from "@/lib/vector_search";
import { getCurrentUser, getSessionFromRequest, encodeSession, COOKIE_NAME } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const session = getSessionFromRequest(request) || (await getCurrentUser());
    const body = await request.json();

    const userId = body.userId || session?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to complete onboarding." },
        { status: 401 }
      );
    }

    const {
      fullName,
      department,
      jobTitle,
      yearsExperience = 0,
      certifications = "",
      rawBio,
    } = body;

    if (!fullName || !department || !jobTitle || !rawBio?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name, department, job title, and bio are required.",
        },
        { status: 400 }
      );
    }

    // Generate 384-dimensional vector embedding
    const vector = await generateEmbedding(rawBio.trim());
    const vectorStr = `[${vector.join(",")}]`;

    // Persist into PostgreSQL profiles table with vector
    const profileId = (await prisma.profile.findUnique({ where: { userId } }))?.id || null;

    if (profileId) {
      await prisma.$executeRawUnsafe(
        `
        UPDATE profiles
        SET "fullName" = $1,
            department = $2,
            "jobTitle" = $3,
            "yearsExperience" = $4,
            certifications = $5,
            "rawBio" = $6,
            "cleanedBio" = $6,
            embedding = $7::vector,
            "updatedAt" = NOW()
        WHERE "userId" = $8;
        `,
        fullName.trim(),
        department.trim(),
        jobTitle.trim(),
        Number(yearsExperience),
        certifications.trim(),
        rawBio.trim(),
        vectorStr,
        userId
      );
    } else {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO profiles (
          id, "userId", "fullName", department, "jobTitle",
          "yearsExperience", certifications, "rawBio", "cleanedBio",
          embedding, "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4,
          $5, $6, $7, $7,
          $8::vector, NOW(), NOW()
        );
        `,
        userId,
        fullName.trim(),
        department.trim(),
        jobTitle.trim(),
        Number(yearsExperience),
        certifications.trim(),
        rawBio.trim(),
        vectorStr
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true, profile: { select: { id: true } } },
    });

    const targetRole = user?.role || session?.role || "MENTEE";
    const redirectTo = targetRole === "ADMIN"
      ? "/admin/dashboard"
      : targetRole === "MENTOR"
      ? "/dashboard/mentor"
      : "/dashboard/mentee";

    const response = NextResponse.json({
      success: true,
      message: "Profile and 384-dimensional SBERT embedding created successfully.",
      data: {
        userId,
        role: targetRole,
        redirectTo,
      },
    });

    const updatedToken = encodeSession({
      id: userId,
      email: user?.email || session?.email || "",
      role: targetRole as any,
      profileId: user?.profile?.id || profileId || "active-profile",
      fullName: fullName.trim(),
    });

    response.cookies.set(COOKIE_NAME, updatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to complete onboarding",
      },
      { status: 500 }
    );
  }
}

