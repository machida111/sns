import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SNS & note 運用自動化",
  description: "note / X / Instagram の投稿をAI下書き生成とスケジュール投稿で自動化する管理アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#f7f8fb] text-[#12151c] antialiased">{children}</body>
    </html>
  );
}
