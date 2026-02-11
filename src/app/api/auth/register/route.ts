import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signAuthToken, AUTH_COOKIE_NAME } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password too long"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters long",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        role: "EDITOR",
      },
    });

    const token = signAuthToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 }
    );
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("Failed to register user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}


