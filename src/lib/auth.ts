import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import type { AuthUser } from "./types";

const AUTH_COOKIE = "auth_token";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

interface TokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = AUTH_COOKIE;

export async function getUserFromRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyAuthToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}


