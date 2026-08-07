import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromReq();
  if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const resolvedParams = await params;
  
  const resume = await db.query.resumes.findFirst({
    where: and(eq(resumes.id, parseInt(resolvedParams.id)), eq(resumes.userId, user.id)),
  });

  if (!resume) return new NextResponse("Not Found", { status: 404 });

  if (resume.type === "upload" || resume.type === "link") {
    if (resume.fileUrl) {
      return NextResponse.redirect(resume.fileUrl);
    } else {
      return new NextResponse("File URL not found", { status: 404 });
    }
  }

  // For builder resumes, redirect to the preview page which handles identical PDF generation via the browser's print engine
  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/resumes/${resume.id}?autoPrint=true`, url.origin));
}
