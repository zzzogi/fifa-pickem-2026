"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type LeaderboardEntry } from "@/lib/leaderboard";
import LeaderboardRow from "./leaderboard-row";
import LeaderboardSearch from "./leaderboard-search";

function normalize(str: string) {
  // U+0300–U+036F: Combining Diacritical Marks (covers all Vietnamese tones/marks)
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const PAGE_SIZE = 20;

interface LeaderboardClientProps {
  allEntries: LeaderboardEntry[];
  currentUserId: string;
  isMobile: boolean;
  initialPage: number;
}

export default function LeaderboardClient({
  allEntries,
  currentUserId,
  isMobile,
  initialPage,
}: LeaderboardClientProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const trimmed = normalize(debouncedQuery.trim());
  const isSearching = trimmed.length > 0;

  const filteredEntries = isSearching
    ? allEntries.filter((e) => normalize(e.name ?? "").includes(trimmed))
    : allEntries;

  const totalPages = Math.max(1, Math.ceil(allEntries.length / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(initialPage, totalPages));
  const pageEntries = isSearching
    ? filteredEntries
    : filteredEntries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (allEntries.length === 0) {
    return (
      <div className="card-sports p-12 text-center">
        <p
          className="text-4xl mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          CHƯA CÓ NGƯỜI CHƠI NÀO
        </p>
        <p style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}>
          Hãy là người dự đoán đầu tiên để chạm tới vinh quang.
        </p>
      </div>
    );
  }

  const headerCells = [
    { label: "#", className: "pl-4 pr-2 w-12" },
    { label: "Người chơi", className: "px-2" },
    { label: "Điểm", className: "px-3 text-right" },
    {
      label: "Đã dự đoán",
      className: "px-3 text-right hidden sm:table-cell",
    },
    {
      label: "Đã đoán đúng",
      className: "px-3 text-right hidden sm:table-cell",
    },
    {
      label: "Tỉ lệ chính xác",
      className: "pl-3 pr-4 text-right hidden sm:table-cell",
    },
  ];

  return (
    <div className="card-sports overflow-hidden">
      {/* Search */}
      <div
        className="px-4 py-2 border-b flex items-center"
        style={{ borderColor: "var(--outline-variant)" }}
      >
        <LeaderboardSearch value={query} onChange={setQuery} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              style={{
                background: "var(--secondary)",
                borderBottom: "2px solid var(--primary)",
              }}
            >
              {headerCells.map((cell) => (
                <th
                  key={cell.label}
                  className={`py-3 text-xs uppercase tracking-widest font-bold text-white ${cell.className}`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {cell.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageEntries.map((entry, index) => (
              <LeaderboardRow
                key={entry.id}
                id={entry.id}
                rank={entry.rank}
                name={entry.name}
                image={entry.image}
                totalPoints={entry.totalPoints}
                correctPicks={entry.correctPicks}
                accuracy={entry.accuracy}
                totalPicks={entry.totalPicks}
                currentStreak={entry.currentStreak}
                isMobile={isMobile}
                isCurrentUser={entry.id === currentUserId}
                isEven={index % 2 === 0}
              />
            ))}
          </tbody>
        </table>
      </div>

      {isSearching && filteredEntries.length === 0 && (
        <div
          className="px-4 py-10 text-center text-sm"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Không tìm thấy người chơi nào phù hợp.
        </div>
      )}

      {!isSearching && (
        <CurrentUserFooter
          allEntries={allEntries}
          pageEntries={pageEntries}
          currentUserId={currentUserId}
        />
      )}

      {!isSearching && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          total={allEntries.length}
        />
      )}
    </div>
  );
}

function CurrentUserFooter({
  allEntries,
  pageEntries,
  currentUserId,
}: {
  allEntries: LeaderboardEntry[];
  pageEntries: LeaderboardEntry[];
  currentUserId: string;
}) {
  const me = allEntries.find((e) => e.id === currentUserId);
  if (!me) return null;

  const isVisible = pageEntries.some((e) => e.id === currentUserId);
  if (isVisible) return null;

  return (
    <div
      className="border-t-2 px-4 py-3 flex items-center justify-between"
      style={{
        borderColor: "var(--primary)",
        background: "var(--primary-soft)",
      }}
    >
      <span
        className="text-sm uppercase tracking-wide"
        style={{ fontFamily: "var(--font-body)", fontWeight: 700 }}
      >
        Thứ hạng của bạn
      </span>
      <div
        className="flex items-center gap-6 tabular-nums text-sm"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <span>
          <strong
            style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}
          >
            #{me.rank}
          </strong>
        </span>
        <span style={{ color: "var(--outline)" }}>{me.totalPoints} điểm</span>
        <span style={{ color: "var(--outline)" }}>
          Độ chuẩn xác {me.accuracy}%
        </span>
      </div>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  total,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
}) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  const pages: (number | null)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push(null);
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push(null);
    pages.push(totalPages);
  }

  const linkStyle = {
    fontFamily: "var(--font-body)",
    fontWeight: 700,
  };

  return (
    <div
      className="border-t flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3"
      style={{ borderColor: "var(--outline-variant)" }}
    >
      <span
        className="text-xs order-2 sm:order-1"
        style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
      >
        {start}–{end} / {total} người chơi
      </span>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {currentPage > 1 ? (
          <Link
            href={`?page=${currentPage - 1}`}
            className="px-3 py-1.5 rounded-[4px] text-sm transition hover:opacity-80"
            style={{
              background: "var(--surface-high)",
              color: "var(--foreground)",
              ...linkStyle,
            }}
          >
            ←
          </Link>
        ) : (
          <span
            className="px-3 py-1.5 rounded-[4px] text-sm"
            style={{
              background: "var(--surface-high)",
              color: "var(--outline)",
              opacity: 0.4,
              ...linkStyle,
            }}
          >
            ←
          </span>
        )}

        {pages.map((p, i) =>
          p === null ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1.5 text-sm"
              style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={`?page=${p}`}
              className="min-w-[2rem] text-center px-2 py-1.5 rounded-[4px] text-sm transition hover:opacity-80"
              style={{
                background:
                  p === currentPage ? "var(--primary)" : "var(--surface-high)",
                color: p === currentPage ? "white" : "var(--foreground)",
                ...linkStyle,
              }}
            >
              {p}
            </Link>
          ),
        )}

        {currentPage < totalPages ? (
          <Link
            href={`?page=${currentPage + 1}`}
            className="px-3 py-1.5 rounded-[4px] text-sm transition hover:opacity-80"
            style={{
              background: "var(--surface-high)",
              color: "var(--foreground)",
              ...linkStyle,
            }}
          >
            →
          </Link>
        ) : (
          <span
            className="px-3 py-1.5 rounded-[4px] text-sm"
            style={{
              background: "var(--surface-high)",
              color: "var(--outline)",
              opacity: 0.4,
              ...linkStyle,
            }}
          >
            →
          </span>
        )}
      </div>
    </div>
  );
}
