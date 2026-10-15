import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.toUpperCase();
    const limit = parseInt(searchParams.get("limit") || "40", 10);

    const where: any = {};

    if (role && ["MENTOR", "MENTEE", "ADMIN"].includes(role)) {
      where.role = role as Role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { profile: { fullName: { contains: search, mode: "insensitive" } } },
        { profile: { department: { contains: search, mode: "insensitive" } } },
        { profile: { jobTitle: { contains: search, mode: "insensitive" } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      take: limit,
      include: {
        profile: true,
        _count: {
          select: {
            sentRequests: true,
            receivedRequests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[ADMIN_USERS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role || !["MENTOR", "MENTEE", "ADMIN"].includes(role.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Valid userId and role are required." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role.toUpperCase() as Role },
      include: { profile: true },
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}.`,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update user role." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User account and associated records deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete user." },
      { status: 500 }
    );
  }
}

