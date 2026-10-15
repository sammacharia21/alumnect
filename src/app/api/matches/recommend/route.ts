import { NextRequest, NextResponse } from "next/server";
import { recommendMentorsForText, searchMentorsByVector, generateEmbedding } from "@/lib/vector_search";
import prisma from "@/lib/db";
import type { ApiResponse, MentorMatch } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<MentorMatch[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || searchParams.get("text");
    const profileId = searchParams.get("profileId");
    const department = searchParams.get("department") || undefined;
    const thresholdParam = searchParams.get("threshold");
    const limitParam = searchParams.get("limit");

    const threshold = thresholdParam ? parseFloat(thresholdParam) : 0.45;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    let targetText = query;
    let excludeUserId: string | undefined = undefined;

    if (!targetText && profileId) {
      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: { user: true },
      });

      if (!profile) {
        return NextResponse.json(
          { success: false, error: `Profile not found for ID: ${profileId}` },
          { status: 404 }
        );
      }

      targetText = profile.cleanedBio || profile.rawBio;
      excludeUserId = profile.userId;
    }

    if (!targetText || !targetText.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Either 'query' text or valid 'profileId' must be provided.",
        },
        { status: 400 }
      );
    }

    const matches = await recommendMentorsForText(targetText, {
      threshold,
      limit,
      department,
      excludeUserId,
    });

    return NextResponse.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error("[API_RECOMMEND_GET_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error occurred",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<MentorMatch[]>>> {
  try {
    const body = await request.json();
    const {
      text,
      bio,
      profileId,
      threshold = 0.45,
      limit = 10,
      department,
      excludeUserId,
    } = body;

    let targetText: string = (text || bio || body.bioText || "").trim();
    const effectiveThreshold = threshold !== undefined ? threshold : (body.minSimilarity !== undefined ? body.minSimilarity : 0.45);
    let effectiveExclude = excludeUserId;

    if (!targetText && profileId) {
      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
        include: { user: true },
      });

      if (!profile) {
        return NextResponse.json(
          { success: false, error: `Profile not found for ID: ${profileId}` },
          { status: 404 }
        );
      }

      targetText = profile.cleanedBio || profile.rawBio;
      effectiveExclude = effectiveExclude || profile.userId;
    }

    if (!targetText) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid 'text' string or 'profileId' is required for recommendations.",
        },
        { status: 400 }
      );
    }

    const matches = await recommendMentorsForText(targetText, {
      threshold: Number(effectiveThreshold),
      limit: Number(limit),
      department: department || undefined,
      excludeUserId: effectiveExclude,
    });

    return NextResponse.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error("[API_RECOMMEND_POST_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error occurred",
      },
      { status: 500 }
    );
  }
}
