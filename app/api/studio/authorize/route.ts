
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq ,sql} from "drizzle-orm";

import { verifyToken } from "@/lib/auth";
import { db } from "@/app/src";
import { users, studioAuthCodes } from "@/app/src/db/schema";


export const runtime = "nodejs";

export async function POST() {
  try {
    // 1. Read the existing LensConnect session.
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Please log in to LensConnect first." },
        { status: 401 }
      );
    }

    // 2. Verify the JWT.
    const session = await verifyToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        { error: "Your session is invalid or expired." },
        { status: 401 }
      );
    }

    // 3. Confirm the account still exists and is a photographer.
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullname: users.fullname,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, Number(session.id)))
      .limit(1);

    if (!user || user.role !== "photographer") {
      return NextResponse.json(
        { error: "Photographer access is required." },
        { status: 403 }
      );
    }

    // 4. Generate a cryptographically random, one-time code.
    const code = randomBytes(32).toString("hex");
    const codeHash = createHash("sha256").update(code).digest("hex");

   const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 5. Store only the hash of the code.
    await db.insert(studioAuthCodes).values({
      id: crypto.randomUUID(),
      userId: user.id,
      codeHash,
      createdAt: new Date(),
      expiresAt,
    });
console.log("Authorize hash prefix:", codeHash.slice(0, 12));
console.log("JS now:", new Date().toISOString());
console.log("JS expiry:", expiresAt.toISOString());
console.log("Expected lifetime (seconds):", 
  Math.round((expiresAt.getTime() - Date.now()) / 1000)
);
    // Return the code to the local frontend handoff.
    return NextResponse.json({
      code,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Studio authorization error:", error);
    

    return NextResponse.json(
      { error: "Unable to authorize LensConnect Studio." },
      { status: 500 }
    );
  }
}
