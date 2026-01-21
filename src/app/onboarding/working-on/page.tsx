/**
 * Onboarding Step 2: Working On
 * What the user is currently building/exploring
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useOnboardingStore } from "@/lib/stores/onboarding";

const EXAMPLES = [
  "Building an AI-powered code review tool for startups",
  "Exploring Web3 infrastructure for decentralized identity",
  "Writing a book about network states and digital communities",
  "Running a climate tech fund focused on Southeast Asia",
];

export default function WorkingOnPage() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();
  const [value, setValue] = useState(data.workingOn);
  const [showExamples, setShowExamples] = useState(false);

  const handleContinue = () => {
    updateData({ workingOn: value });
    router.push("/onboarding/skills");
  };

  const canContinue = value.trim().length >= 10;

  return (
    <div className="max-w-xl mx-auto">
      {/* Question */}
      <div className="animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)] leading-tight">
          What are you working on right now?
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          This is your &quot;living context&quot;—the thing that makes you interesting to the right people today.
        </p>
      </div>

      {/* Input */}
      <div className="mt-8 animate-fade-up delay-100">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="I'm building/exploring/researching..."
          className="min-h-[150px] text-lg p-4 rounded-2xl border-[var(--border)] focus:border-[var(--terracotta)] focus:ring-[var(--terracotta)]/20 resize-none"
        />
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-[var(--terracotta)] hover:underline"
          >
            {showExamples ? "Hide examples" : "Show examples"}
          </button>
          <span className="text-sm text-[var(--muted-foreground)]">
            {value.length} characters
          </span>
        </div>
      </div>

      {/* Examples */}
      {showExamples && (
        <div className="mt-4 space-y-2 animate-fade-up">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">
            Click to use:
          </p>
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              onClick={() => setValue(example)}
              className="block w-full text-left p-3 rounded-xl bg-white border border-[var(--border)] text-sm text-[var(--espresso)] hover:border-[var(--terracotta)] transition-colors"
            >
              &quot;{example}&quot;
            </button>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 rounded-2xl bg-[var(--amber)]/10 border border-[var(--amber)]/20 animate-fade-up delay-200">
        <p className="text-sm text-[var(--espresso)]">
          <span className="font-semibold">💡 Tip:</span> Be specific about your current focus. &quot;Building AI tools&quot; is okay, but &quot;Building AI-powered code review for startups&quot; helps us find better matches.
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between animate-fade-up delay-300">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/welcome")}
          className="text-[var(--muted-foreground)]"
        >
          ← Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-primary px-8 py-3 rounded-xl font-semibold"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
