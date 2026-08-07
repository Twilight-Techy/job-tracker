import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DashboardResumesClient } from "./DashboardResumesClient";

export default async function ResumesPage() {
  const user = await getUserFromReq();
  if (!user?.id) return null;

  const userResumes = await db.query.resumes.findMany({
    where: eq(resumes.userId, user.id),
    orderBy: [desc(resumes.createdAt)],
  });

  return (
    <div className="space-y-6">
      <DashboardResumesClient resumes={userResumes} />
    </div>
  );
}
