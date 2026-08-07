import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { jobs, resumes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DashboardJobsClient } from "./DashboardJobsClient";

export default async function DashboardPage() {
  const user = await getUserFromReq();
  if (!user?.id) return null;

  const userJobs = await db.query.jobs.findMany({
    where: eq(jobs.userId, user.id),
    orderBy: [desc(jobs.createdAt)],
  });

  const userResumes = await db.query.resumes.findMany({
    where: eq(resumes.userId, user.id),
    orderBy: [desc(resumes.createdAt)],
  });

  return (
    <div className="space-y-6">
      <DashboardJobsClient jobs={userJobs as any[]} resumes={userResumes as any[]} />
    </div>
  );
}
