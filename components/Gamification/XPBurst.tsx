"use client";

import { forwardRef, useImperativeHandle, useState, useCallback } from "react";

interface XPBurstRef {
  trigger: (x: number, y: number) => void;
}

interface XPBurstProps {
  xp: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
}

/**
 * XPBurst — animated "+XP" counter that appears at (x, y) and floats up.
 * Usage: attach ref and call ref.current.trigger(x, y).
 * Respects prefers-reduced-motion.
 */
export const XPBurst = forwardRef<XPBurstRef, XPBurstProps>(
  function XPBurst({ xp }, ref) {
    const [bursts, setBursts] = useState<Burst[]>([]);

    const trigger = useCallback((x: number, y: number) => {
      // Skip animation if user prefers reduced motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const id = Date.now();
      setBursts((prev) => [...prev, { id, x, y }]);
      // Remove after animation completes
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 1300);
    }, []);

    useImperativeHandle(ref, () => ({ trigger }), [trigger]);

    return (
      <>
        {bursts.map((b) => (
          <div
            key={b.id}
            className="xp-burst"
            style={{ left: b.x - 32, top: b.y - 20 }}
            aria-hidden="true"
          >
            +{xp} XP ⚡
          </div>
        ))}
      </>
    );
  }
);
