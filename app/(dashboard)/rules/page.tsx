// app/(dashboard)/rules/page.tsx
import HowToCard from "@/components/rules/how-to-card";
import ScoringTable from "@/components/rules/scoring-table";
import PrizePoolCard from "@/components/rules/prize-pool-card";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";

export default async function RulesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  return (
    <div>
      {/* Tiêu đề trang */}
      <div className="mb-6">
        <p
          className="text-xs uppercase tracking-widest mb-1"
          style={{
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
          }}
        >
          FIFA WORLD CUP 2026
        </p>
        <h1
          className="text-4xl"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "0.02em",
          }}
        >
          THỂ LỆ & GIẢI THƯỞNG
        </h1>
      </div>

      {/* Banner giới thiệu */}
      <div
        className="rounded-[4px] p-5 mb-6 flex items-start gap-4"
        style={{
          background: "var(--primary)",
          color: "white",
        }}
      >
        <span style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0 }}>
          ⚽
        </span>
        <div>
          <h2
            className="text-xl mb-1"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.02em",
            }}
          >
            FIFA WORLD CUP 2026 PICK&apos;EM
          </h2>
          <p
            className="text-sm"
            style={{
              fontFamily: "var(--font-body)",
              opacity: 0.9,
              lineHeight: 1.6,
            }}
          >
            Dự đoán tỷ số của tất cả các trận đấu tại FIFA World Cup 2026. Nhận
            điểm khi dự đoán đúng kết quả hoặc đúng tỷ số chính xác. Tích lũy
            điểm qua từng trận đấu và cạnh tranh với những người chơi khác trên
            bảng xếp hạng. Người có số điểm cao nhất khi giải đấu kết thúc sẽ
            giành chiến thắng.
          </p>
        </div>
      </div>

      {/* Nội dung */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <div className="space-y-6">
          <HowToCard />
          <ScoringTable />
        </div>
        <div>
          <PrizePoolCard />
        </div>
      </div>
    </div>
  );
}
