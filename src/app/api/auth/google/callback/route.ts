import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { encodeSession, COOKIE_NAME } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error || "Google sign-in canceled")}`, baseUrl));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=Google+OAuth+credentials+missing", baseUrl));
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Failed to exchange Google token");
    }

    // 2. Fetch authenticated user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) {
      throw new Error("Could not retrieve email address from Google account");
    }

    const email = googleUser.email.toLowerCase().trim();
    const fullName = googleUser.name || "Aviation Member";

    // Parse role from state if provided during signup
    let assignedRole: Role = Role.MENTEE;
    if (state) {
      try {
        const parsedState = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
        if (parsedState.role === "MENTOR") {
          assignedRole = Role.MENTOR;
        }
      } catch {}
    }

    // 3. Find or create user in database
    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: "OAUTH_GOOGLE_ACCOUNT",
          role: assignedRole,
        },
        include: { profile: true },
      });
    }

    // 4. Set session cookie
    const sessionPayload = {
      id: user.id,
      email: user.email,
      role: user.role as any,
      profileId: user.profile?.id || null,
      fullName: user.profile?.fullName || fullName,
    };

    const token = encodeSession(sessionPayload);
    const targetUrl = user.profile ? (user.role === "MENTOR" ? "/dashboard/mentor" : "/dashboard/mentee") : "/onboarding";

    const response = NextResponse.redirect(new URL(targetUrl, baseUrl));
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[GOOGLE_AUTH_ERROR]", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err instanceof Error ? err.message : "Google authentication failed")}`, baseUrl)
    );
  }
}

