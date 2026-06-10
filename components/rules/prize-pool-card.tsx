// components/rules/prize-pool-card.tsx

const prizes = [
  {
    rank: "Hạng Nhất",
    medal: "🥇",
    reward: "500.000 VNĐ",
    bg: "#d19900",
    color: "white",
    desc: "Dẫn đầu bảng xếp hạng khi trận chung kết World Cup khép lại",
  },
  {
    rank: "Hạng Nhì",
    medal: "🥈",
    reward: "200.000 VNĐ",
    bg: "#8e706c",
    color: "white",
    desc: "Xếp thứ hai khi giải đấu kết thúc",
  },
  {
    rank: "Hạng Ba",
    medal: "🥉",
    reward: "100.000 VNĐ",
    bg: "#964219",
    color: "white",
    desc: "Xếp thứ ba khi giải đấu kết thúc",
  },
  {
    rank: "Dự Đoán Chính Xác Nhất",
    medal: "⚡",
    reward: "200.000 VNĐ",
    bg: "var(--primary)",
    color: "white",
    desc: "Người chơi có số lần dự đoán đúng tỷ số chính xác nhiều nhất",
  },
];

const rules = [
  "Bảng xếp hạng được chốt theo kết quả trận Chung kết FIFA World Cup 2026.",
  "Thứ tự ưu tiên khi bằng điểm: Tổng điểm → Số dự đoán đúng kết quả → Số dự đoán đúng tỷ số.",
  "Giải thưởng sẽ được trao trong vòng 7 ngày sau khi giải đấu kết thúc.",
  "Người chơi phải gửi ít nhất 10 dự đoán để đủ điều kiện nhận thưởng.",
  "Ban tổ chức có quyền loại bỏ bất kỳ người chơi nào có hành vi gian lận.",
];

export default function PrizePoolCard() {
  return (
    <div className="card-sports p-6">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          CƠ CẤU GIẢI THƯỞNG
        </h2>

        {/* Tổng giải thưởng */}
        <div
          className="px-4 py-2 rounded-[4px]"
          style={{ background: "var(--primary)", color: "white" }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-0.5"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              opacity: 0.8,
            }}
          >
            Tổng giá trị giải thưởng
          </p>
          <p
            className="text-xl leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            1.000.000 VNĐ
          </p>
        </div>
      </div>

      {/* Danh sách giải thưởng */}
      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        {prizes.map((prize) => (
          <div
            key={prize.rank}
            className="flex items-start gap-4 p-4 rounded-[4px]"
            style={{
              background: "var(--surface-soft)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            {/* Huy chương */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-[4px] flex flex-col items-center justify-center"
              style={{ background: prize.bg }}
            >
              <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>
                {prize.medal}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col items-baseline gap-1 mb-2">
                <span
                  className="text-sm uppercase tracking-wide font-bold"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--outline)",
                  }}
                >
                  {prize.rank}
                </span>

                <span
                  className="text-xl leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--foreground)",
                  }}
                >
                  {prize.reward}
                </span>
              </div>

              <p
                className="text-xs"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--outline)",
                  lineHeight: 1.5,
                }}
              >
                {prize.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Điều khoản giải thưởng */}
      <div
        className="p-4 rounded-[4px]"
        style={{
          background: "var(--surface-soft)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        <h3
          className="text-xs uppercase tracking-widest mb-3 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Điều khoản & Thể lệ
        </h3>

        <ul className="space-y-2">
          {rules.map((rule, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--outline)",
                lineHeight: 1.6,
              }}
            >
              <span
                className="flex-shrink-0 mt-0.5 text-xs font-bold"
                style={{ color: "var(--primary)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
