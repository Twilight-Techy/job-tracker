import { db } from "@/db";
import { baseContexts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileClient } from "./ProfileClient";
import { getUserFromReq } from "@/lib/auth-helpers";

export default async function ProfilePage() {
  const user = await getUserFromReq();
  if (!user?.id) return null;

  const existing = await db.select().from(baseContexts).where(eq(baseContexts.userId, user.id)).limit(1);
  const initialContext = existing.length > 0 ? existing[0].content : null;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <ProfileClient initialContext={initialContext} userId={user.id} />
    </div>
  );
}
