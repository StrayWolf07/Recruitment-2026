import { InputHTMLAttributes, forwardRef } from "react";

const GlowInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neonBlue/60 focus:border-neonBlue/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.3)] ${className}`}
        {...props}
      />
    );
  }
);

GlowInput.displayName = "GlowInput";
export default GlowInput;
