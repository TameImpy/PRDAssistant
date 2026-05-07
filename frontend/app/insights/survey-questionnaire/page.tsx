"use client";

import { AuthGate } from "@/components/AuthGate";
import { SurveyIntakeForm, SurveyFormData } from "@/components/SurveyIntakeForm";
import Link from "next/link";
import { useState } from "react";

export default function SurveyQuestionnairePage() {
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(data: SurveyFormData) {
    setIsLoading(true);
    // Generation logic will be wired up in issue 3
    console.log("Form submitted:", data);
    setIsLoading(false);
  }

  return (
    <AuthGate>
      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              href="/insights"
              className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-black mb-4 inline-block"
            >
              ← INSIGHTS_TOOLS
            </Link>
            <h1 className="font-headline font-black text-4xl uppercase tracking-tighter mt-4">
              SURVEY_QUESTIONNAIRE
            </h1>
            <p className="font-body text-on-surface-variant mt-2">
              Generate a structured survey questionnaire from your brief and research inputs.
            </p>
          </div>

          <SurveyIntakeForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </section>
    </AuthGate>
  );
}
