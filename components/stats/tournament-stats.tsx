// components/stats/tournament-stats.tsx
import Image from "next/image";
import FireBadge from "@/components/leaderboard/fire-badge";
import type { TournamentStats } from "@/lib/tournament-stats";

// Card thống kê tái sử dụng được
function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="p-4 rounded-[4px]"
      style={{
        background: accent ? "var(--primary)" : "var(--surface-soft)",
        border: `1px solid ${accent ? "transparent" : "var(--outline-variant)"}`,
        color: accent ? "white" : "var(--foreground)",
      }}
    >
      <p
        className="text-xs uppercase tracking-widest mb-1 font-bold"
        style={{
          fontFamily: "var(--font-body)",
          opacity: accent ? 0.8 : 1,
          color: accent ? "white" : "var(--outline)",
        }}
      >
        {label}
      </p>
      <p
        className="text-2xl leading-none mb-1"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs"
          style={{
            fontFamily: "var(--font-body)",
            opacity: 0.7,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// Thanh tỉ lệ mini
function MiniBar({
  homePct,
  drawPct,
  awayPct,
  homeCode,
  awayCode,
}: {
  homePct: number;
  drawPct: number;
  awayPct: number;
  homeCode: string | null;
  awayCode: string | null;
}) {
  return (
    <div>
      <div
        className="flex justify-between text-xs mb-1"
        style={{ fontFamily: "var(--font-body)", color: "var(--outline)" }}
      >
        <span className="font-bold">
          {homeCode} {homePct}%
        </span>
        {drawPct > 0 && <span>Hòa {drawPct}%</span>}
        <span className="font-bold">
          {awayPct}% {awayCode}
        </span>
      </div>
      <div
        className="flex h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--surface-high)" }}
      >
        {homePct > 0 && (
          <div style={{ width: `${homePct}%`, background: "var(--primary)" }} />
        )}
        {drawPct > 0 && (
          <div
            style={{
              width: `${drawPct}%`,
              background: "var(--outline-variant)",
            }}
          />
        )}
        {awayPct > 0 && (
          <div
            style={{ width: `${awayPct}%`, background: "var(--secondary)" }}
          />
        )}
      </div>
    </div>
  );
}

