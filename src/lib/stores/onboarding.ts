/**
 * Onboarding State Management with Zustand
 * Persists onboarding progress across page navigation
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingData {
  workingOn: string;
  skills: string[];
  seeking: string;
  bio: string;
  currentLocation: string;
  upcomingTravel: string[];
  openTo: string[];
}

interface OnboardingState {
  // Current step (1-6)
  step: number;

  // Onboarding data
  data: OnboardingData;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  workingOn: "",
  skills: [],
  seeking: "",
  bio: "",
  currentLocation: "",
  upcomingTravel: [],
  openTo: [],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      data: initialData,

      setStep: (step) => set({ step }),

      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 6) })),

      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

      updateData: (partial) =>
        set((state) => ({
          data: { ...state.data, ...partial },
        })),

      reset: () => set({ step: 1, data: initialData }),
    }),
    {
      name: "serendipity-onboarding",
    }
  )
);

// Step configuration
export const ONBOARDING_STEPS = [
  { id: 1, name: "Welcome", path: "/onboarding/welcome" },
  { id: 2, name: "Working On", path: "/onboarding/working-on" },
  { id: 3, name: "Skills", path: "/onboarding/skills" },
  { id: 4, name: "Seeking", path: "/onboarding/seeking" },
  { id: 5, name: "Preferences", path: "/onboarding/preferences" },
  { id: 6, name: "Complete", path: "/onboarding/complete" },
] as const;

// OpenTo options
export const OPEN_TO_OPTIONS = [
  { value: "collaborations", label: "Collaborations", description: "Work together on projects" },
  { value: "advice", label: "Advice", description: "Get or give guidance" },
  { value: "mentorship", label: "Mentorship", description: "Long-term guidance relationship" },
  { value: "cofounding", label: "Co-founding", description: "Start something together" },
  { value: "hiring", label: "Hiring", description: "Find or become a team member" },
  { value: "investment", label: "Investment", description: "Funding opportunities" },
  { value: "friendship", label: "Friendship", description: "Just good conversations" },
] as const;

// Suggested skills
export const SUGGESTED_SKILLS = [
  "Product", "Engineering", "Design", "Marketing", "Sales",
  "AI/ML", "Web3", "Crypto", "DeFi", "NFTs",
  "Mobile", "Backend", "Frontend", "DevOps", "Data",
  "Growth", "Community", "Content", "Strategy", "Operations",
  "Fundraising", "Legal", "Finance", "HR", "Recruiting",
] as const;
