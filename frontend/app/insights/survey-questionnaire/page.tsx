"use client";

import { AuthGate } from "@/components/AuthGate";
import { SurveyIntakeForm, SurveyFormData } from "@/components/SurveyIntakeForm";
import { SurveyEditor } from "@/components/SurveyEditor";
import Link from "next/link";
import { useState, useRef } from "react";
import type { ParsedQuestionnaire } from "@/lib/survey-parser";
import { generateQuestionnaireDOCX } from "@/lib/survey-docx";

function safeInt(val: string): number | undefined {
  const n = parseInt(val, 10);
  return isNaN(n) ? undefined : n;
}

const MOCK_QUESTIONNAIRE: ParsedQuestionnaire = {
  intro: "Thank you for taking part in this survey! It should take around 5 minutes to complete. Your answers are anonymous and will help shape our editorial strategy.",
  questions: [
    {
      id: "Q1",
      base: "ASK ALL",
      questionType: "SINGLE SELECT",
      questionText: "How often do you read online news articles?",
      answerOptions: [
        { text: "Every day", routing: null },
        { text: "Several times a week", routing: null },
        { text: "Once a week", routing: null },
        { text: "Less than once a week", routing: "SKIP TO Q3" },
        { text: "Never", routing: "SKIP TO Q3" },
      ],
      isTracker: false,
    },
    {
      id: "Q2",
      base: "ASK IF Q1 = Every day OR Several times a week",
      questionType: "MULTI SELECT",
      questionText: "Which of the following topics do you read about most often? Select all that apply.",
      answerOptions: [
        { text: "Politics and current affairs", routing: null },
        { text: "Entertainment and celebrity", routing: null },
        { text: "Sport", routing: null },
        { text: "Health and wellbeing", routing: null },
        { text: "Technology", routing: null },
        { text: "None of the above", routing: null },
      ],
      isTracker: false,
    },
    {
      id: "Q3",
      base: "ASK ALL",
      questionType: "SINGLE SELECT",
      questionText: "How likely are you to pay for an online news subscription? [TRACKER]",
      answerOptions: [
        { text: "Very likely", routing: null },
        { text: "Fairly likely", routing: null },
        { text: "Not very likely", routing: null },
        { text: "Not at all likely", routing: null },
      ],
      isTracker: true,
    },
    {
      id: "Q4",
      base: "ASK ALL",
      questionType: "TEXTBOX",
      questionText: "Is there anything else you would like to tell us about your news reading habits?",
      answerOptions: [],
      isTracker: false,
    },
  ],
};

