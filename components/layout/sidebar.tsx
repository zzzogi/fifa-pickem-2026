// components/layout/sidebar.tsx — phiên bản Client Component
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const navItems = [
  { href: "/picks", label: "My Picks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/stats", label: "Stats" },
  { href: "/rules", label: "Rules" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <aside
      className="hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40"
      style={{ width: "var(--sidebar-width)", background: "var(--secondary)" }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <p
          className="text-white/50 text-xs uppercase tracking-widest mb-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          FIFA World Cup 2026
        </p>
        <h1
          className="text-white text-2xl leading-none"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          PICK'EM
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-[4px] text-sm uppercase tracking-wide transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                color: isActive ? "white" : "rgba(255,255,255,0.6)",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                borderLeft: isActive
                  ? "4px solid var(--primary)"
                  : "4px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + signout */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href={`/profile/${user?.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[4px] transition group hover:opacity-80"
        >
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p
                className="text-white text-sm font-semibold truncate"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {session?.user?.name ?? "Player"}
              </p>
              <p className="text-white/50 text-xs truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-[4px] px-3 py-2 text-left text-sm uppercase tracking-wide text-white/60 transition hover:bg-white/10 hover:text-white"
          style={{ fontFamily: "var(--font-body)", fontWeight: 700 }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
