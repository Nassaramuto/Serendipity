/**
 * Onboarding Layout
 * Shared layout with progress indicator for onboarding steps
 */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ONBOARDING_STEPS } from "@/lib/stores/onboarding";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine current step from pathname
  const currentStep = ONBOARDING_STEPS.find((s) => s.path === pathname);
  const currentStepIndex = currentStep ? currentStep.id : 1;
  const progress = ((currentStepIndex - 1) / (ONBOARDING_STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--terracotta)] to-[var(--terracotta-light)] flex items-center justify-center">
                <span className="text-white text-sm">✦</span>
              </div>
              <span className="font-display font-semibold text-[var(--espresso)]">
                Serendipity
              </span>
            </Link>
            <span className="text-sm text-[var(--muted-foreground)]">
              Step {currentStepIndex} of {ONBOARDING_STEPS.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-1.5 bg-[var(--cream-dark)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--terracotta)] to-[var(--terracotta-light)] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}
