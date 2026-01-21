/**
 * Onboarding Step 6: Complete
 * Summary, save to database, and celebrate
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore, OPEN_TO_OPTIONS } from "@/lib/stores/onboarding";
import { trpc } from "@/trpc/client";

export default function CompletePage() {
  const router = useRouter();
  const { data, reset } = useOnboardingStore();
  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Capture a snapshot of the data for display (persists after reset)
  const [savedData, setSavedData] = useState(data);

  const upsertContext = trpc.context.upsert.useMutation({
    onSuccess: () => {
      setSaved(true);
      setShowConfetti(true);
    },
  });

  useEffect(() => {
    // Auto-save on mount if not already saved
    if (!saved && !upsertContext.isPending && data.workingOn) {
      // Capture the data snapshot before saving
      setSavedData({ ...data });

      upsertContext.mutate({
        workingOn: data.workingOn,
        skills: data.skills,
        seeking: data.seeking,
        bio: data.bio || undefined,
        currentLocation: data.currentLocation,
        upcomingTravel: data.upcomingTravel,
        openTo: data.openTo as Array<
          | "collaborations"
          | "advice"
          | "mentorship"
          | "cofounding"
          | "hiring"
          | "investment"
          | "friendship"
        >,
      });
    }
  }, []);

  // Reset the store only when navigating away
  const handleGoToMatches = () => {
    reset();
    router.push("/matches");
  };

  const getOpenToLabels = () => {
    return savedData.openTo
      .map((value) => OPEN_TO_OPTIONS.find((o) => o.value === value)?.label)
      .filter(Boolean);
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: [
                    "var(--terracotta)",
                    "var(--sage)",
                    "var(--amber)",
                    "var(--terracotta-light)",
                  ][Math.floor(Math.random() * 4)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      {upsertContext.isPending && (
        <div className="animate-fade-up">
          <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-[var(--sage)]/20 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-[var(--sage)] border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)]">
            Saving your profile...
          </h1>
        </div>
      )}

      {upsertContext.isError && (
        <div className="animate-fade-up">
          <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-red-100 flex items-center justify-center">
            <span className="text-4xl">😔</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)]">
            Something went wrong
          </h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            {upsertContext.error?.message || "Please try again."}
          </p>
          <Button
            onClick={() => upsertContext.mutate({
              workingOn: savedData.workingOn,
              skills: savedData.skills,
              seeking: savedData.seeking,
              currentLocation: savedData.currentLocation,
              upcomingTravel: savedData.upcomingTravel,
              openTo: savedData.openTo as Array<
                | "collaborations"
                | "advice"
                | "mentorship"
                | "cofounding"
                | "hiring"
                | "investment"
                | "friendship"
              >,
            })}
            className="mt-6 btn-primary"
          >
            Try Again
          </Button>
        </div>
      )}

      {saved && (
        <>
          {/* Celebration */}
          <div className="animate-fade-up">
            <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[var(--terracotta)] to-[var(--terracotta-light)] flex items-center justify-center shadow-lg animate-bounce-slow">
              <span className="text-5xl">🎉</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-display font-semibold text-[var(--espresso)] leading-tight">
              You&apos;re all set!
            </h1>

            <p className="mt-6 text-xl text-[var(--muted-foreground)] leading-relaxed">
              Your context window is live. We&apos;re already finding people who match your vibe.
            </p>
          </div>

          {/* Summary */}
          <div className="mt-12 text-left animate-fade-up delay-200">
            <h2 className="text-lg font-semibold text-[var(--espresso)] mb-4">
              Your profile at a glance
            </h2>

            <div className="space-y-4">
              {/* Working On */}
              <div className="p-4 rounded-2xl bg-white border border-[var(--border)]">
                <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">
                  Working on
                </p>
                <p className="text-[var(--espresso)] line-clamp-2">
                  {savedData.workingOn}
                </p>
              </div>

              {/* Skills */}
              <div className="p-4 rounded-2xl bg-white border border-[var(--border)]">
                <p className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-full bg-[var(--sage)]/20 text-sm text-[var(--espresso)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location & Open To */}
              <div className="p-4 rounded-2xl bg-white border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">📍</span>
                  <span className="text-[var(--espresso)]">
                    {savedData.currentLocation}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getOpenToLabels().map((label) => (
                    <span
                      key={label}
                      className="px-2.5 py-1 rounded-full bg-[var(--amber)]/20 text-sm text-[var(--espresso)]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mt-8 p-6 rounded-2xl bg-[var(--sage)]/10 border border-[var(--sage)]/20 text-left animate-fade-up delay-300">
            <h3 className="font-semibold text-[var(--espresso)] mb-2">
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-[var(--espresso)]">
              <li className="flex items-start gap-2">
                <span>🔮</span>
                <span>Our AI will analyze your context and find relevant matches</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📬</span>
                <span>You&apos;ll get your first matches in your daily digest</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🤝</span>
                <span>Express interest, and when it&apos;s mutual, you can connect!</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-12 animate-fade-up delay-400">
            <Button
              size="lg"
              onClick={handleGoToMatches}
              className="btn-primary px-12 py-6 text-lg font-semibold rounded-2xl"
            >
              See Your Matches
            </Button>

            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              Your first matches are being generated
            </p>
          </div>
        </>
      )}
    </div>
  );
}
