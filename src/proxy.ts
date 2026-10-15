import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface SessionUser {
  id: string;
  email: string;
  role: "MENTOR" | "MENTEE" | "ADMIN";
  profileId?: string | null;
  fullName?: string | null;
  exp?: number;
}

function parseSessionToken(token: string): SessionUser | null {
  try {
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonStr = atob(base64);
    const data = JSON.parse(jsonStr);
    if (data.exp && Date.now() > data.exp) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("alumnect_session")?.value;
  const session = sessionCookie ? parseSessionToken(sessionCookie) : null;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isOnboardingRoute = pathname === "/onboarding";
  const isMenteeRoute = pathname.startsWith("/dashboard/mentee");
  const isMentorRoute = pathname.startsWith("/dashboard/mentor");
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedDashboard = isMenteeRoute || isMentorRoute || isAdminRoute;

  // 1. If already logged in and visiting /login or /register, redirect to dashboard or onboarding
  if (isAuthRoute && session) {
    if (!session.profileId && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (session.role === "MENTOR") {
      return NextResponse.redirect(new URL("/dashboard/mentor", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/mentee", request.url));
  }

  // 2. Unauthenticated user trying to access protected routes
  if ((isProtectedDashboard || isOnboardingRoute) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated user visiting /onboarding who already completed their profile
  if (isOnboardingRoute && session?.profileId) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (session.role === "MENTOR") {
      return NextResponse.redirect(new URL("/dashboard/mentor", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard/mentee", request.url));
  }

  // 4. User without a completed profile trying to access the dashboard (mandatory onboarding gate)
  if (isProtectedDashboard && session && !session.profileId && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // 5. Role-based routing enforcement
  if (isAdminRoute && session && session.role !== "ADMIN") {
    const fallback = session.role === "MENTOR" ? "/dashboard/mentor" : "/dashboard/mentee";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  if (isMentorRoute && session && session.role === "MENTEE") {
    return NextResponse.redirect(new URL("/dashboard/mentee", request.url));
  }

  if (isMenteeRoute && session && session.role === "MENTOR") {
    return NextResponse.redirect(new URL("/dashboard/mentor", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/onboarding",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};

