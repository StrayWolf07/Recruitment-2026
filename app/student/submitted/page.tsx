import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";

export default function StudentSubmittedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <GlassCard className="p-12 max-w-md w-full text-center">
        <h1 className="font-display font-bold text-2xl tracking-head mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPink">
          Submission Confirmed
        </h1>
        <p className="text-white/70 mb-8">Your exam has been submitted successfully.</p>
        <Link href="/">
          <NeonButton variant="secondary">Return home</NeonButton>
        </Link>
      </GlassCard>
    </div>
  );
}
