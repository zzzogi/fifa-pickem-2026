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
          className="overflow-hidden rounded-[4px] border"
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--secondary)" }}>
                {["Dự Đoán", "Ví Dụ", "Kết Quả", "Điểm"].map((h) => (
                  <th
                    key={h}
                    className="py-2.5 px-4 text-left text-xs uppercase tracking-widest text-white font-bold"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[
                {
                  prediction: "Đúng Tỷ Số",
                  example: "Dự đoán 2–1, kết quả 2–1",
                  result: "Khớp hoàn toàn",
                  points: "+3",
                  highlight: true,
                },
                {
                  prediction: "Đúng Đội Thắng",
                  example: "Dự đoán 1–0, kết quả 2–1",
                  result: "Đúng đội chiến thắng",
                  points: "+1",
                  highlight: false,
                },
                {
                  prediction: "Đúng Hòa",
                  example: "Dự đoán 1–1, kết quả 0–0",
                  result: "Đều dự đoán hòa",
                  points: "+1",
                  highlight: false,
                },
                {
                  prediction: "Sai",
                  example: "Dự đoán 2–0, kết quả 0–1",
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
          className="overflow-hidden rounded-[4px] border"
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--secondary)" }}>
                {["Chuỗi", "Cấp Độ", "Thưởng Mỗi Trận", "Ví Dụ Tổng Điểm"].map(
                  (h) => (
                    <th
                      key={h}
                      className="py-2.5 px-4 text-left text-xs uppercase tracking-widest text-white font-bold"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {[
                {
                  streak: "1–2",
                  tier: "—",
                  bonus: "+0",
                  example: "1 điểm (đúng đội thắng)",
                  tierColor: "var(--outline)",
                },
                {
                  streak: "3–4",
                  tier: "🔥",
                  bonus: "+1",
                  example: "2 điểm cho mỗi lần đoán đúng đội thắng",
                  tierColor: "#f97316",
                },
                {
                  streak: "5–7",
                  tier: "🔥🔥",
                  bonus: "+2",
                  example: "3 điểm cho mỗi lần đoán đúng đội thắng",
                  tierColor: "#ef4444",
                },
                {
                  streak: "8+",
                  tier: "🔥🔥🔥",
                  bonus: "+3",
                  example: "4 điểm cho mỗi lần đoán đúng đội thắng",
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
    </div>
  );
}
