import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import type { SessionRecord } from "@/types/database";

export async function GET(): Promise<NextResponse<ApiResponse<SessionRecord[]>>> {
  // TODO: fetch mentorship sessions for the authenticated user
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  const body = await request.json();
  // TODO: validate body and create a mentorship session via Prisma
  return NextResponse.json({ success: true, data: body });
}
