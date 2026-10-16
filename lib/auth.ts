
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const encodedKey = new TextEncoder().encode(JWT_SECRET);


export interface SessionPayload {
  id: string;
  email: string;
  role: "client" | "photographer";
  fullname: string;
  expiresAt?: Date;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  const jwt = await new SignJWT({
    ...payload,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30min")
    .sign(encodedKey);

  return jwt;
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSessionCookie(payload: SessionPayload): Promise<void> {
  const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await createToken(payload);

  (await cookies()).set({
    name: "session",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiredAt,
  });
}