import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/layout/signin-button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/picks");
  }

  return (
    <main className="app-shell flex min-h-screen flex-col items-center justify-center">
      <div className="card-sports w-full max-w-sm p-8 text-center">
        <h1 className="mb-2 text-4xl">PICK'EM</h1>
        <p
          className="mb-2 text-sm uppercase tracking-widest text-neutral-500"
          style={{ fontFamily: "var(--font-body)" }}
        >
          FIFA World Cup 2026
        </p>
        <p className="mb-8 text-sm text-neutral-600">
          Predict scores, earn points, and top the leaderboard.
        </p>

        <LoginButton />
      </div>
    </main>
  );
}
