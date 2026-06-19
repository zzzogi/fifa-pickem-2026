// components/layout/mobile-nav.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Coffee, Workflow } from "lucide-react";

interface MobileNavProps {
  userId?: string; // ← truyền từ layout
  userImage?: string;
  userName?: string;
}

const navItems = [
  {
    href: "/picks",
    label: "Dự đoán",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    href: "/bracket",
    label: "Sơ đồ",
    icon: <Workflow />,
  },
  {
    href: "/leaderboard",
    label: "BXH",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    href: "/stats",
    label: "Thống kê",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    href: "/rules",
    label: "Thể lệ",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: "/support",
    label: "Donate",
    icon: <Coffee />,
  },
];

export default function MobileNav({
  userId,
  userImage,
  userName,
}: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
      style={{
        background: "var(--secondary)",
        borderTop: "1px solid var(--outline-variant)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Regular nav items */}
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition"
            style={{
              color: isActive ? "var(--primary-soft)" : "rgba(255,255,255,0.5)",
              borderTop: isActive
                ? "2px solid var(--primary-soft)"
                : "2px solid transparent",
            }}
          >
            {item.icon}
            <span
              className="text-xs uppercase tracking-wide font-bold"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Tab "Me" với avatar ← mới */}
      {userId && (
        <Link
          href={`/profile/${userId}`}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition"
          style={{
            color: pathname.startsWith("/profile")
              ? "var(--primary)"
              : "rgba(255,255,255,0.5)",
            borderTop: pathname.startsWith("/profile")
              ? "2px solid var(--primary)"
              : "2px solid transparent",
          }}
        >
          {userImage ? (
            <Image
              src={userImage}
              alt={userName ?? "Me"}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
          <span
            className="text-xs uppercase tracking-wide font-bold"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Tôi
          </span>
        </Link>
      )}
    </nav>
  );
}
