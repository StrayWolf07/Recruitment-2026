import { ButtonHTMLAttributes, forwardRef } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ children, className = "", variant = "primary", ...props }, ref) => {
    const base =
      "relative px-6 py-2.5 rounded-xl font-medium transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-deepBg disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary:
        "bg-gradient-to-r from-primary to-neonPink text-white border border-white/20 shadow-glow hover:shadow-glow-blue hover:scale-[1.02] focus:ring-neonBlue",
      secondary:
        "bg-white/10 backdrop-blur-lg text-white border border-neonBlue/50 hover:border-neonBlue hover:shadow-glow-blue focus:ring-neonBlue",
      danger:
        "bg-gradient-to-r from-red-500/80 to-neonPink/80 text-white border border-white/20 hover:shadow-glow-pink focus:ring-neonPink",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeonButton.displayName = "NeonButton";
export default NeonButton;
