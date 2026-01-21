/**
 * Onboarding Index - Redirects to first step
 */

import { redirect } from "next/navigation";

export default function OnboardingPage() {
  redirect("/onboarding/welcome");
}
