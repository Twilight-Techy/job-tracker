import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    await db
      .delete(jobs)
      .where(and(eq(jobs.id, parseInt(resolvedParams.id)), eq(jobs.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const resolvedParams = await params;
    
    // Calculate dates if present
    const deadline = data.deadline ? new Date(data.deadline) : null;
    const dateApplied = data.dateApplied ? new Date(data.dateApplied) : null;
    const feedbackDate = data.feedbackDate ? new Date(data.feedbackDate) : null;

    const updatedJob = await db
      .update(jobs)
      .set({
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
        status: data.status,
        feedbackDate,
        source: data.source,
        priority: data.priority,
        referralUsed: data.referralUsed,
        currency: data.currency,
        estimatedMonthlySalaryOriginal: data.estimatedMonthlySalaryOriginal ? parseInt(data.estimatedMonthlySalaryOriginal) : null,
        resumeUsedId: data.resumeUsedId ? parseInt(data.resumeUsedId) : null,
        requirements: data.requirements,
        notes: data.notes,
        updatedAt: new Date(),
      })
      .where(and(eq(jobs.id, parseInt(resolvedParams.id)), eq(jobs.userId, user.id)))
      .returning();

    if (!updatedJob.length) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(updatedJob[0]);
  } catch (error: any) {
    console.error("Failed to update job:", error);
    return NextResponse.json({ error: "Failed to update job", details: error.message }, { status: 500 });
  }
}
