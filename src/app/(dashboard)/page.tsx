import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlatformBadge, StatusBadge } from "@/components/Badges";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const posts = await prisma.post.findMany({
    include: { account: { select: { label: true } } },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">投稿一覧</h2>
          <p className="text-sm text-gray-500">下書き・予約済み・投稿済みの投稿を管理します</p>
        </div>
        <Link
          href="/posts/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + 新規作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          まだ投稿がありません。「新規作成」からAI下書きを生成してみましょう。
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">プラットフォーム</th>
                <th className="px-4 py-3">タイトル/内容</th>
                <th className="px-4 py-3">アカウント</th>
                <th className="px-4 py-3">状態</th>
                <th className="px-4 py-3">予約日時</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <PlatformBadge platform={post.platform} />
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    <Link href={`/posts/${post.id}`} className="font-medium text-gray-900 hover:text-brand-700">
                      {post.title || post.content.slice(0, 40)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{post.account.label}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString("ja-JP") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
