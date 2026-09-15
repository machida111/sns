import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlatformBadge, StatusBadge } from "@/components/Badges";
import { PostDetailActions } from "./PostDetailActions";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { account: true, logs: { orderBy: { createdAt: "desc" } } },
  });

  if (!post) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <PlatformBadge platform={post.platform} />
        <StatusBadge status={post.status} />
        <h2 className="text-lg font-semibold">{post.title || "(タイトルなし)"}</h2>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">本文</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">{post.content}</pre>
          </div>

          {post.mediaUrl && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">添付画像</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.mediaUrl} alt="" className="max-h-80 rounded-lg border border-gray-200" />
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">実行ログ</h3>
            {post.logs.length === 0 ? (
              <p className="text-sm text-gray-400">まだログはありません</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {post.logs.map((log) => (
                  <li key={log.id} className="border-b border-gray-100 pb-2 last:border-0">
                    <span className="font-medium">{log.status}</span>{" "}
                    <span className="text-gray-500">{new Date(log.createdAt).toLocaleString("ja-JP")}</span>
                    {log.message && <p className="mt-0.5 text-gray-600">{log.message}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <dl className="space-y-2">
              <div>
                <dt className="text-gray-500">投稿先アカウント</dt>
                <dd className="font-medium">{post.account.label}</dd>
              </div>
              <div>
                <dt className="text-gray-500">予約日時</dt>
                <dd className="font-medium">
                  {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString("ja-JP") : "-"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">公開日時</dt>
                <dd className="font-medium">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleString("ja-JP") : "-"}
                </dd>
              </div>
              {post.externalUrl && (
                <div>
                  <dt className="text-gray-500">公開URL</dt>
                  <dd>
                    <a href={post.externalUrl} target="_blank" className="text-brand-600 underline">
                      開く
                    </a>
                  </dd>
                </div>
              )}
              {post.errorMessage && (
                <div>
                  <dt className="text-gray-500">エラー</dt>
                  <dd className="text-red-600">{post.errorMessage}</dd>
                </div>
              )}
            </dl>
          </div>

          <PostDetailActions postId={post.id} status={post.status} scheduledAt={post.scheduledAt?.toISOString() ?? null} />
        </div>
      </div>
    </div>
  );
}
