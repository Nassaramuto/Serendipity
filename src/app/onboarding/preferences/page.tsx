/**
 * Onboarding Step 5: Preferences
 * Location, travel, and connection type preferences
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingStore, OPEN_TO_OPTIONS } from "@/lib/stores/onboarding";

export default function PreferencesPage() {
  const router = useRouter();
  const { data, updateData } = useOnboardingStore();
  const [location, setLocation] = useState(data.currentLocation);
  const [travelInput, setTravelInput] = useState("");
  const [travel, setTravel] = useState<string[]>(data.upcomingTravel);
  const [openTo, setOpenTo] = useState<string[]>(data.openTo);

  const toggleOpenTo = (value: string) => {
    setOpenTo((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const addTravel = () => {
    const trimmed = travelInput.trim();
    if (trimmed && !travel.includes(trimmed)) {
      setTravel((prev) => [...prev, trimmed]);
      setTravelInput("");
    }
  };

  const removeTravel = (item: string) => {
    setTravel((prev) => prev.filter((t) => t !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTravel();
    }
  };

  const handleContinue = () => {
    updateData({
      currentLocation: location,
      upcomingTravel: travel,
      openTo,
    });
    router.push("/onboarding/complete");
  };

  const canContinue = location.trim().length > 0 && openTo.length > 0;

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[var(--espresso)] leading-tight">
          Where are you & what are you open to?
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          This helps us match you with people nearby or at the same events.
        </p>
      </div>

      {/* Current Location */}
      <div className="mt-8 animate-fade-up delay-100">
        <label className="block text-sm font-medium text-[var(--espresso)] mb-2">
          Where are you based? 📍
        </label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Singapore, Network School Campus"
          className="rounded-xl border-[var(--border)] text-base py-3"
        />
      </div>

      {/* Upcoming Travel */}
      <div className="mt-8 animate-fade-up delay-150">
        <label className="block text-sm font-medium text-[var(--espresso)] mb-2">
          Any upcoming travel or events? ✈️
        </label>
        <div className="flex gap-2">
          <Input
            value={travelInput}
            onChange={(e) => setTravelInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Token2049 Singapore, Feb 15-20"
            className="rounded-xl border-[var(--border)]"
          />
          <Button
            variant="outline"
            onClick={addTravel}
            disabled={!travelInput.trim()}
            className="rounded-xl"
          >
            Add
          </Button>
        </div>
        {travel.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {travel.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--amber)]/20 text-sm text-[var(--espresso)]"
              >
                {item}
                <button
                  onClick={() => removeTravel(item)}
                  className="ml-1 text-[var(--muted-foreground)] hover:text-[var(--espresso)]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Optional — helps us connect you with people at the same events
        </p>
      </div>

      {/* Open To */}
      <div className="mt-8 animate-fade-up delay-200">
        <label className="block text-sm font-medium text-[var(--espresso)] mb-2">
          What types of connections are you open to? 🤝
        </label>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Select all that apply
        </p>
        <div className="grid gap-3">
          {OPEN_TO_OPTIONS.map((option) => {
            const isSelected = openTo.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleOpenTo(option.value)}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "border-[var(--terracotta)] bg-[var(--terracotta)]/5"
                    : "border-[var(--border)] bg-white hover:border-[var(--terracotta)]/50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "border-[var(--terracotta)] bg-[var(--terracotta)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-[var(--espresso)]">
                    {option.label}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between animate-fade-up delay-300">
        <Button
          variant="ghost"
          onClick={() => router.push("/onboarding/seeking")}
          className="text-[var(--muted-foreground)]"
        >
          ← Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          className="btn-primary px-8 py-3 rounded-xl font-semibold"
        >
          Almost done →
        </Button>
      </div>

      {!canContinue && (
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
          Please enter your location and select at least one connection type
        </p>
      )}
    </div>
  );
}
