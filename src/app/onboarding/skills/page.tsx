/**
 * Onboarding Step 3: Skills
 * Multi-select skill tags
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOnboardingStore, SUGGESTED_SKILLS } from "@/lib/stores/onboarding";

export default function SkillsPage() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(data.skills);
  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (skill: string) => {
    setSelected((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 10
        ? [...prev, skill]
        : prev
    );
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !selected.includes(skill) && selected.length < 10) {
      setSelected((prev) => [...prev, skill]);
      setCustomSkill("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomSkill();
    }
  };

  const handleContinue = () => {
    updateData({ skills: selected });
    router.push("/onboarding/seeking");
  };

  const canContinue = selected.length >= 2;

  return (
    <div className="max-w-xl mx-auto">
      {/* Question */}
      <div className="animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)] leading-tight">
          What skills do you bring?
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          Select 2-10 skills. These help us match you with people who complement or share your expertise.
        </p>
      </div>

      {/* Selected Skills */}
      {selected.length > 0 && (
        <div className="mt-6 animate-fade-up delay-100">
          <div className="flex flex-wrap gap-2">
            {selected.map((skill) => (
              <Badge
                key={skill}
                variant="default"
                className="px-3 py-1.5 text-sm bg-[var(--terracotta)] hover:bg-[var(--terracotta)]/90 cursor-pointer"
                onClick={() => toggleSkill(skill)}
              >
                {skill} ×
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {selected.length}/10 selected · Click to remove
          </p>
        </div>
      )}

      {/* Custom Skill Input */}
      <div className="mt-6 animate-fade-up delay-150">
        <div className="flex gap-2">
          <Input
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a custom skill..."
            className="rounded-xl border-[var(--border)]"
          />
          <Button
            variant="outline"
            onClick={addCustomSkill}
            disabled={!customSkill.trim() || selected.length >= 10}
            className="rounded-xl"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Suggested Skills */}
      <div className="mt-8 animate-fade-up delay-200">
        <p className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
          Suggested skills:
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SKILLS.map((skill) => {
            const isSelected = selected.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                disabled={!isSelected && selected.length >= 10}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-[var(--terracotta)] text-white"
                    : "bg-white border border-[var(--border)] text-[var(--espresso)] hover:border-[var(--terracotta)] disabled:opacity-50"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between animate-fade-up delay-300">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/working-on")}
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

      {!canContinue && selected.length > 0 && (
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          Select at least {2 - selected.length} more skill{2 - selected.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
