import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getUserFromReq();
  if (!user?.id) return null;

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id)
  });

  return <SettingsClient apiKey={settings?.apiKey || null} />;
}
