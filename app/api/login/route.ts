import { eq } from "drizzle-orm";
import { db } from "@/app/src";                 // <-- correct import
import { users } from "@/app/src/db/schema";
import { NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Example: you would also check the password hash here
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullname: users.fullname,
        passwordHash:users.passwordHash
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, String(user.passwordHash));

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Set the session cookie
    await createSessionCookie({
      id: String(user.id),
      email: String(user.email),
      role: user.role,
      fullname: String(user.fullname),
    });

    return NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}

// Optional GET for quick health‑check
export async function GET() {
  return NextResponse.json({ msg: "Login endpoint  –  POST to authenticate" });
}
