import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { email, otp, password } = parsed.data;

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        passwordResetOtp: hashedOtp,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        passwordResetOtp: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
