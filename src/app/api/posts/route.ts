import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Platform, PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") as PostStatus | null;
  const platform = request.nextUrl.searchParams.get("platform") as Platform | null;

  const posts = await prisma.post.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(platform ? { platform } : {}),
    },
    include: { account: { select: { id: true, label: true, platform: true } } },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return NextResponse.json({ posts });
}

const schema = z.object({
  platform: z.nativeEnum(Platform),
  accountId: z.string().min(1),
  title: z.string().optional().nullable(),
  content: z.string().min(1),
  mediaUrl: z.string().url().optional().nullable(),
  aiTopic: z.string().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容が正しくありません", details: parsed.error.flatten() }, { status: 400 });
  }

  const { scheduledAt, ...rest } = parsed.data;

  const post = await prisma.post.create({
    data: {
      ...rest,
      status: scheduledAt ? PostStatus.SCHEDULED : PostStatus.DRAFT,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
