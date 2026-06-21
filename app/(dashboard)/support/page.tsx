// app/(dashboard)/support/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ủng hộ tôi | FIFA Pick'em 2026",
  description: "Nếu bạn thấy app vui, hãy Ủng hộ tôi một ly cà phê ☕",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-lg py-8">
      <div
        className="rounded-[4px] border p-8 text-center"
        style={{
          borderColor: "var(--outline-variant)",
          background: "var(--surface)",
        }}
      >
        {/* Header */}
        <p className="text-4xl mb-3">☕</p>
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}
        >
          ỦNG HỘ TÔI
        </h1>
        <p
          className="text-sm mb-6"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--on-surface-variant)",
            lineHeight: 1.6,
          }}
        >
          App này được làm trong lúc rảnh rỗi, hoàn toàn miễn phí.{"\n"}
          Nếu bạn thấy vui và thú vị, hãy Ủng hộ tôi một ly cà phê nhé ☕
        </p>

        {/* QR Code — đặt file vào public/qr-momo.png */}
        <div className="flex justify-center mb-6">
          <div
            className="rounded-[4px] border p-4 inline-block"
            style={{
              borderColor: "var(--outline-variant)",
              background: "white",
            }}
          >
            <img
              src="/qr-vcb.png"
              alt="QR VCB ủng hộ"
              width={220}
              height={220}
              className="object-contain"
            />
          </div>
        </div>

        {/* Bank info */}
        <div
          className="rounded-[4px] border p-4 mb-6 text-left space-y-2"
          style={{
            borderColor: "var(--outline-variant)",
            background: "var(--surface-container-low)",
          }}
        >
          {[
            { label: "Ngân hàng", value: "Vietcombank" },
            { label: "Số tài khoản", value: "0011004447035" },
            { label: "Chủ tài khoản", value: "BUI VIET QUYEN" },
            { label: "Nội dung", value: "Ung ho Pick'em 2026" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center">
              <span
                className="text-xs uppercase tracking-wide font-bold"
                style={{
                  color: "var(--outline)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {row.label}
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  color: "var(--on-surface)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <p
          className="text-xs"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)" }}
        >
          Mọi khoản ủng hộ đều giúp tác giả có thêm động lực phát triển app 🙏
        </p>
      </div>
    </div>
  );
}
