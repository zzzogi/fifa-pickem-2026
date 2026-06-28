"use client";
// components/picks/announcements-modal.tsx
import { useEffect, useState } from "react";

const SLIDES = [
  {
    key: "star-of-hope-announced-v1",
    icon: "⭐",
    title: "NGÔI SAO HY VỌNG",
    subtitle: "Tính năng mới • Từ vòng 1/32",
    body: (
      <>
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
              <strong style={{ color: "var(--success)" }}>+2 điểm thưởng</strong>
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
      </>
    ),
  },
  {
    key: "penalty-shootout-announced-v1",
    icon: "🥅",
    title: "DỰ ĐOÁN LUÂN LƯU",
    subtitle: "Tính năng mới • Từ vòng 1/32",
    body: (
      <>
        <p>
          Từ vòng 1/32, nếu bạn dự đoán <strong>hòa sau 120 phút</strong>, một ô dự đoán
          luân lưu sẽ xuất hiện để bạn dự đoán tỉ số 11 mét.
        </p>
        <div
          className="rounded-[6px] p-3 space-y-2"
          style={{ background: "var(--surface-high)" }}
        >
          <div className="flex items-start gap-3">
            <span className="text-base flex-shrink-0">✅</span>
            <span>
              Đúng <strong>đội thắng</strong> luân lưu →{" "}
              <strong style={{ color: "var(--success)" }}>+1 điểm thưởng</strong>
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-base flex-shrink-0">⚡</span>
            <span>
              Đúng <strong>tỉ số chính xác</strong> luân lưu →{" "}
              <strong style={{ color: "var(--success)" }}>+2 điểm thưởng</strong>
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-base flex-shrink-0">❌</span>
            <span>
              Dự đoán sai luân lưu → <strong>không bị trừ điểm</strong>
            </span>
          </div>
        </div>
        <p style={{ color: "var(--outline)" }}>
          Điểm luân lưu là <strong>thưởng thêm</strong> — không ảnh hưởng đến chuỗi thắng
          hay Ngôi Sao Hy Vọng.
        </p>
      </>
    ),
  },
] as const;

export default function AnnouncementsModal() {
  // Indices of slides the user hasn't permanently dismissed yet
  const [queue, setQueue] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const unseen = SLIDES.map((s, i) => i).filter(
      (i) => !localStorage.getItem(SLIDES[i].key),
    );
    setQueue(unseen);
  }, []);

  if (queue.length === 0) return null;

  const slideIndex = queue[current];
  const slide = SLIDES[slideIndex];
  const hasNext = current < queue.length - 1;

  function next() {
    if (hasNext) {
      setCurrent((c) => c + 1);
    } else {
      setQueue([]);
    }
  }

  function dismissPermanent() {
    // Mark all remaining slides as seen
    queue.slice(current).forEach((i) => localStorage.setItem(SLIDES[i].key, "1"));
    setQueue([]);
  }

  function closeSession() {
    setQueue([]);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="card-sports w-full max-w-md p-6 relative"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Top-right controls: next arrow (if more slides) + close */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {hasNext && (
            <button
              onClick={next}
              title="Thông báo tiếp theo"
              className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition hover:opacity-70"
              style={{
                background: "var(--primary-soft)",
                color: "var(--primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              →
            </button>
          )}
          <button
            onClick={closeSession}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm transition hover:opacity-70"
            style={{
              background: "var(--surface-high)",
              color: "var(--outline)",
              fontFamily: "var(--font-body)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Slide indicator (only if multiple unseen slides) */}
        {queue.length > 1 && (
          <div className="flex justify-center gap-1.5 mb-4 pt-1">
            {queue.map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all"
                style={{
                  width: i === current ? "20px" : "6px",
                  height: "6px",
                  background: i === current ? "var(--primary)" : "var(--outline-variant)",
                }}
              />
            ))}
          </div>
        )}

        {/* Icon */}
        <div className="text-5xl text-center mb-4">{slide.icon}</div>

        {/* Title */}
        <h2
          className="text-2xl text-center mb-1"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.02em" }}
        >
          {slide.title}
        </h2>
        <p
          className="text-xs uppercase tracking-widest text-center mb-5"
          style={{ color: "var(--outline)", fontFamily: "var(--font-body)", fontWeight: 700 }}
        >
          {slide.subtitle}
        </p>

        {/* Body */}
        <div
          className="space-y-3 mb-6 text-sm"
          style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}
        >
          {slide.body}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={next}
            className="w-full py-2.5 rounded-[6px] text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-90"
            style={{
              background: "var(--primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            {hasNext ? "Tiếp theo →" : "Đã hiểu!"}
          </button>
          <button
            onClick={dismissPermanent}
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
