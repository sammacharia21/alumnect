import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import type { MatchRecord } from "@/types/database";

export async function GET(): Promise<NextResponse<ApiResponse<MatchRecord[]>>> {
  // TODO: return all pending matches for admin review
  return NextResponse.json({ success: true, data: [] });
}

export async function PATCH(request: Request): Promise<NextResponse<ApiResponse>> {
  const { matchId, approved } = await request.json();

  if (!matchId || typeof approved !== "boolean") {
    return NextResponse.json({ success: false, error: "matchId and approved are required" }, { status: 400 });
  }

  // TODO: update match approval status via Prisma
  return NextResponse.json({ success: true });
}
