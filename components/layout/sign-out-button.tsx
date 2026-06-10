// components/layout/sign-out-button.tsx
"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full rounded-[4px] px-3 py-2 text-left text-sm uppercase tracking-wide text-white/60 transition hover:bg-white/10 hover:text-white"
    >
      Đăng xuất
    </button>
  );
}
