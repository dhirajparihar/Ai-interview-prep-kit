import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_jwt_key_for_session_tokens_minimum_32_chars";
const key = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "prepkit_session";

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: Request): Promise<UserSessionPayload | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // Ignore cookies access error if called outside request context
    }
  }

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function setSessionCookie(payload: UserSessionPayload): Promise<string> {
  const token = await createSessionToken(payload);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
