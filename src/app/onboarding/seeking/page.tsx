/**
 * Onboarding Step 4: Seeking
 * What kind of people they want to meet
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useOnboardingStore } from "@/lib/stores/onboarding";

const PROMPTS = [
  { emoji: "🚀", text: "Someone who's raised funding before" },
  { emoji: "🛠️", text: "A technical co-founder for my idea" },
  { emoji: "🎨", text: "A designer who gets product" },
  { emoji: "📈", text: "Growth/marketing expertise" },
  { emoji: "🌏", text: "People building in Southeast Asia" },
  { emoji: "🤖", text: "AI/ML engineers to collaborate with" },
];

export default function SeekingPage() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();
  const [value, setValue] = useState(data.seeking);

  const handlePromptClick = (text: string) => {
    setValue((prev) => {
      if (prev.trim()) {
        return prev + "\n" + text;
      }
      return text;
    });
  };

  const handleContinue = () => {
    updateData({ seeking: value });
    router.push("/onboarding/preferences");
  };

  const canContinue = value.trim().length >= 10;

  return (
    <div className="max-w-xl mx-auto">
      {/* Question */}
      <div className="animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)] leading-tight">
          Who would you love to meet?
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          Describe the people who could help you—or who you could help. Be specific about what you&apos;re looking for.
        </p>
      </div>

      {/* Quick Prompts */}
      <div className="mt-6 animate-fade-up delay-100">
        <p className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
          Quick add (click to append):
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(prompt.text)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[var(--border)] text-sm text-[var(--espresso)] hover:border-[var(--terracotta)] transition-colors"
            >
              <span>{prompt.emoji}</span>
              <span>{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mt-6 animate-fade-up delay-200">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="I'm looking for people who...

Examples:
- Have experience scaling B2B SaaS
- Are working on similar problems in climate tech
- Can give advice on fundraising in Singapore"
          className="min-h-[180px] text-base p-4 rounded-2xl border-[var(--border)] focus:border-[var(--terracotta)] focus:ring-[var(--terracotta)]/20 resize-none"
        />
        <p className="mt-2 text-sm text-[var(--muted-foreground)] text-right">
          {value.length} characters
        </p>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 rounded-2xl bg-[var(--sage)]/10 border border-[var(--sage)]/20 animate-fade-up delay-300">
        <p className="text-sm text-[var(--espresso)]">
          <span className="font-semibold">💡 Tip:</span> The more specific you are, the better your matches. Instead of &quot;investors&quot;, try &quot;angel investors who&apos;ve backed developer tools in SEA&quot;.
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between animate-fade-up delay-400">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/skills")}
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
