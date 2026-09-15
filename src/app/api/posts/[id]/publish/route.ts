import { NextRequest, NextResponse } from "next/server";
import { publishPostById } from "@/lib/publish";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const post = await publishPostById(id);
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "投稿に失敗しました" }, { status: 500 });
  }
}
