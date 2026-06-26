"use client";

interface LeaderboardSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LeaderboardSearch({
  value,
  onChange,
}: LeaderboardSearchProps) {
  return (
    <div className="relative w-36 sm:w-44">
      <span
        className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs"
        style={{ color: "var(--outline)" }}
      >
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm người chơi..."
        className="w-full pl-6 pr-5 py-[3px] rounded-[4px] text-xs outline-none"
        style={{
          background: "var(--surface-high)",
          color: "var(--foreground)",
          border: "1px solid var(--outline-variant)",
          fontFamily: "var(--font-body)",
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs leading-none"
          style={{ color: "var(--outline)" }}
          aria-label="Xóa tìm kiếm"
        >
          ✕
        </button>
      )}
    </div>
  );
}
