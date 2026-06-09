import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

export default async function Picks() {
  const session = await getServerSession(authOptions);

  console.log(session);
  return (
    <main className="app-shell flex min-h-screen">
      <aside className="sidebar-sports hidden w-[260px] flex-col p-4 lg:flex">
        <div className="mb-6 text-2xl tracking-wide font-[var(--font-display)]">
          PICK'EM
        </div>

        <nav className="space-y-2">
          <div className="rounded-[4px] border-l-4 border-[#570000] bg-white/10 px-3 py-2 text-sm uppercase tracking-wide">
            My Picks
          </div>
          <div className="rounded-[4px] px-3 py-2 text-sm uppercase tracking-wide text-white/80">
            Leaderboard
          </div>
          <div className="rounded-[4px] px-3 py-2 text-sm uppercase tracking-wide text-white/80">
            Stats
          </div>
        </nav>
      </aside>

      <section className="flex-1 p-4 lg:p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              World Cup 2026
            </p>
            <h1 className="text-3xl">My Picks</h1>
          </div>
          <div className="card-sports px-3 py-2 text-sm">Bin Nguyen</div>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="card-sports p-4">
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              Rank
            </p>
            <h2 className="text-2xl">#12</h2>
          </div>
          <div className="card-sports p-4">
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              Total Points
            </p>
            <h2 className="text-2xl">27</h2>
          </div>
          <div className="card-sports p-4">
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              Accuracy
            </p>
            <h2 className="text-2xl">61%</h2>
          </div>
        </div>

        <div className="card-sports p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-[4px] bg-red-600 px-2 py-1 text-xs font-bold uppercase text-white">
              Live
            </span>
            <span className="text-sm text-neutral-600">Jun 18 • 20:00</span>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div>
              <p className="text-xl">BRAZIL</p>
              <p className="text-sm text-neutral-600">Group A</p>
            </div>

            <div className="text-center text-sm font-bold text-neutral-500">
              VS
            </div>

            <div className="text-right">
              <p className="text-xl">JAPAN</p>
              <p className="text-sm text-neutral-600">Group A</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              className="w-16 rounded-[4px] border border-[var(--outline-variant)] px-3 py-2 text-center"
              defaultValue="2"
            />
            <span>-</span>
            <input
              className="w-16 rounded-[4px] border border-[var(--outline-variant)] px-3 py-2 text-center"
              defaultValue="1"
            />
            <button className="ml-auto rounded-[4px] bg-[var(--primary)] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
              Save Pick
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
