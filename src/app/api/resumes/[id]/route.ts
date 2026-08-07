import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const { name, content, type, fileUrl } = await req.json();

    const updatedResume = await db
      .update(resumes)
      .set({
        name,
        content,
        type: type || "builder",
        fileUrl: fileUrl || null,
      })
      .where(and(eq(resumes.id, parseInt(resolvedParams.id)), eq(resumes.userId, user.id)))
      .returning();

    if (updatedResume.length === 0) {
      return NextResponse.json({ error: "Resume not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updatedResume[0]);
  } catch (error) {
    console.error("Failed to update resume:", error);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

import { del } from "@vercel/blob";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const resumeId = parseInt(resolvedParams.id);
    
    // First, fetch the resume to check if it has an associated uploaded file
    const existingResume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)))
      .limit(1);

    if (existingResume.length === 0) {
      return NextResponse.json({ error: "Resume not found or unauthorized" }, { status: 404 });
    }

    const resume = existingResume[0];

    // If it's an uploaded file with a vercel blob URL, delete it from blob storage
    if (resume.type === "upload" && resume.fileUrl && resume.fileUrl.includes("public.blob.vercel-storage.com")) {
      try {
        await del(resume.fileUrl);
        console.log(`Successfully deleted blob: ${resume.fileUrl}`);
      } catch (blobError) {
        console.error("Failed to delete blob from Vercel:", blobError);
        // Continue with DB deletion even if blob deletion fails, to not leave orphaned DB records
      }
    }

    await db
      .delete(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete resume:", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
