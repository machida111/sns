import { NextRequest, NextResponse } from "next/server";
import { publishDuePosts } from "@/lib/publish";

// 外部スケジューラ (Vercel Cron / GitHub Actions / cron-job.org 等) から
// `Authorization: Bearer <CRON_SECRET>` ヘッダー付きでこのエンドポイントを
// 定期的に呼び出すことで、SCHEDULED状態かつscheduledAtが過去の投稿を自動publishします。
export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const provided = authHeader?.replace(/^Bearer\s+/i, "");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await publishDuePosts();
  return NextResponse.json({ published: results.length, results });
}
