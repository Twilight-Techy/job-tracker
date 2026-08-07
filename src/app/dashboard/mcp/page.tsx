import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MCPClient } from "./MCPClient";

export default async function MCPPage() {
  const user = await getUserFromReq();
  if (!user?.id) return null;

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id)
  });

  return <MCPClient apiKey={settings?.apiKey || null} />;
}
