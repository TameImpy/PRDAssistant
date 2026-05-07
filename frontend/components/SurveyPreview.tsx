"use client";

import type { ParsedQuestionnaire } from "@/lib/survey-parser";

type Props = {
  questionnaire: ParsedQuestionnaire;
  minQuestions?: number;
  maxQuestions?: number;
};

export function SurveyPreview({ questionnaire, minQuestions, maxQuestions }: Props) {
  const count = questionnaire.questions.length;
  const outOfRange =
    (minQuestions !== undefined && count < minQuestions) ||
    (maxQuestions !== undefined && count > maxQuestions);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <h2 className="font-headline font-black text-2xl uppercase tracking-tighter">
          Preview
        </h2>
        <span className="font-label text-xs font-black px-3 py-1 border-2 border-black bg-primary-container uppercase tracking-widest">
          DRAFT
        </span>
      </div>

      {/* Out of range warning */}
      {outOfRange && (
        <div className="border-4 border-amber-500 bg-amber-50 p-4">
          <p className="font-label text-xs font-black uppercase tracking-widest text-amber-700">
            Warning: {count} question{count !== 1 ? "s" : ""} generated
            {minQuestions !== undefined && maxQuestions !== undefined
              ? ` — target range was ${minQuestions}–${maxQuestions}`
              : minQuestions !== undefined
              ? ` — minimum was ${minQuestions}`
              : ` — maximum was ${maxQuestions}`}
          </p>
        </div>
      )}

      {/* Intro */}
      {questionnaire.intro && (
        <div className="border-4 border-black p-6 bg-surface-container-lowest">
          <p className="font-body text-sm whitespace-pre-wrap">{questionnaire.intro}</p>
        </div>
      )}

      {/* Questions */}
      {questionnaire.questions.map((q, i) => (
        <div key={q.id} className="border-4 border-black p-6 flex flex-col gap-3 bg-surface-container-lowest">

          {/* BASE + QUESTION TYPE */}
          <div className="flex flex-wrap gap-2">
            <span className="font-label text-xs font-black px-2 py-1 bg-black text-white uppercase tracking-widest">
              {q.base}
            </span>
            <span className="font-label text-xs font-black px-2 py-1 border-2 border-black uppercase tracking-widest">
              {q.questionType}
            </span>
            {q.isTracker && (
              <span className="font-label text-xs font-black px-2 py-1 border-2 border-black bg-[#00E0FF] uppercase tracking-widest">
                TRACKER
              </span>
            )}
          </div>

          {/* Question text */}
          <p className="font-headline font-black text-lg uppercase tracking-tighter">
            {q.id}. {q.questionText}
          </p>

          {/* Answer options */}
          {q.answerOptions.length > 0 && (
            <ul className="flex flex-col gap-1 mt-1">
              {q.answerOptions.map((opt, j) => (
                <li key={j} className="flex items-start gap-2 font-body text-sm">
                  <span className="shrink-0 mt-0.5 w-4 h-4 border-2 border-black inline-block" />
                  <span>
                    {opt.text}
                    {opt.routing && (
                      <span className="ml-2 font-label text-xs font-black uppercase tracking-widest text-on-surface-variant">
                        → {opt.routing}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
