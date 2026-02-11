import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import nodemailer from "nodemailer";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "If account exists, OTP sent." },
        { status: 200 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetOtp: hashedOtp,
          passwordResetExpires: expires,
        },
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Password Reset OTP",
        html: `
          <h2>Password Reset OTP</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
        `,
      });
    }

    return NextResponse.json(
      { message: "If account exists, OTP sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
