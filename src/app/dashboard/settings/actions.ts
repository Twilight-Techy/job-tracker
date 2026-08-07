"use server";

import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function generateApiKey() {
  const user = await getUserFromReq();
  if (!user?.id) return;
  
  const newKey = "jt_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Upsert the user settings with the new API key
  const existingSettings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id)
  });

  if (existingSettings) {
    await db.update(userSettings).set({ apiKey: newKey }).where(eq(userSettings.userId, user.id));
  } else {
    await db.insert(userSettings).values({ userId: user.id, apiKey: newKey });
  }
  
  revalidatePath("/dashboard/settings");
}
