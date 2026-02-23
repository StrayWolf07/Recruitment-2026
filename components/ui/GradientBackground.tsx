"use client";

export default function GradientBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden animate-gradient-shift"
      style={{
        background: "linear-gradient(135deg, #0B0F1A 0%, #1a1f3a 25%, #2d1b4e 50%, #1a1f3a 75%, #0B0F1A 100%)",
        backgroundSize: "400% 400%",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-neonBlue/10 via-transparent to-transparent opacity-40" />
    </div>
  );
}
