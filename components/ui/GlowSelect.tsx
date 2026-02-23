import { SelectHTMLAttributes, forwardRef } from "react";

const GlowSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neonBlue/60 focus:border-neonBlue/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.3)] [&>option]:bg-deepBg [&>option]:text-white ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

GlowSelect.displayName = "GlowSelect";
export default GlowSelect;
