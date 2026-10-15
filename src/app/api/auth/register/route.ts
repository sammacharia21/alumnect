import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword, encodeSession, COOKIE_NAME } from "@/lib/auth";
import { Role } from "@prisma/client";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { email, password, role = "MENTEE" } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    const assignedRole: Role = role.toUpperCase() === "MENTOR" ? Role.MENTOR : Role.MENTEE;
    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as any,
      profileId: null,
      fullName: null,
    };

    const token = encodeSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        redirectTo: "/onboarding",
      },
      message: "Account created successfully. Please complete your aviation profile.",
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
    console.error("[AUTH_REGISTER_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to register account",
      },
      { status: 500 }
    );
  }
}

