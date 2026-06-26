"use client";
// components/picks/star-of-hope-announcement.tsx
import { useEffect, useState } from "react";

const STORAGE_KEY = "star-of-hope-announced-v1";

export default function StarOfHopeAnnouncement() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss(permanent: boolean) {
    if (permanent) localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="card-sports w-full max-w-md p-6 relative"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Close for session */}
        <button
          onClick={() => dismiss(false)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-sm transition hover:opacity-70"
          style={{
            background: "var(--surface-high)",
            color: "var(--outline)",
            fontFamily: "var(--font-body)",
          }}
        >
          ✕
        </button>

        {/* Icon */}
        <div className="text-5xl text-center mb-4">⭐</div>

        {/* Title */}
        <h2
          className="text-2xl text-center mb-1"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          NGÔI SAO HY VỌNG
        </h2>
        <p
          className="text-xs uppercase tracking-widest text-center mb-5"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)", fontWeight: 700 }}
        >
          Tính năng mới • Từ vòng 1/32
        </p>

        {/* Rules */}
        <div
          className="space-y-3 mb-6 text-sm"
          style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
        >
          <p>
            Bắt đầu từ vòng 1/32, bạn có thể gắn{" "}
            <strong>Ngôi Sao Hy Vọng ⭐</strong> vào bất kỳ dự đoán nào.
          </p>

          <div
            className="rounded-[6px] p-3 space-y-2"
            style={{ background: "var(--surface-high)" }}
          >
            <div className="flex items-start gap-3">
              <span className="text-base flex-shrink-0">✅</span>
              <span>
                Dự đoán <strong>đúng</strong> với Ngôi Sao Hy Vọng →{" "}
                <strong style={{ color: "var(--success)" }}>nhân đôi điểm</strong>
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-base flex-shrink-0">❌</span>
              <span>
                Dự đoán <strong>sai</strong> với Ngôi Sao Hy Vọng →{" "}
                <strong style={{ color: "var(--error)" }}>trừ 2 điểm</strong>
              </span>
            </div>
          </div>

          <p style={{ color: "var(--outline)" }}>
            Nhấn ☆ trên thẻ trận đấu để bật/tắt Ngôi Sao Hy Vọng trước khi trận bắt đầu.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => dismiss(false)}
            className="w-full py-2.5 rounded-[6px] text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-90"
            style={{
              background: "var(--primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Đã hiểu!
          </button>
          <button
            onClick={() => dismiss(true)}
            className="w-full py-2 rounded-[6px] text-xs uppercase tracking-wide transition hover:opacity-70"
            style={{
              background: "transparent",
              color: "var(--outline)",
              fontFamily: "var(--font-body)",
            }}
          >
            Không hiển thị lại
          </button>
        </div>
      </div>
    </div>
  );
}
