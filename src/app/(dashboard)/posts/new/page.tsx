"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Platform = "NOTE" | "X" | "INSTAGRAM";

interface AccountOption {
  id: string;
  platform: Platform;
  label: string;
  isActive: boolean;
}

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "NOTE", label: "note" },
  { value: "X", label: "X (Twitter)" },
  { value: "INSTAGRAM", label: "Instagram" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [platform, setPlatform] = useState<Platform>("NOTE");
  const [accountId, setAccountId] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((json) => setAccounts(json.accounts ?? []));
  }, []);

  const filteredAccounts = useMemo(
    () => accounts.filter((a) => a.platform === platform),
    [accounts, platform]
  );

  useEffect(() => {
    setAccountId(filteredAccounts[0]?.id ?? "");
  }, [filteredAccounts]);

  async function handleGenerate() {
    if (!topic.trim()) {
      setError("テーマを入力してください");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topic, tone: tone || undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "AI生成に失敗しました");
        return;
      }
      setTitle(json.draft.title ?? "");
      setContent(json.draft.content ?? "");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(asSchedule: boolean) {
    if (!accountId) {
      setError("連携アカウントを選択してください(未登録の場合は先にアカウント設定を行ってください)");
      return;
    }
    if (!content.trim()) {
      setError("本文を入力または生成してください");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          accountId,
          title: title || null,
          content,
          mediaUrl: mediaUrl || null,
          aiTopic: topic || null,
          scheduledAt: asSchedule && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "保存に失敗しました");
        return;
      }
      router.push(`/posts/${json.post.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">新規投稿作成</h2>
      <p className="mb-6 text-sm text-gray-500">テーマを入力してAIに下書きを作成させ、内容を確認・編集してから保存できます</p>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">プラットフォーム</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">投稿先アカウント</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {filteredAccounts.length === 0 && <option value="">(未登録)</option>}
              {filteredAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-brand-50 p-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">AI下書き生成: テーマ</label>
          <div className="flex gap-2">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例: 秋に始めたい家庭菜園のコツ"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="whitespace-nowrap rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {generating ? "生成中..." : "AIで生成"}
            </button>
          </div>
          <input
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="トーンの希望(任意): 例 明るくカジュアルに"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {platform === "NOTE" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">本文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={platform === "NOTE" ? 14 : 6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
          />
        </div>

        {(platform === "INSTAGRAM" || platform === "X") && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              画像URL {platform === "INSTAGRAM" && <span className="text-red-500">(Instagramは必須)</span>}
            </label>
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">予約投稿日時(任意)</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            下書き保存
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || !scheduledAt}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            予約投稿として保存
          </button>
        </div>
      </div>
    </div>
  );
}
