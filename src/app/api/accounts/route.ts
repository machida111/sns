import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { encryptJson } from "@/lib/crypto";

export async function GET() {
  const accounts = await prisma.platformAccount.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, platform: true, label: true, isActive: true, createdAt: true },
  });
  return NextResponse.json({ accounts });
}

const schema = z.object({
  platform: z.nativeEnum(Platform),
  label: z.string().min(1).max(100),
  credentials: z.record(z.string(), z.string()),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "入力内容が正しくありません", details: parsed.error.flatten() }, { status: 400 });
  }

  const account = await prisma.platformAccount.create({
    data: {
      platform: parsed.data.platform,
      label: parsed.data.label,
      credentials: encryptJson(parsed.data.credentials),
    },
    select: { id: true, platform: true, label: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({ account }, { status: 201 });
}
