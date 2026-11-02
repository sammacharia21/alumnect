import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { encodeSession, COOKIE_NAME } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isDemo = searchParams.get("demo") === "true";
  const roleParam = searchParams.get("role") || "MENTEE";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // 1. If user clicks "Simulate Google Login" or keys are missing and demo is confirmed
  if (isDemo || (!clientId && isDemo)) {
    const demoEmail = searchParams.get("email") || "pilot.student@gmail.com";
    const demoName = searchParams.get("name") || "Samuel Wanyoike (Google)";

    const assignedRole: Role = roleParam.toUpperCase() === "MENTOR" ? Role.MENTOR : Role.MENTEE;

    let user = await prisma.user.findUnique({
      where: { email: demoEmail.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: demoEmail.toLowerCase(),
          passwordHash: "OAUTH_GOOGLE_ACCOUNT",
          role: assignedRole,
        },
        include: { profile: true },
      });
    }

    const sessionPayload = {
      id: user.id,
      email: user.email,
      role: user.role as any,
      profileId: user.profile?.id || null,
      fullName: user.profile?.fullName || demoName,
    };

    const token = encodeSession(sessionPayload);
    const targetUrl = user.profile ? (user.role === "MENTOR" ? "/dashboard/mentor" : "/dashboard/mentee") : "/onboarding";

    const response = NextResponse.redirect(new URL(targetUrl, request.url));
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  }

  // 2. Real Google OAuth redirect if keys are present
  if (clientId) {
    const state = Buffer.from(JSON.stringify({ role: roleParam })).toString("base64url");
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=${state}&prompt=select_account`;

    return NextResponse.redirect(googleAuthUrl);
  }

  // 3. Fallback: Prompt user that credentials are required or let them test with demo
  return NextResponse.json(
    {
      success: false,
      error: "Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) are not configured in .env",
      hint: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env, or use ?demo=true to test the workflow.",
    },
    { status: 400 }
  );
}

