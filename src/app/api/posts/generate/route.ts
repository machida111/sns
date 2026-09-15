import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Platform } from "@prisma/client";
import { generateDraft } from "@/lib/ai/generate";

const schema = z.object({
  platform: z.nativeEnum(Platform),
  topic: z.string().min(1).max(500),
  tone: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "テーマを入力してください" }, { status: 400 });
  }

  try {
    const draft = await generateDraft(parsed.data);
    return NextResponse.json({ draft });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI生成に失敗しました" },
      { status: 500 }
    );
  }
}
