"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-4 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-500 hover:bg-gray-100"
    >
      ログアウト
    </button>
  );
}
