"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  endTime: number;
}

export default function Timer({ endTime }: TimerProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const r = Math.max(0, Math.floor((endTime - now) / 1000));
      setRemaining(r);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [endTime]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  const isLow = remaining <= 300;

  return (
    <div
      className={`font-mono text-2xl font-bold px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border ${
        isLow
          ? "border-red-400/60 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
          : "border-neonBlue/40 text-neonBlue shadow-[0_0_20px_rgba(0,229,255,0.3)]"
      }`}
    >
      {h}:{m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
    </div>
  );
}
