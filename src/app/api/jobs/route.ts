import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userJobs = await db.query.jobs.findMany({
      where: eq(jobs.userId, user.id),
      orderBy: [desc(jobs.createdAt)],
    });
    return NextResponse.json(userJobs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Calculate dates if present
    const deadline = data.deadline ? new Date(data.deadline) : null;
    const dateApplied = data.dateApplied ? new Date(data.dateApplied) : null;
    const feedbackDate = data.feedbackDate ? new Date(data.feedbackDate) : null;

    const newJob = await db.insert(jobs).values({
      userId: user.id,
      company: data.company,
      jobTitle: data.jobTitle,
      country: data.country,
      location: data.location,
      type: data.type,
      level: data.level,
      workMode: data.workMode,
      sponsorshipOffered: data.sponsorshipOffered,
      applicationLink: data.applicationLink,
      deadline,
      dateApplied,
      status: data.status || 'Applied',
      feedbackDate,
      source: data.source,
      priority: data.priority,
      referralUsed: data.referralUsed,
      currency: data.currency,
      estimatedMonthlySalaryOriginal: data.estimatedMonthlySalaryOriginal ? parseInt(data.estimatedMonthlySalaryOriginal) : null,
      resumeUsedId: data.resumeUsedId ? parseInt(data.resumeUsedId) : null,
      requirements: data.requirements,
      notes: data.notes,
    }).returning();

    return NextResponse.json(newJob[0]);
  } catch (error: any) {
    console.error("Failed to create job:", error);
    return NextResponse.json({ error: "Failed to create job", details: error.message }, { status: 500 });
  }
}
