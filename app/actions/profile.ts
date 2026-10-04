"use server";
import { db } from "@/app/src";
import { eq } from "drizzle-orm";
import { photographer_profiles, profiles, users } from "@/app/src/db/schema";

export async function saveProfileImage(userId: number, profileImageUrl: string) {
  try {
    const numericUserId = Number(userId);
    if (!Number.isSafeInteger(numericUserId) || numericUserId <= 0 || !profileImageUrl) {
      return { success: false, error: "User ID and image URL are required" };
    }

    await db.transaction(async (transaction) => {
      const [user] = await transaction
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.id, numericUserId))
        .limit(1);

      if (!user) {
        throw new Error("User account not found.");
      }

      await transaction
        .update(users)
        .set({ profile_image_url: profileImageUrl })
        .where(eq(users.id, numericUserId));

      const [profile] = await transaction
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.userId, numericUserId))
        .limit(1);

      if (profile) {
        await transaction
          .update(profiles)
          .set({ profile_image_url: profileImageUrl })
          .where(eq(profiles.userId, numericUserId));
      } else {
        await transaction.insert(profiles).values({
          userId: numericUserId,
          profile_image_url: profileImageUrl,
        });
      }

      if (user.role === "photographer") {
        await transaction
          .update(photographer_profiles)
          .set({ profile_image_url: profileImageUrl })
          .where(eq(photographer_profiles.userId, numericUserId));
      }
    });

    return { success: true, url: profileImageUrl };
  } catch (error) {
    console.error("Error saving profile image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save profile image",
    };
  }
}
