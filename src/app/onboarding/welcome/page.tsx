/**
 * Onboarding Step 1: Welcome
 * Introduction to Serendipity
 */

"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useUser();

  const firstName = user?.firstName || "there";

  return (
    <div className="max-w-xl mx-auto text-center">
      {/* Greeting */}
      <div className="animate-fade-up">
        <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[var(--terracotta)] to-[var(--terracotta-light)] flex items-center justify-center shadow-lg">
          <span className="text-4xl">👋</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-display font-semibold text-[var(--espresso)] leading-tight">
          Hey {firstName}!
        </h1>

        <p className="mt-6 text-xl text-[var(--muted-foreground)] leading-relaxed">
          Welcome to Serendipity. I&apos;m here to help you find the right people at Network School.
        </p>
      </div>

      {/* What we'll do */}
      <div className="mt-12 text-left animate-fade-up delay-200">
        <h2 className="text-lg font-semibold text-[var(--espresso)] mb-4">
          In the next 2 minutes, I&apos;ll ask about:
        </h2>

        <div className="space-y-4">
          {[
            { icon: "🔨", text: "What you're currently working on" },
            { icon: "🎯", text: "Your skills and superpowers" },
            { icon: "🤝", text: "The kind of people you want to meet" },
            { icon: "📍", text: "Where you'll be and your preferences" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[var(--border)]"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[var(--espresso)]">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why */}
      <div className="mt-12 p-6 rounded-2xl bg-[var(--sage)]/10 border border-[var(--sage)]/20 text-left animate-fade-up delay-300">
        <p className="text-[var(--espresso)]">
          <span className="font-semibold">Why?</span> This helps me match you with people who share your context—not just keywords, but real relevance.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-12 animate-fade-up delay-400">
        <Button
          size="lg"
          onClick={() => router.push("/onboarding/working-on")}
          className="btn-primary px-12 py-6 text-lg font-semibold rounded-2xl"
        >
          Let&apos;s go →
        </Button>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Takes about 2 minutes
        </p>
      </div>
    </div>
  );
}
