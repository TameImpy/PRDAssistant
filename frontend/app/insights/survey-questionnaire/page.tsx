"use client";

import { AuthGate } from "@/components/AuthGate";
import { SurveyIntakeForm, SurveyFormData } from "@/components/SurveyIntakeForm";
import { SurveyPreview } from "@/components/SurveyPreview";
import Link from "next/link";
import { useState } from "react";
import type { ParsedQuestionnaire } from "@/lib/survey-parser";

export default function SurveyQuestionnairePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<ParsedQuestionnaire | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<SurveyFormData | null>(null);

  async function handleSubmit(data: SurveyFormData) {
    setIsLoading(true);
    setError("");
    setQuestionnaire(null);
    setFormData(data);

    try {
      const res = await fetch("/api/insights/survey-questionnaire/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Generation failed");

      const json = await res.json();
      setQuestionnaire(json.questionnaire);
    } catch {
      setError("Something went wrong generating the questionnaire. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

          {/* Loading state */}
          {isLoading && (
            <div className="border-4 border-black bg-primary-container p-8 text-center mb-8 neo-brutalist-shadow">
              <p className="font-headline font-black text-xl uppercase tracking-tighter">
                Generating your questionnaire — this may take a few minutes
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="w-3 h-3 bg-black inline-block animate-bounce [animation-delay:0ms]" />
                <span className="w-3 h-3 bg-black inline-block animate-bounce [animation-delay:150ms]" />
                <span className="w-3 h-3 bg-black inline-block animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border-4 border-black bg-surface-container-lowest p-6 mb-8">
              <p className="font-label text-xs font-black uppercase tracking-widest text-red-600">{error}</p>
            </div>
          )}

          {/* Preview panel */}
          {questionnaire && !isLoading && (
            <div className="mb-12">
              <SurveyPreview
                questionnaire={questionnaire}
                minQuestions={formData?.minQuestions ? parseInt(formData.minQuestions) : undefined}
                maxQuestions={formData?.maxQuestions ? parseInt(formData.maxQuestions) : undefined}
              />
            </div>
          )}

          {/* Form — always mounted to preserve inputs */}
          <div className={`${questionnaire ? "mt-12 border-t-4 border-black pt-12" : ""} ${isLoading ? "hidden" : ""}`}>
            {questionnaire && (
              <h2 className="font-headline font-black text-xl uppercase tracking-tighter mb-6">
                Regenerate
              </h2>
            )}
            <SurveyIntakeForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
