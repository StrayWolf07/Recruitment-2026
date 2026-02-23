import { TextareaHTMLAttributes, forwardRef } from "react";

const GlowTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neonBlue/60 focus:border-neonBlue/50 focus:shadow-[0_0_15px_rgba(0,229,255,0.3)] resize-y ${className}`}
        {...props}
      />
    );
  }
);

GlowTextarea.displayName = "GlowTextarea";
export default GlowTextarea;
