import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ResumePreviewClient } from "./ResumePreviewClient";
import { getUserFromReq } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function ResumePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromReq();
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  
  if (isNaN(id) || !user?.id) {
    notFound();
  }

  const resumeRecords = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
  if (resumeRecords.length === 0 || resumeRecords[0].userId !== user.id) {
    notFound();
  }

  const resume = resumeRecords[0];

  // If this is an external link or upload but has no fileUrl, show an error
  if ((resume.type === "link" || resume.type === "upload") && !resume.fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <h2 className="text-2xl font-bold mb-2">File Not Found</h2>
        <p className="text-muted-foreground">This resume is marked as an uploaded file or link but has no URL attached.</p>
      </div>
    );
  }

  return <ResumePreviewClient resume={resume} />;
}
