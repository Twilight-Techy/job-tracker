import { NextResponse } from "next/server";
import { getUserFromReq } from "@/lib/auth-helpers";
import { db } from "@/db";
import { baseContexts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request) {
  const user = await getUserFromReq(req);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const existing = await db.select().from(baseContexts).where(eq(baseContexts.userId, user.id)).limit(1);

    if (existing.length > 0) {
      await db.update(baseContexts)
        .set({ content, updatedAt: new Date() })
        .where(eq(baseContexts.userId, user.id));
    } else {
      await db.insert(baseContexts).values({
        userId: user.id,
        content,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update base context:", error);
    return NextResponse.json({ error: "Failed to update base context", details: error.message }, { status: 500 });
  }
}
