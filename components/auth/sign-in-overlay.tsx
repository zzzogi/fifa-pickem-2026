// components/auth/sign-in-overlay.tsx
"use client";

import { signIn } from "next-auth/react";

interface SignInOverlayProps {
  title?: string;
  description?: string;
  compact?: boolean; // dùng trong MatchCard (nhỏ hơn)
}

export default function SignInOverlay({
  title = "Sign in to continue",
  description = "Log in with Google to unlock this feature.",
  compact = false,
}: SignInOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center rounded-[4px] z-10"
      style={{
        background: "oklch(from var(--background) l c h / 0.85)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className={`text-center px-4 ${compact ? "space-y-2" : "space-y-3"}`}
      >
        {!compact && <div style={{ fontSize: "1.8rem" }}>⚽</div>}

        <p
          className={
            compact
              ? "text-xs font-bold uppercase tracking-wide"
              : "text-base font-bold"
          }
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--foreground)",
          }}
        >
          {title}
        </p>

        {!compact && (
          <p
            className="text-sm max-w-[200px] mx-auto"
            style={{
              color: "var(--outline)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}

        {/* Sign in button — form action */}
        <form
          action={async () => {
            signIn("google", { redirectTo: "/picks" });
          }}
        >
          <button
            type="submit"
            className={`rounded-[4px] font-bold uppercase tracking-wide text-white transition hover:opacity-90 active:scale-95 ${
              compact ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm"
            }`}
            style={{
              background: "var(--primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
