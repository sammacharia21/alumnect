import { NextResponse } from "next/server";
import type { ApiResponse, MatchResult } from "@/types";

export async function GET(request: Request): Promise<NextResponse<ApiResponse<MatchResult[]>>> {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ success: false, error: "profileId is required" }, { status: 400 });
  }

  // TODO: use vector_search to find nearest profiles by embedding similarity
  return NextResponse.json({ success: true, data: [] });
}
