// components/rules/scoring-table.tsx

export default function ScoringTable() {
  return (
    <div className="card-sports p-6">
      <h2
        className="text-2xl mb-6"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
      >
        THỂ LỆ TÍNH ĐIỂM
      </h2>

      {/* Điểm cơ bản */}
      <div className="mb-6">
        <h3
          className="text-xs uppercase tracking-widest mb-3 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Điểm Cơ Bản
        </h3>

        <div
          className="overflow-x-auto rounded-[4px] border"
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--secondary)" }}>
                {(
                  [
                    { label: "Dự Đoán", hidden: false },
                    { label: "Ví Dụ", hidden: false },
                    { label: "Kết Quả", hidden: true },
                    { label: "Điểm", hidden: false },
                  ] as { label: string; hidden: boolean }[]
                ).map(({ label, hidden }) => (
                  <th
                    key={label}
                    className={`py-2.5 px-4 text-left text-xs uppercase tracking-widest text-white font-bold${hidden ? " hidden sm:table-cell" : ""}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[
                {
                  prediction: "Đúng Tỷ Số",
                  example: "Dự đoán 2-1, kết quả 2-1",
                  result: "Khớp hoàn toàn",
                  points: "+3",
                  highlight: true,
                },
                {
                  prediction: "Đúng Đội Thắng/Hòa",
                  example: "Dự đoán 1-0, kết quả 2-1",
                  result: "Đúng đội chiến thắng",
                  points: "+1",
                  highlight: false,
                },
                {
                  prediction: "Đúng Hòa",
                  example: "Dự đoán 1-1, kết quả 0-0",
                  result: "Đều dự đoán hòa",
                  points: "+1",
                  highlight: false,
                },
                {
                  prediction: "Sai",
                  example: "Dự đoán 2-0, kết quả 0-1",
                  result: "Sai đội thắng",
                  points: "0",
                  highlight: false,
                },
              ].map((row, i) => (
                <tr
                  key={row.prediction}
                  style={{
                    background: row.highlight
                      ? "rgba(67,122,34,0.06)"
                      : i % 2 === 0
                        ? "var(--surface)"
                        : "var(--surface-soft)",
                    borderBottom: "1px solid var(--outline-variant)",
                  }}
                >
                  <td className="py-3 px-4">
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {row.prediction}
                    </span>
                  </td>

                  <td
                    className="py-3 px-4 text-sm"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--outline)",
                    }}
                  >
                    {row.example}
                  </td>

                  <td
                    className="py-3 px-4 text-sm hidden sm:table-cell"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--outline)",
                    }}
                  >
                    {row.result}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className="text-lg tabular-nums"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: row.highlight
                          ? "var(--success)"
                          : row.points === "0"
                            ? "var(--outline)"
                            : "var(--foreground)",
                      }}
                    >
                      {row.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thưởng chuỗi dự đoán đúng */}
      <div>
        <h3
          className="text-xs uppercase tracking-widest mb-3 font-bold"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Thưởng Chuỗi Dự Đoán Đúng
        </h3>

        <div
          className="overflow-x-auto rounded-[4px] border"
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--secondary)" }}>
                {(
                  [
                    { label: "Chuỗi", hidden: false },
                    { label: "Cấp Độ", hidden: false },
                    { label: "Thưởng Mỗi Trận", hidden: false },
                    { label: "Ví Dụ Tổng Điểm", hidden: true },
                  ] as { label: string; hidden: boolean }[]
                ).map(({ label, hidden }) => (
                  <th
                    key={label}
                    className={`py-2.5 px-4 text-left text-xs uppercase tracking-widest text-white font-bold${hidden ? " hidden sm:table-cell" : ""}`}
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[
                {
                  streak: "1-2",
                  tier: "—",
                  bonus: "+0",
                  example: "1 điểm (đúng đội thắng/hòa)",
                  tierColor: "var(--outline)",
                },
                {
                  streak: "3-4",
                  tier: "🔥",
                  bonus: "+1",
                  example: "2 điểm cho mỗi lần đoán đúng đội thắng/hòa",
                  tierColor: "#f97316",
                },
                {
                  streak: "5-7",
                  tier: "🔥🔥",
                  bonus: "+2",
                  example: "3 điểm cho mỗi lần đoán đúng đội thắng/hòa",
                  tierColor: "#ef4444",
                },
                {
                  streak: "8+",
                  tier: "🔥🔥🔥",
                  bonus: "+3",
                  example: "4 điểm cho mỗi lần đoán đúng đội thắng/hòa",
                  tierColor: "#dc2626",
                },
              ].map((row, i) => (
                <tr
                  key={row.streak}
                  style={{
                    background:
                      i % 2 === 0 ? "var(--surface)" : "var(--surface-soft)",
                    borderBottom: "1px solid var(--outline-variant)",
                  }}
                >
                  <td className="py-3 px-4">
                    <span
                      className="text-lg tabular-nums"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {row.streak}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span style={{ fontSize: "1.1rem" }}>{row.tier}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className="text-lg font-bold tabular-nums"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: row.tierColor,
                      }}
                    >
                      {row.bonus}
                    </span>
                  </td>

                  <td
                    className="py-3 px-4 text-sm hidden sm:table-cell"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--outline)",
                    }}
                  >
                    {row.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p
          className="text-xs mt-3"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          ⚠️ Một dự đoán sai sẽ đưa chuỗi về 0. Điểm thưởng chuỗi được cộng thêm
          vào điểm cơ bản của trận đấu.
        </p>
      </div>

      {/* Ngôi Sao Hy Vọng */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <h3
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
          >
            Ngôi Sao Hy Vọng
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-[4px] font-bold uppercase tracking-wide"
            style={{
              background: "var(--success)",
              color: "white",
              fontFamily: "var(--font-body)",
            }}
          >
            Mới · Từ vòng 1/32
          </span>
        </div>

        <div
          className="rounded-[4px] border overflow-hidden"
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{
              background: "var(--primary-soft)",
              borderBottom: "1px solid var(--outline-variant)",
            }}
          >
            <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>⭐</span>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-body)", color: "var(--foreground)", lineHeight: 1.5 }}
            >
              Từ vòng 1/32, nhấn <strong>☆</strong> trên bất kỳ trận nào để gắn{" "}
              <strong>Ngôi Sao Hy Vọng</strong> trước khi trận bắt đầu.
            </p>
          </div>

          {[
            {
              icon: "✅",
              condition: "Dự đoán đúng với Ngôi Sao",
              result: "Nhân đôi toàn bộ điểm của trận đó (bao gồm cả thưởng chuỗi)",
              points: "×2",
              color: "var(--success)",
              bg: "rgba(67,122,34,0.06)",
            },
            {
              icon: "❌",
              condition: "Dự đoán sai với Ngôi Sao",
              result: "Bị trừ điểm, dù đã có điểm từ các trận trước",
              points: "−2",
              color: "var(--error)",
              bg: "var(--surface)",
            },
          ].map((row) => (
            <div
              key={row.points}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: row.bg,
                borderBottom: "1px solid var(--outline-variant)",
              }}
            >
              <span className="text-base flex-shrink-0">{row.icon}</span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {row.condition}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
                >
                  {row.result}
                </p>
              </div>
              <span
                className="text-xl font-bold tabular-nums flex-shrink-0"
                style={{ fontFamily: "var(--font-display)", color: row.color }}
              >
                {row.points}
              </span>
            </div>
          ))}

          <div
            className="px-4 py-2.5"
            style={{ background: "var(--surface-soft)" }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
            >
              ⚠️ Ngôi Sao Hy Vọng chỉ có thể đặt trước khi trận đấu bắt đầu và có thể gắn vào nhiều trận.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
