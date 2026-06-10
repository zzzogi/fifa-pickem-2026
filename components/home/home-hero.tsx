// components/home/home-hero.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import LoginButton from "@/components/layout/signin-button";
import RulesPrizeModal from "./rules-prize-modal";

export default function HomeHero() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        {/* Desktop background */}
        <Image
          src="/bg-desktop.jpg"
          alt=""
          fill
          priority
          className="hidden object-cover md:block"
        />

        {/* Mobile background */}
        <Image
          src="/bg-mobile.jpg"
          alt=""
          fill
          priority
          className="object-cover md:hidden"
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(37,39,40,0.68), rgba(87,0,0,0.76))",
          }}
        />

        {/* Card */}
        <div className="relative z-10 w-full max-w-sm">
          <div
            className="card-sports p-8 text-center"
            style={{
              background: "rgba(255, 248, 246, 0.92)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(226, 191, 185, 0.7)",
            }}
          >
            <div className="mb-5 flex justify-center">
              <Image
                src="/icon-wc-2026.png"
                alt="Pick'em logo"
                width={96}
                height={96}
                priority
                className="object-contain"
              />
            </div>

            <h1
              className="mb-2 text-4xl"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.04em",
                color: "var(--primary)",
              }}
            >
              PICK&apos;EM
            </h1>

            <p
              className="mb-2 text-sm uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--outline)",
                fontWeight: 700,
              }}
            >
              FIFA World Cup 2026
            </p>

            <p
              className="mb-8 text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--on-surface-variant)",
                lineHeight: 1.6,
              }}
            >
              Dự đoán tỉ số, nhận điểm, và leo hạng.
            </p>

            <LoginButton />

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-4 inline-block text-xs uppercase tracking-wide underline transition hover:opacity-70"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--outline)",
              }}
            >
              Xem thể lệ & giải thưởng
            </button>
          </div>
        </div>
      </main>

      <RulesPrizeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
