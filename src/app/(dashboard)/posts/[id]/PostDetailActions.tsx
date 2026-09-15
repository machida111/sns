"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostDetailActions({
  postId,
  status,
  scheduledAt,
}: {
  postId: string;
  status: string;
  scheduledAt: string | null;
}) {
  const router = useRouter();
  const [schedule, setSchedule] = useState(scheduledAt ? scheduledAt.slice(0, 16) : "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePublishNow() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error ?? "投稿に失敗しました");
      } else {
        setMessage("投稿処理を実行しました");
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleSetSchedule() {
    if (!schedule) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(schedule).toISOString() }),
      });
      if (!res.ok) {
        const json = await res.json();
        setMessage(json.error ?? "予約設定に失敗しました");
      } else {
        setMessage("予約投稿を設定しました");
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("この投稿を削除しますか?")) return;
    setBusy(true);
    try {
      await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      router.push("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-700">アクション</h3>

      <button
        onClick={handlePublishNow}
        disabled={busy || status === "PUBLISHED"}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        今すぐ投稿する
      </button>

      <div className="border-t border-gray-100 pt-3">
        <label className="mb-1 block text-xs font-medium text-gray-600">予約日時を設定</label>
        <input
          type="datetime-local"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          onClick={handleSetSchedule}
          disabled={busy || !schedule}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          予約を保存
        </button>
      </div>

      <button
        onClick={handleDelete}
        disabled={busy}
        className="w-full rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        削除
      </button>

      {message && <p className="text-xs text-gray-600">{message}</p>}
    </div>
  );
}
