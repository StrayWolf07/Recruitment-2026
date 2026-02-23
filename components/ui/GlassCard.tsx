import { HTMLAttributes } from "react";

export default function GlassCard({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-glow-soft transition-all duration-300 hover:shadow-glow hover:border-white/30 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
