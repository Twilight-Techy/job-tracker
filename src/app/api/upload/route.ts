import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getUserFromReq } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  const user = await getUserFromReq(request);
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body as ReadableStream, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Vercel Blob Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file to Vercel Blob" }, { status: 500 });
  }
}
