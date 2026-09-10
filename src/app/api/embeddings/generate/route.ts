import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export async function POST(request: Request): Promise<NextResponse<ApiResponse<{ embedding: number[] }>>> {
  const { profileId } = await request.json();

  if (!profileId) {
    return NextResponse.json({ success: false, error: "profileId is required" }, { status: 400 });
  }

  // TODO: call the Python ML engine (ML_ENGINE_URL) to generate the embedding
  return NextResponse.json({ success: true, data: { embedding: [] } });
}
