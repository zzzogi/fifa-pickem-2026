import { signIn } from "next-auth/react";

interface GuestBlurProps {
  title: string;
  description: string;
}

export default function GuestBlur({ title, description }: GuestBlurProps) {
  return (
    <div className="relative rounded-[4px] overflow-hidden min-h-[400px]">
      {/* Fake content bị blur phía sau */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: "blur(8px)", opacity: 0.4 }}
        aria-hidden
      >
        {/* Skeleton rows giả */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b"
            style={{ borderColor: "var(--outline-variant)" }}
          >
            <div className="skeleton w-8 h-8 rounded-[4px]" />
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="skeleton skeleton-text flex-1 max-w-[140px]" />
            <div className="skeleton skeleton-text w-16 ml-auto" />
            <div className="skeleton skeleton-text w-12" />
          </div>
        ))}
      </div>

      {/* Overlay + CTA */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{
          background: "oklch(from var(--background) l c h / 0.7)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div
          className="p-8 rounded-[4px] max-w-sm w-full"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--outline-variant)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <p style={{ fontSize: "2.5rem", lineHeight: 1 }} className="mb-4">
            🏆
          </p>
          <h2
            className="text-xl mb-2"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.02em",
            }}
          >
            {title}
          </h2>
          <p
            className="text-sm mb-6"
            style={{
              color: "var(--outline)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>

          <form
            action={async () => {
              signIn("google", { redirectTo: "/picks" });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-[4px] px-5 py-3 font-bold uppercase tracking-wide text-white transition hover:opacity-90 active:scale-95"
              style={{
                background: "var(--primary)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
              }}
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
