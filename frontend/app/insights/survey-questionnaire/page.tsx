"use client";

import { AuthGate } from "@/components/AuthGate";
import { SurveyIntakeForm, SurveyFormData } from "@/components/SurveyIntakeForm";
import { SurveyPreview } from "@/components/SurveyPreview";
import Link from "next/link";
import { useState } from "react";
import type { ParsedQuestionnaire } from "@/lib/survey-parser";

function safeInt(val: string): number | undefined {
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

export default function SurveyQuestionnairePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<ParsedQuestionnaire | null>(null);
  const [error, setError] = useState("");
  const [qaStatus, setQaStatus] = useState<"ok" | "network_error" | "parse_error" | null>(null);
  const [formData, setFormData] = useState<SurveyFormData | null>(null);

  async function handleSubmit(data: SurveyFormData) {
    setIsLoading(true);
    setError("");
    setQuestionnaire(null);
    setQaStatus(null);
    setFormData(data);

    try {
      const res = await fetch("/api/insights/survey-questionnaire/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let json: { questionnaire?: ParsedQuestionnaire; qaSkipped?: boolean; error?: string };
      try {
        json = await res.json();
      } catch {
        throw new Error("The server returned an unreadable response. Please try again.");
      }

      if (!res.ok) {
        throw new Error(json.error || "Generation failed. Please try again.");
      }

      setQuestionnaire(json.questionnaire!);
      setQaStatus(json.qaStatus ?? "ok");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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

          {/* QA status warnings */}
          {qaStatus === "network_error" && questionnaire && !isLoading && (
            <div className="border-4 border-amber-500 bg-amber-50 p-4 mb-6">
              <p className="font-label text-xs font-black uppercase tracking-widest text-amber-700">
                Note: The QA review could not run due to a service error — showing the unreviewed draft.
              </p>
            </div>
          )}
          {qaStatus === "parse_error" && questionnaire && !isLoading && (
            <div className="border-4 border-amber-500 bg-amber-50 p-4 mb-6">
              <p className="font-label text-xs font-black uppercase tracking-widest text-amber-700">
                Note: The QA review returned an unexpected result — showing the original draft instead.
              </p>
            </div>
          )}

          {/* Preview panel */}
          {questionnaire && !isLoading && (
            <div className="mb-12">
              <SurveyPreview
                questionnaire={questionnaire}
                minQuestions={safeInt(formData?.minQuestions ?? "")}
                maxQuestions={safeInt(formData?.maxQuestions ?? "")}
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
