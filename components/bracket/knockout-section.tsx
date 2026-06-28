import type { BracketMatch } from "./types";
import BracketTree from "./bracket-tree";

export default function KnockoutSection({
  matches,
}: {
  matches: BracketMatch[];
}) {
  if (matches.length === 0) {
    return (
      <div className="card-sports p-8 text-center">
        <p
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Chưa có dữ liệu
        </p>
        <p
          style={{
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
          }}
        >
          Vòng loại trực tiếp sẽ bắt đầu sau khi vòng bảng kết thúc.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile swipe hint */}
      <p
        className="text-xs mb-3 md:hidden"
        style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
      >
        ← Vuốt ngang để xem toàn bộ sơ đồ →
      </p>
      <BracketTree matches={matches} />
    </div>
  );
}