export default function TournamentStatsView({
  stats,
}: {
  stats: TournamentStats;
}) {
  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <p
          className="text-xs uppercase tracking-widest mb-1 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          FIFA World Cup 2026
        </p>
        <h1
          className="text-4xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          THỐNG KÊ GIẢI ĐẤU
        </h1>
      </div>

      {/* Tổng quan trận đấu */}
      <section>
        <h2
          className="text-xs uppercase tracking-widest mb-3 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Tổng Quan Trận Đấu
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Tổng Số Trận"
            value={stats.totalMatches.toString()}
          />
          <StatCard
            label="Đã Kết Thúc"
            value={stats.finishedMatches.toString()}
            accent
          />
          <StatCard
            label="Sắp Diễn Ra"
            value={stats.upcomingMatches.toString()}
          />
          <StatCard
            label="Đang Diễn Ra"
            value={stats.liveMatches.toString()}
            sub={
              stats.liveMatches > 0
                ? "🔴 Đang thi đấu"
                : "Không có trận nào đang diễn ra"
            }
          />
        </div>
      </section>

      {/* Bàn thắng */}
      {stats.finishedMatches > 0 && (
        <section>
          <h2
            className="text-xs uppercase tracking-widest mb-3 font-bold"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            Bàn Thắng
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard
              label="Tổng Bàn Thắng"
              value={stats.totalGoalsScored.toString()}
              sub={`Qua ${stats.finishedMatches} trận`}
            />
            <StatCard
              label="Trung Bình / Trận"
              value={stats.avgGoalsPerMatch.toFixed(1)}
            />
            {stats.highestScoringMatch && (
              <StatCard
                label="Trận Nhiều Bàn Nhất"
                value={`${stats.highestScoringMatch.homeScore}–${stats.highestScoringMatch.awayScore}`}
                sub={`${stats.highestScoringMatch.homeTeamCode} vs ${stats.highestScoringMatch.awayTeamCode} (${stats.highestScoringMatch.totalGoals} bàn)`}
              />
            )}
          </div>
        </section>
      )}

      {/* Dự đoán cộng đồng */}
      <section>
        <h2
          className="text-xs uppercase tracking-widest mb-3 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Dự Đoán Cộng Đồng
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Tổng Lượt Dự Đoán"
            value={stats.totalPicks.toLocaleString()}
          />
          <StatCard label="Người Chơi" value={stats.totalPlayers.toString()} />
          <StatCard
            label="Trung Bình / Người"
            value={stats.avgPicksPerPlayer.toString()}
          />
          <StatCard
            label="Độ Chính Xác Cộng Đồng"
            value={`${stats.serverAccuracy}%`}
            sub={`${stats.serverExactRate}% tỉ số chính xác`}
            accent
          />
        </div>
      </section>

      {/* Trận được dự đoán nhiều nhất */}
      {stats.mostPickedMatches.length > 0 && (
        <section>
          <h2
            className="text-xs uppercase tracking-widest mb-3 font-bold"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            Trận Được Dự Đoán Nhiều Nhất
          </h2>
          <div
            className="card-sports divide-y"
            style={{ borderColor: "var(--outline-variant)" }}
          >
            {stats.mostPickedMatches.map((m) => (
              <div key={m.matchId} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Huy hiệu đội nhà */}
                    {m.homeTeamCrest ? (
                      <Image
                        src={m.homeTeamCrest}
                        alt={m.homeTeamCode ?? ""}
                        width={28}
                        height={28}
                        className="object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: "var(--surface-muted)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {m.homeTeamCode?.charAt(0)}
                      </div>
                    )}
                    <span
                      className="font-bold text-base"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {m.homeTeamCode}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--outline)" }}
                    >
                      vs
                    </span>
                    <span
                      className="font-bold text-base"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {m.awayTeamCode}
                    </span>
                    {/* Huy hiệu đội khách */}
                    {m.awayTeamCrest ? (
                      <Image
                        src={m.awayTeamCrest}
                        alt={m.awayTeamCode ?? ""}
                        width={28}
                        height={28}
                        className="object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: "var(--surface-muted)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {m.awayTeamCode?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs uppercase tracking-wide font-bold"
                    style={{
                      color: "var(--outline)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {m.totalPicks} lượt dự đoán
                  </span>
                </div>
                <MiniBar
                  homePct={m.homePickPct}
                  drawPct={m.drawPickPct}
                  awayPct={m.awayPickPct}
                  homeCode={m.homeTeamCode}
                  awayCode={m.awayTeamCode}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vua phá lưới & Chuỗi thắng — 2 cột */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Vua phá lưới (điểm cao nhất) */}
        {stats.topScorers.length > 0 && (
          <section>
            <h2
              className="text-xs uppercase tracking-widest mb-3 font-bold"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              Bảng Điểm Cao Nhất
            </h2>
            <div
              className="card-sports divide-y"
              style={{ borderColor: "var(--outline-variant)" }}
            >
              {stats.topScorers.map((user, index) => (
                <a
                  key={user.userId}
                  href={`/profile/${user.userId}`}
                  className="flex items-center gap-3 p-4 transition hover:opacity-80"
                >
                  <span
                    className="text-lg w-6 text-center flex-shrink-0"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--outline)",
                    }}
                  >
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </span>
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? ""}
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: "var(--surface-muted)",
                        color: "var(--outline)",
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span
                      className="text-sm font-bold truncate"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {user.name ?? "Ẩn danh"}
                    </span>
                    <FireBadge streak={user.currentStreak} />
                  </div>
                  <span
                    className="text-xl tabular-nums flex-shrink-0"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {user.totalPoints}đ
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Chuỗi thắng cao nhất */}
        {stats.topStreaks.length > 0 && (
          <section>
            <h2
              className="text-xs uppercase tracking-widest mb-3 font-bold"
              style={{
                color: "var(--outline)",
                fontFamily: "var(--font-body)",
              }}
            >
              Chuỗi Thắng Nóng Nhất 🔥
            </h2>
            <div
              className="card-sports divide-y"
              style={{ borderColor: "var(--outline-variant)" }}
            >
              {stats.topStreaks.map((user) => (
                <a
                  key={user.userId}
                  href={`/profile/${user.userId}`}
                  className="flex items-center gap-3 p-4 transition hover:opacity-80"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ?? ""}
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: "var(--surface-muted)",
                        color: "var(--outline)",
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    className="text-sm font-bold flex-1 truncate"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {user.name ?? "Ẩn danh"}
                  </span>
                  <FireBadge streak={user.currentStreak} />
                  <span
                    className="text-xl tabular-nums"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {user.currentStreak} 🔥
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
