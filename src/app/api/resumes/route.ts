import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userResumes = await db.query.resumes.findMany({
      where: eq(resumes.userId, user.id),
      orderBy: [desc(resumes.createdAt)],
    });
    return NextResponse.json(userResumes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (data.type === "builder" && !data.content) {
      return NextResponse.json({ error: "Content is required for builder resumes" }, { status: 400 });
    }

    const newResume = await db.insert(resumes).values({
      userId: user.id,
      name: data.name,
      type: data.type || "builder",
      fileUrl: data.fileUrl || null,
      content: data.content || null,
    }).returning();

    return NextResponse.json(newResume[0]);
  } catch (error: any) {
    console.error("Failed to create resume:", error);
    return NextResponse.json({ error: "Failed to create resume", details: error.message }, { status: 500 });
  }
}
