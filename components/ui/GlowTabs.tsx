"use client";

import { useState } from "react";

export interface GlowTab {
  id: string;
  label: string;
}

export default function GlowTabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: GlowTab[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeId));
  const tabCount = tabs.length;

  return (
    <div className="relative flex p-1 rounded-xl backdrop-blur-xl bg-white/5 border border-white/20">
      <div
        className="absolute bottom-1 top-1 rounded-lg bg-gradient-to-r from-primary/40 to-neonBlue/40 border border-white/20 shadow-glow-soft transition-all duration-300 ease-out"
        style={{
          left: `calc(${activeIndex} * (100% / ${tabCount}) + 4px)`,
          width: `calc(100% / ${tabCount} - 8px)`,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            activeId === tab.id
              ? "text-white"
              : "text-white/70 hover:text-white hover:bg-white/5"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
