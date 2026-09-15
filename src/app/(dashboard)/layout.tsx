import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

const NAV_ITEMS = [
  { href: "/", label: "投稿一覧" },
  { href: "/posts/new", label: "新規作成 (AI下書き)" },
  { href: "/accounts", label: "連携アカウント設定" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white px-4 py-6">
        <div className="mb-8 px-2">
          <h1 className="text-base font-semibold leading-tight">SNS & note</h1>
          <p className="text-xs text-gray-500">運用自動化ダッシュボード</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
