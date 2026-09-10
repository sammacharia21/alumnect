import { NextResponse } from "next/server";
import type { ApiResponse, Profile } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<Profile[]>>> {
  // TODO: fetch authenticated user's profile(s) from the database
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  const body = await request.json();
  // TODO: validate body and persist profile via Prisma
  return NextResponse.json({ success: true, data: body });
}
