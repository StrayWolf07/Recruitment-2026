import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <GlassCard className="p-12 max-w-md w-full text-center">
        <h1 className="font-display font-bold text-3xl tracking-head mb-2 text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPink">
          Recruitment Exam
        </h1>
        <p className="text-white/70 text-sm mb-8">Select your portal</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/student/login">
            <NeonButton variant="primary" className="w-full sm:w-auto">
              Student
            </NeonButton>
          </Link>
          <Link href="/admin/login">
            <NeonButton variant="secondary" className="w-full sm:w-auto">
              Admin
            </NeonButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
