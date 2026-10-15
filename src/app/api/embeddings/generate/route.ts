import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/vector_search";
import prisma from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ embedding: number[]; profileId?: string }>>> {
  try {
    const { profileId, text } = await request.json();

    let targetText = text;

    if (!targetText && profileId) {
      const profile = await prisma.profile.findUnique({
        where: { id: profileId },
      });

      if (!profile) {
        return NextResponse.json(
          { success: false, error: `Profile not found for ID: ${profileId}` },
          { status: 404 }
        );
      }

      targetText = profile.cleanedBio || profile.rawBio;
    }

    if (!targetText || !targetText.trim()) {
      return NextResponse.json(
        { success: false, error: "Either 'text' or 'profileId' is required." },
        { status: 400 }
      );
    }

    const embedding = await generateEmbedding(targetText);

    // If profileId was provided, update the profile embedding in PostgreSQL
    if (profileId) {
      const vectorStr = `[${embedding.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE profiles SET embedding = $1::vector, "updatedAt" = NOW() WHERE id = $2`,
        vectorStr,
        profileId
      );
    }

    return NextResponse.json({
      success: true,
      data: { embedding, profileId },
    });
  } catch (error) {
    console.error("[API_EMBEDDINGS_GENERATE_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate embedding",
      },
      { status: 500 }
    );
  }
}