export default function SurveyQuestionnairePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<ParsedQuestionnaire | null>(null);
  const [error, setError] = useState("");
  const [qaStatus, setQaStatus] = useState<"ok" | "network_error" | "parse_error" | null>(null);
  const [formData, setFormData] = useState<SurveyFormData | null>(null);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [showRegenerateChoice, setShowRegenerateChoice] = useState(false);
  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [addInstruction, setAddInstruction] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`).current;

  function handleRegenerateClick() {
    if (!window.confirm("Regenerating will replace your current questionnaire and lose any edits. Continue?")) return;
    setShowAddQuestions(false);
    setShowRegenerateChoice(true);
  }

  async function handleAddQuestions() {
    if (!addInstruction.trim() || !questionnaire) return;
    setIsAdding(true);
    setAddError("");
    try {
      const res = await fetch("/api/insights/survey-questionnaire/extend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionnaire, instruction: addInstruction }),
      });
      let json: { questions?: ParsedQuestionnaire["questions"]; error?: string };
      try { json = await res.json(); } catch {
        throw new Error("The server returned an unreadable response. Please try again.");
      }
      if (!res.ok) throw new Error(json.error || "Failed to generate questions. Please try again.");
      if (!json.questions?.length) throw new Error("No questions were returned. Please try again.");

      const nextNum = questionnaire.questions.length + 1;
      const renumbered = json.questions.map((q, i) => ({ ...q, id: `Q${nextNum + i}` }));
      setQuestionnaire({ ...questionnaire, questions: [...questionnaire.questions, ...renumbered] });
      setEditorKey((k) => k + 1);
      setAddInstruction("");
      setShowAddQuestions(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleSubmit(data: SurveyFormData) {
    setShowRegenerateForm(false);
    setShowRegenerateChoice(false);
    setIsLoading(true);
    setError("");
    const previousQuestionnaire = questionnaire;
    setQuestionnaire(null);
    setQaStatus(null);
    setFormData(data);

    try {
      const res = await fetch("/api/insights/survey-questionnaire/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let json: { questionnaire?: ParsedQuestionnaire; qaStatus?: "ok" | "network_error" | "parse_error"; error?: string };
      try {
        json = await res.json();
      } catch {
        throw new Error("The server returned an unreadable response. Please try again.");
      }

      if (!res.ok) {
        throw new Error(json.error || "Generation failed. Please try again.");
      }

      if (!json.questionnaire) {
        throw new Error("Generation returned no questionnaire. Please try again.");
      }
      setQuestionnaire(json.questionnaire);
      setQaStatus(json.qaStatus ?? "ok");
    } catch (err) {
      setQuestionnaire(previousQuestionnaire);
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
            {process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true" && (
              <button
                onClick={() => { setQuestionnaire(MOCK_QUESTIONNAIRE); setQaStatus("ok"); }}
                className="mt-4 font-label text-xs font-black uppercase tracking-widest border-2 border-black px-4 py-2 hover:bg-primary-container transition-colors"
              >
                DEV: Load mock questionnaire
              </button>
            )}
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

          {/* Editor / preview panel */}
          {questionnaire && !isLoading && !showRegenerateChoice && !showRegenerateForm && (
            <div className="mb-12">
              <SurveyEditor
                key={editorKey}
                questionnaire={questionnaire}
                sessionId={sessionId}
                minQuestions={safeInt(formData?.minQuestions ?? "")}
                maxQuestions={safeInt(formData?.maxQuestions ?? "")}
                onChange={setQuestionnaire}
              />
            </div>
          )}

          {/* Initial form — shown before any questionnaire is generated */}
          {!questionnaire && !isLoading && (
            <SurveyIntakeForm onSubmit={handleSubmit} isLoading={isLoading} />
          )}

          {/* Actions — shown after questionnaire is generated */}
          {questionnaire && !isLoading && (
            <div className="mt-12 border-t-4 border-black pt-12 flex flex-col gap-6">

              {/* Three action buttons */}
              {!showRegenerateForm && !showRegenerateChoice && !showAddQuestions && (
                <div className="flex gap-4">
                  <button
                    onClick={() => generateQuestionnaireDOCX(questionnaire)}
                    className="flex-1 border-4 border-black px-6 py-5 font-headline font-black uppercase tracking-widest text-sm bg-black text-white hover:bg-primary-container hover:text-black transition-colors transform hover:-translate-x-1 hover:-translate-y-1 neo-brutalist-shadow"
                  >
                    ↓ DOWNLOAD .DOCX
                  </button>
                  <button
                    onClick={() => setShowAddQuestions(true)}
                    className="flex-1 border-4 border-black px-6 py-5 font-headline font-black uppercase tracking-widest text-sm bg-surface-container-lowest hover:bg-primary-container transition-colors transform hover:-translate-x-1 hover:-translate-y-1 neo-brutalist-shadow"
                  >
                    + ADD ADDITIONAL AI QUESTIONS
                  </button>
                  <button
                    onClick={handleRegenerateClick}
                    className="flex-1 border-4 border-black px-6 py-5 font-headline font-black uppercase tracking-widest text-sm bg-surface-container-lowest hover:bg-primary-container transition-colors transform hover:-translate-x-1 hover:-translate-y-1 neo-brutalist-shadow"
                  >
                    REGENERATE COMPLETELY →
                  </button>
                </div>
              )}

              {/* Add questions panel */}
              {showAddQuestions && (
                <div className="flex flex-col gap-4 border-4 border-black p-6 bg-surface-container-lowest">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline font-black text-xl uppercase tracking-tighter">Add Additional AI Questions</h2>
                    <button
                      onClick={() => { setShowAddQuestions(false); setAddInstruction(""); setAddError(""); }}
                      className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-black transition-colors"
                    >
                      ✕ CANCEL
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="What should the new questions cover? e.g. Add 3 questions about social media news habits"
                    value={addInstruction}
                    onChange={(e) => setAddInstruction(e.target.value)}
                    className="border-4 border-black p-4 font-body text-sm bg-white resize-none focus:outline-none focus:bg-primary-container transition-colors"
                  />
                  {addError && (
                    <p className="font-label text-xs font-bold uppercase tracking-widest text-red-600">{addError}</p>
                  )}
                  <button
                    onClick={handleAddQuestions}
                    disabled={isAdding || !addInstruction.trim()}
                    className="bg-black text-white px-8 py-4 border-4 border-black font-headline font-black uppercase tracking-widest text-sm hover:bg-primary-container hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding ? "GENERATING..." : "ADD QUESTIONS →"}
                  </button>
                </div>
              )}

              {/* Regenerate — choice step */}
              {showRegenerateChoice && !showRegenerateForm && (
                <div className="flex flex-col gap-4 border-4 border-black p-6 bg-surface-container-lowest">
                  <div className="flex items-center justify-between">
                    <p className="font-headline font-black text-lg uppercase tracking-tighter">Do you want to change your inputs?</p>
                    <button
                      onClick={() => setShowRegenerateChoice(false)}
                      className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-black transition-colors"
                    >
                      ✕ CANCEL
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => { setShowRegenerateChoice(false); setShowRegenerateForm(true); }}
                      className="flex-1 border-4 border-black px-6 py-4 font-headline font-black uppercase tracking-widest text-sm bg-black text-white hover:bg-primary-container hover:text-black transition-colors"
                    >
                      CHANGE INPUTS
                    </button>
                    <button
                      onClick={() => { setShowRegenerateChoice(false); if (formData) handleSubmit(formData); }}
                      className="flex-1 border-4 border-black px-6 py-4 font-headline font-black uppercase tracking-widest text-sm bg-surface-container-lowest hover:bg-primary-container transition-colors"
                    >
                      USE SAME INPUT
                    </button>
                  </div>
                </div>
              )}

              {/* Regenerate — form step */}
              {showRegenerateForm && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline font-black text-xl uppercase tracking-tighter">Regenerate</h2>
                    <button
                      onClick={() => setShowRegenerateForm(false)}
                      className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-black transition-colors"
                    >
                      ✕ CANCEL
                    </button>
                  </div>
                  <SurveyIntakeForm onSubmit={handleSubmit} isLoading={isLoading} initialData={formData ?? undefined} />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}
