/**
 * Profile Page
 * View and edit user's context window
 */

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/trpc/client";
import { OPEN_TO_OPTIONS, SUGGESTED_SKILLS } from "@/lib/stores/onboarding";

export default function ProfilePage() {
  const { user } = useUser();
  const utils = trpc.useUtils();
  const { data: context, isLoading } = trpc.context.get.useQuery();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    workingOn: "",
    skills: [] as string[],
    seeking: "",
    currentLocation: "",
    upcomingTravel: [] as string[],
    openTo: [] as string[],
  });
  const [customSkill, setCustomSkill] = useState("");
  const [travelInput, setTravelInput] = useState("");

  const updateContext = trpc.context.upsert.useMutation({
    onSuccess: () => {
      utils.context.get.invalidate();
      setIsEditing(false);
    },
  });

  const startEditing = () => {
    if (context) {
      setFormData({
        workingOn: context.workingOn || "",
        skills: context.skills || [],
        seeking: context.seeking || "",
        currentLocation: context.currentLocation || "",
        upcomingTravel: context.upcomingTravel || [],
        openTo: context.openTo || [],
      });
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    updateContext.mutate({
      workingOn: formData.workingOn,
      skills: formData.skills,
      seeking: formData.seeking,
      currentLocation: formData.currentLocation,
      upcomingTravel: formData.upcomingTravel,
      openTo: formData.openTo as Array<
        | "collaborations"
        | "advice"
        | "mentorship"
        | "cofounding"
        | "hiring"
        | "investment"
        | "friendship"
      >,
    });
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : prev.skills.length < 10
        ? [...prev.skills, skill]
        : prev.skills,
    }));
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !formData.skills.includes(skill) && formData.skills.length < 10) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      setCustomSkill("");
    }
  };

  const toggleOpenTo = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      openTo: prev.openTo.includes(value)
        ? prev.openTo.filter((v) => v !== value)
        : [...prev.openTo, value],
    }));
  };

  const addTravel = () => {
    const trimmed = travelInput.trim();
    if (trimmed && !formData.upcomingTravel.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        upcomingTravel: [...prev.upcomingTravel, trimmed],
      }));
      setTravelInput("");
    }
  };

  const removeTravel = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      upcomingTravel: prev.upcomingTravel.filter((t) => t !== item),
    }));
  };

  const getOpenToLabel = (value: string) => {
    return OPEN_TO_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--sage)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[var(--muted-foreground)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-up">
        <div className="flex items-center gap-4">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.fullName || "Profile"}
              className="w-16 h-16 rounded-2xl object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-display font-semibold text-[var(--espresso)]">
              {user?.fullName || "Your Profile"}
            </h1>
            <p className="text-[var(--muted-foreground)]">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        {!isEditing && context && (
          <Button
            variant="outline"
            onClick={startEditing}
            className="rounded-xl"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {!context ? (
        <div className="text-center py-12 animate-fade-up delay-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[var(--sage)]/20 flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
          <h2 className="text-xl font-display font-semibold text-[var(--espresso)]">
            Complete your profile
          </h2>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Tell us about yourself so we can find great matches.
          </p>
          <a
            href="/onboarding"
            className="inline-block mt-6 btn-primary px-8 py-3 rounded-xl font-semibold"
          >
            Start Onboarding
          </a>
        </div>
      ) : isEditing ? (
        /* Edit Mode */
        <div className="space-y-6 animate-fade-up delay-100">
          {/* Working On */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <label className="block text-sm font-medium text-[var(--espresso)] mb-2">
              What are you working on?
            </label>
            <Textarea
              value={formData.workingOn}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, workingOn: e.target.value }))
              }
              placeholder="I'm building/exploring/researching..."
              className="min-h-[100px] rounded-xl"
            />
          </div>

          {/* Skills */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <label className="block text-sm font-medium text-[var(--espresso)] mb-2">
              Skills ({formData.skills.length}/10)
            </label>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill) => (
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
            )}
            <div className="flex gap-2 mb-4">
              <Input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                placeholder="Add a custom skill..."
                className="rounded-xl"
              />
              <Button
                variant="outline"
                onClick={addCustomSkill}
                disabled={!customSkill.trim() || formData.skills.length >= 10}
                className="rounded-xl"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.filter((s) => !formData.skills.includes(s)).slice(0, 15).map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  disabled={formData.skills.length >= 10}
                  className="px-3 py-1.5 rounded-full text-sm bg-white border border-[var(--border)] text-[var(--espresso)] hover:border-[var(--terracotta)] disabled:opacity-50"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Seeking */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <label className="block text-sm font-medium text-[var(--espresso)] mb-2">
              Who would you love to meet?
            </label>
            <Textarea
              value={formData.seeking}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, seeking: e.target.value }))
              }
              placeholder="I'm looking for people who..."
              className="min-h-[100px] rounded-xl"
            />
          </div>

          {/* Location */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <label className="block text-sm font-medium text-[var(--espresso)] mb-2">
              Where are you based?
            </label>
            <Input
              value={formData.currentLocation}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currentLocation: e.target.value }))
              }
              placeholder="e.g., Singapore, Network School Campus"
              className="rounded-xl"
            />
          </div>

          {/* Upcoming Travel */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <label className="block text-sm font-medium text-[var(--espresso)] mb-2">
              Upcoming travel or events
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                value={travelInput}
                onChange={(e) => setTravelInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTravel())}
                placeholder="e.g., Token2049 Singapore, Feb 15-20"
                className="rounded-xl"
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
            {formData.upcomingTravel.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.upcomingTravel.map((item, i) => (
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
          </div>

          {/* Open To */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <label className="block text-sm font-medium text-[var(--espresso)] mb-3">
              Open to
            </label>
            <div className="grid gap-2">
              {OPEN_TO_OPTIONS.map((option) => {
                const isSelected = formData.openTo.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleOpenTo(option.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-[var(--terracotta)] bg-[var(--terracotta)]/5"
                        : "border-[var(--border)] hover:border-[var(--terracotta)]/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-[var(--terracotta)] bg-[var(--terracotta)]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--espresso)] text-sm">{option.label}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="text-[var(--muted-foreground)]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateContext.isPending}
              className="btn-primary px-8 rounded-xl"
            >
              {updateContext.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-4 animate-fade-up delay-100">
          {/* Working On */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
              Working on
            </p>
            <p className="text-[var(--espresso)]">{context.workingOn}</p>
          </div>

          {/* Skills */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {context.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-full bg-[var(--sage)]/20 text-sm text-[var(--espresso)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Seeking */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
              Looking for
            </p>
            <p className="text-[var(--espresso)]">{context.seeking}</p>
          </div>

          {/* Location & Travel */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <span>📍</span>
              <span className="text-[var(--espresso)] font-medium">
                {context.currentLocation}
              </span>
            </div>
            {context.upcomingTravel && context.upcomingTravel.length > 0 && (
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  Upcoming travel
                </p>
                <div className="flex flex-wrap gap-2">
                  {context.upcomingTravel.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-[var(--amber)]/20 text-sm text-[var(--espresso)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Open To */}
          <div className="p-6 rounded-2xl bg-white border border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--muted-foreground)] mb-3">
              Open to
            </p>
            <div className="flex flex-wrap gap-2">
              {context.openTo.map((value) => (
                <span
                  key={value}
                  className="px-3 py-1.5 rounded-full bg-[var(--terracotta)]/10 text-sm text-[var(--espresso)]"
                >
                  {getOpenToLabel(value)}
                </span>
              ))}
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="p-6 rounded-2xl bg-[var(--sage)]/10 border border-[var(--sage)]/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[var(--espresso)]">
                Profile completeness
              </p>
              <span className="text-sm font-semibold text-[var(--terracotta)]">
                {Math.round((context.completeness || 0) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--terracotta)] to-[var(--terracotta-light)] rounded-full transition-all"
                style={{ width: `${(context.completeness || 0) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
