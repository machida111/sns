const PLATFORM_LABEL: Record<string, string> = {
  NOTE: "note",
  X: "X",
  INSTAGRAM: "Instagram",
};

const PLATFORM_COLOR: Record<string, string> = {
  NOTE: "bg-emerald-100 text-emerald-700",
  X: "bg-gray-900 text-white",
  INSTAGRAM: "bg-pink-100 text-pink-700",
};

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PLATFORM_COLOR[platform] ?? "bg-gray-100 text-gray-700"}`}>
      {PLATFORM_LABEL[platform] ?? platform}
    </span>
  );
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "下書き",
  SCHEDULED: "予約済み",
  PUBLISHING: "投稿中",
  PUBLISHED: "投稿済み",
  FAILED: "失敗",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SCHEDULED: "bg-amber-100 text-amber-700",
  PUBLISHING: "bg-blue-100 text-blue-700",
  PUBLISHED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[status] ?? "bg-gray-100 text-gray-700"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
