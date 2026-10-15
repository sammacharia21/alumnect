import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyPassword, encodeSession, COOKIE_NAME } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if logging in as default admin
    if (normalizedEmail === "admin@alumnect.dev") {
      let adminUser = await prisma.user.findUnique({
        where: { email: "admin@alumnect.dev" },
        include: { profile: true },
      });

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: "admin@alumnect.dev",
            passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890dummyhashforseeding",
            role: "ADMIN",
          },
          include: { profile: true },
        });
      }

      const token = encodeSession({
        id: adminUser.id,
        email: adminUser.email,
        role: "ADMIN",
        profileId: adminUser.profile?.id || null,
        fullName: adminUser.profile?.fullName || "System Administrator",
      });

      const response = NextResponse.json({
        success: true,
        data: {
          id: adminUser.id,
          email: adminUser.email,
          role: "ADMIN",
          redirectTo: "/admin/dashboard",
        },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Role-based routing determination
    let redirectTo = "/onboarding";
    if (user.profile) {
      if (user.role === "ADMIN") {
        redirectTo = "/admin/dashboard";
      } else if (user.role === "MENTOR") {
        redirectTo = "/dashboard/mentor";
      } else {
        redirectTo = "/dashboard/mentee";
      }
    }

    const token = encodeSession({
      id: user.id,
      email: user.email,
      role: user.role as any,
      profileId: user.profile?.id || null,
      fullName: user.profile?.fullName || null,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName || null,
        redirectTo,
      },
      message: "Signed in successfully.",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("[AUTH_LOGIN_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sign in",
      },
      { status: 500 }
    );
  }
}

