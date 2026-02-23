"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import GlowInput from "@/components/ui/GlowInput";
import NeonButton from "@/components/ui/NeonButton";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/student/profile");
      router.refresh();
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <GlassCard className="p-8 max-w-md w-full">
        <h1 className="font-display font-bold text-2xl tracking-head mb-6">Student Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Email</label>
            <GlowInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Password</label>
            <GlowInput
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <label className="mt-2 flex items-center gap-2 cursor-pointer text-sm text-white/60 hover:text-white/80">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-white/30 bg-white/5 text-neonBlue focus:ring-neonBlue"
              />
              Show password
            </label>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <NeonButton type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Log In"}
          </NeonButton>
        </form>
        <Link href="/student/signup" className="mt-4 block text-center text-neonBlue hover:text-neonBlue/80 text-sm transition-colors">
          Create an account
        </Link>
      </GlassCard>
    </div>
  );
}
