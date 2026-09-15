"use client";

import { useEffect, useState } from "react";

type Platform = "NOTE" | "X" | "INSTAGRAM";

interface Account {
  id: string;
  platform: Platform;
  label: string;
  isActive: boolean;
  createdAt: string;
}

const FIELD_DEFS: Record<Platform, { key: string; label: string; secret?: boolean }[]> = {
  X: [
    { key: "appKey", label: "API Key (Consumer Key)" },
    { key: "appSecret", label: "API Secret", secret: true },
    { key: "accessToken", label: "Access Token" },
    { key: "accessSecret", label: "Access Token Secret", secret: true },
  ],
  INSTAGRAM: [
    { key: "igUserId", label: "Instagram Business Account ID" },
    { key: "accessToken", label: "長期アクセストークン", secret: true },
  ],
  NOTE: [{ key: "cookie", label: "note.com ログインCookie", secret: true }],
};

const PLATFORM_LABEL: Record<Platform, string> = { NOTE: "note", X: "X (Twitter)", INSTAGRAM: "Instagram" };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [platform, setPlatform] = useState<Platform>("NOTE");
  const [label, setLabel] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((json) => setAccounts(json.accounts ?? []));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, label, credentials: fields }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "登録に失敗しました");
        return;
      }
      setLabel("");
      setFields({});
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("このアカウント連携を削除しますか?")) return;
    await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">連携アカウント設定</h2>
      <p className="mb-6 text-sm text-gray-500">
        note / X / Instagram への自動投稿に必要な認証情報を登録します。値はサーバー側で暗号化して保存されます。
      </p>

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">新規アカウント連携を追加</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">プラットフォーム</label>
              <select
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value as Platform);
                  setFields({});
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">ラベル(識別名)</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="例: 個人アカウント"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {FIELD_DEFS[platform].map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
              <input
                type={f.secret ? "password" : "text"}
                value={fields[f.key] ?? ""}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          ))}

          {platform === "NOTE" && (
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              ⚠️ noteは公式の投稿APIを提供していないため、この連携は非公式な方法(ログインCookie)を用いた
              ベストエフォート実装です。note.comの利用規約に反しないかご自身でご確認のうえご利用ください。
              動作しない場合は下書き内容を手動でnote.comにコピー&ペーストしてください。
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "追加する"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">プラットフォーム</th>
              <th className="px-4 py-3">ラベル</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">{PLATFORM_LABEL[acc.platform]}</td>
                <td className="px-4 py-3 font-medium">{acc.label}</td>
                <td className="px-4 py-3 text-gray-500">{acc.isActive ? "有効" : "無効"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(acc.id)} className="text-sm text-red-600 hover:underline">
                    削除
                  </button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  まだアカウントが登録されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
