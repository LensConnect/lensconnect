import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { db } from "@/app/src";
import { users } from "@/app/src/db/schema";
import { createSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();

    const {
      fullname,
      email,
      password,
      role,
    } = body;

    // -----------------------------------------
    // 1. Validate required fields
    // -----------------------------------------

    if (!fullname || !email || !password || !role) {
      return NextResponse.json(
        {
          error:
            "Full name, email, password, and role are required",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 2. Normalize input
    // -----------------------------------------

    const normalizedFullname = String(fullname).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    console.log("SIGNUP EMAIL RECEIVED:", email);
console.log("NORMALIZED EMAIL:", normalizedEmail);

    // -----------------------------------------
    // 3. Validate values
    // -----------------------------------------

    if (!normalizedFullname) {
      return NextResponse.json(
        {
          error: "Full name is required",
        },
        { status: 400 }
      );
    }

    if (!normalizedEmail) {
      return NextResponse.json(
        {
          error: "Email is required",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error: "Password is required",
        },
        { status: 400 }
      );
    }

    if (!["client", "photographer"].includes(role)) {
      return NextResponse.json(
        {
          error:
            "Invalid role. Must be 'client' or 'photographer'",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 4. Check if email already exists
    // -----------------------------------------

    const existingUser = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          error: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    

    // -----------------------------------------
    // 5. Hash password
    // -----------------------------------------

    const passwordHash = await bcrypt.hash(
      String(password),
      12
    );

    // -----------------------------------------
    // 6. Create user
    // -----------------------------------------

    await db.insert(users).values({
      fullname: normalizedFullname,
      email: normalizedEmail,
      role,
      passwordHash,
    });

    // -----------------------------------------
    // 7. Fetch newly created user
    // -----------------------------------------

    const [createdUser] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullname: users.fullname,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!createdUser) {
      return NextResponse.json(
        {
          error:
            "User was created but could not be retrieved",
        },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // 8. Create session cookie
    // -----------------------------------------

    await createSessionCookie({
      id: String(createdUser.id),
      email: createdUser.email,
      role: createdUser.role,
      fullname: createdUser.fullname,
    });

    // -----------------------------------------
    // 9. Return successful response
    // -----------------------------------------

    return NextResponse.json(
      {
        message: "User created successfully",
        user: createdUser,
      },
      { status: 201 }
    );
  } catch (error) {
    // -----------------------------------------
    // 10. Handle errors
    // -----------------------------------------

    console.error("Signup route error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Signup failed";

    
    if (
      message.includes("Duplicate entry") ||
      message.toLowerCase().includes("unique")
    ) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}