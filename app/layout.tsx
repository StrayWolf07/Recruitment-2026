import type { Metadata } from "next";
import "./globals.css";
import GradientBackground from "@/components/ui/GradientBackground";

export const metadata: Metadata = {
  title: "Recruitment Exam",
  description: "Full-stack recruitment exam web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-deepBg">
        <GradientBackground />
        <main className="relative min-h-screen">{children}</main>
      </body>
    </html>
  );
}
