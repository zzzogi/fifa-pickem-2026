"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  /** Max width của tooltip bubble, mặc định 220px */
  maxWidth?: number;
  /** Delay hiện tooltip khi hover (ms), mặc định 300 */
  delay?: number;
}

const OFFSET = 8; // khoảng cách giữa trigger và bubble

export function Tooltip({
  content,
  children,
  placement = "top",
  maxWidth = 220,
  delay = 300,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [resolvedPlacement, setResolvedPlacement] =
    useState<TooltipPlacement>(placement);

  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouch = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const computePosition = useCallback(
    (pref: TooltipPlacement) => {
      const trigger = triggerRef.current;
      const bubble = bubbleRef.current;
      if (!trigger || !bubble) return;

      const tr = trigger.getBoundingClientRect();
      const br = bubble.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Flip nếu không đủ chỗ
      let p = pref;
      if (p === "top" && tr.top < br.height + OFFSET) p = "bottom";
      else if (p === "bottom" && tr.bottom + br.height + OFFSET > vh) p = "top";
      else if (p === "left" && tr.left < br.width + OFFSET) p = "right";
      else if (p === "right" && tr.right + br.width + OFFSET > vw) p = "left";

      let top = 0;
      let left = 0;
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      if (p === "top") {
        top = tr.top + scrollY - br.height - OFFSET;
        left = tr.left + scrollX + tr.width / 2 - br.width / 2;
      } else if (p === "bottom") {
        top = tr.bottom + scrollY + OFFSET;
        left = tr.left + scrollX + tr.width / 2 - br.width / 2;
      } else if (p === "left") {
        top = tr.top + scrollY + tr.height / 2 - br.height / 2;
        left = tr.left + scrollX - br.width - OFFSET;
      } else {
        top = tr.top + scrollY + tr.height / 2 - br.height / 2;
        left = tr.right + scrollX + OFFSET;
      }

      // Clamp ngang để không bị tràn viewport
      left = Math.max(8, Math.min(left, vw + scrollX - br.width - 8));

      setResolvedPlacement(p);
      setCoords({ top, left });
    },
    [placement],
  );

  const show = useCallback(() => {
    setVisible(true);
    // Đợi bubble render rồi mới tính vị trí
    requestAnimationFrame(() => computePosition(placement));
  }, [computePosition, placement]);

  const hide = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, []);

  // Desktop: hover
  const handleMouseEnter = () => {
    if (isTouch.current) return;
    clearTimer();
    timerRef.current = setTimeout(show, delay);
  };

  const handleMouseLeave = () => {
    if (isTouch.current) return;
    clearTimer();
    timerRef.current = setTimeout(hide, 100);
  };

  // Mobile: tap toggle
  const handleTouchStart = () => {
    isTouch.current = true;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isTouch.current) return;
    e.stopPropagation();
    if (visible) {
      hide();
    } else {
      show();
    }
  };

  // Đóng khi click ra ngoài (mobile)
  useEffect(() => {
    if (!visible) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        bubbleRef.current?.contains(e.target as Node)
      )
        return;
      hide();
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [visible, hide]);

  // Recompute khi scroll/resize
  useEffect(() => {
    if (!visible) return;
    const update = () => computePosition(resolvedPlacement);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [visible, computePosition, resolvedPlacement]);

  useEffect(() => () => clearTimer(), []);

  // Arrow direction ngược với placement
  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    ...(resolvedPlacement === "top" && {
      bottom: -5,
      left: "50%",
      transform: "translateX(-50%)",
      borderLeft: "5px solid transparent",
      borderRight: "5px solid transparent",
      borderTop: "5px solid var(--secondary)",
    }),
    ...(resolvedPlacement === "bottom" && {
      top: -5,
      left: "50%",
      transform: "translateX(-50%)",
      borderLeft: "5px solid transparent",
      borderRight: "5px solid transparent",
      borderBottom: "5px solid var(--secondary)",
    }),
    ...(resolvedPlacement === "left" && {
      right: -5,
      top: "50%",
      transform: "translateY(-50%)",
      borderTop: "5px solid transparent",
      borderBottom: "5px solid transparent",
      borderLeft: "5px solid var(--secondary)",
    }),
    ...(resolvedPlacement === "right" && {
      left: -5,
      top: "50%",
      transform: "translateY(-50%)",
      borderTop: "5px solid transparent",
      borderBottom: "5px solid transparent",
      borderRight: "5px solid var(--secondary)",
    }),
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        style={{ display: "inline-flex", cursor: "default" }}
      >
        {children}
      </span>

      {visible && (
        <div
          ref={bubbleRef}
          role="tooltip"
          style={{
            position: "absolute",
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            maxWidth,
            pointerEvents: "none",
            // Animate
            animation: "tooltip-in 0.12s ease-out",
          }}
        >
          <style>{`
            @keyframes tooltip-in {
              from { opacity: 0; transform: scale(0.95); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
          <div
            style={{
              position: "relative",
              background: "var(--secondary)",
              color: "#fff",
              borderRadius: "var(--radius-md)",
              padding: "6px 10px",
              fontSize: "0.75rem",
              lineHeight: 1.5,
              fontFamily: "var(--font-body)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {content}
            <span style={arrowStyle} aria-hidden="true" />
          </div>
        </div>
      )}
    </>
  );
}
