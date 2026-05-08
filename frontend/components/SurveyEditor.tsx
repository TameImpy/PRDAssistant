"use client";

import { useState } from "react";
import type { ParsedQuestionnaire, SurveyQuestion, AnswerOption } from "@/lib/survey-parser";
import type { EditLogEntry } from "@/app/api/insights/log/route";

const QUESTION_TYPES = ["SINGLE SELECT", "MULTI SELECT", "TEXTBOX"];

type Props = {
  questionnaire: ParsedQuestionnaire;
  sessionId: string;
  minQuestions?: number;
  maxQuestions?: number;
  onChange: (updated: ParsedQuestionnaire) => void;
};

async function logEdit(entry: EditLogEntry) {
  try {
    await fetch("/api/insights/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch {
    // Non-fatal — never block the editor
  }
}

function nextQuestionId(questions: SurveyQuestion[]): string {
  const nums = questions
    .map((q) => parseInt(q.id.replace("Q", ""), 10))
    .filter((n) => !isNaN(n));
  return `Q${nums.length > 0 ? Math.max(...nums) + 1 : questions.length + 1}`;
}

function renumber(
  questions: SurveyQuestion[],
  savedOpts: Record<string, AnswerOption[]>
): { questions: SurveyQuestion[]; savedOptions: Record<string, AnswerOption[]> } {
  const newQuestions = questions.map((q, i) => ({ ...q, id: `Q${i + 1}` }));
  const newSavedOptions: Record<string, AnswerOption[]> = {};
  questions.forEach((q, i) => {
    if (savedOpts[q.id]) newSavedOptions[`Q${i + 1}`] = savedOpts[q.id];
  });
  return { questions: newQuestions, savedOptions: newSavedOptions };
}

export function SurveyEditor({ questionnaire, sessionId, minQuestions, maxQuestions, onChange }: Props) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>(questionnaire.questions);

  const count = questions.length;
  const outOfRange =
    (minQuestions !== undefined && count < minQuestions) ||
    (maxQuestions !== undefined && count > maxQuestions);

  function update(updated: SurveyQuestion[]) {
    setQuestions(updated);
    onChange({ ...questionnaire, questions: updated });
  }

  // Edit question text
  function handleEditQuestionText(index: number, newText: string) {
    const q = questions[index];
    logEdit({
      session_id: sessionId,
      question_id: q.id,
      original_text: q.questionText,
      edited_text: newText,
      edit_type: "question_text",
    });
    const updated = questions.map((q, i) =>
      i === index ? { ...q, questionText: newText } : q
    );
    update(updated);
  }

  // Edit answer option text
  function handleEditAnswerOption(qIndex: number, optIndex: number, newText: string) {
    const q = questions[qIndex];
    const original = q.answerOptions[optIndex].text;
    logEdit({
      session_id: sessionId,
      question_id: q.id,
      original_text: original,
      edited_text: newText,
      edit_type: "answer_option",
    });
    const updated = questions.map((q, i) =>
      i === qIndex
        ? {
            ...q,
            answerOptions: q.answerOptions.map((opt, j) =>
              j === optIndex ? { ...opt, text: newText } : opt
            ),
          }
        : q
    );
    update(updated);
  }

  // Edit routing on an answer option
  function handleEditRouting(qIndex: number, optIndex: number, newRouting: string) {
    const updated = questions.map((q, i) =>
      i === qIndex
        ? {
            ...q,
            answerOptions: q.answerOptions.map((opt, j) =>
              j === optIndex ? { ...opt, routing: newRouting.trim() || null } : opt
            ),
          }
        : q
    );
    update(updated);
  }

  // Edit BASE label
  function handleEditBase(index: number, newBase: string) {
    const updated = questions.map((q, i) =>
      i === index ? { ...q, base: newBase } : q
    );
    update(updated);
  }

  // Add a new blank answer option
  function handleAddOption(qIndex: number) {
    const updated = questions.map((q, i) =>
      i === qIndex
        ? { ...q, answerOptions: [...q.answerOptions, { text: "New option", routing: null }] }
        : q
    );
    update(updated);
  }

  // Remove an answer option
  function handleRemoveOption(qIndex: number, optIndex: number) {
    const updated = questions.map((q, i) =>
      i === qIndex
        ? { ...q, answerOptions: q.answerOptions.filter((_, j) => j !== optIndex) }
        : q
    );
    update(updated);
  }

  // Stash answer options per question when switching to TEXTBOX so they can be restored
  const [savedOptions, setSavedOptions] = useState<Record<string, AnswerOption[]>>({});

  // Change question type — preserve options when switching to/from TEXTBOX
  function handleChangeType(index: number, newType: string) {
    const q = questions[index];
    logEdit({
      session_id: sessionId,
      question_id: q.id,
      original_text: q.questionType,
      edited_text: newType,
      edit_type: "question_type",
    });

    const isTextbox = newType === "TEXTBOX";
    const wasTextbox = q.questionType === "TEXTBOX";
    let answerOptions = q.answerOptions;

    if (isTextbox) {
      // Save current options before clearing
      setSavedOptions((prev) => ({ ...prev, [q.id]: q.answerOptions }));
      answerOptions = [];
    } else if (wasTextbox) {
      // Restore previously saved options, or fall back to defaults
      answerOptions = savedOptions[q.id] ?? [
        { text: "Option 1", routing: null },
        { text: "Option 2", routing: null },
      ];
    }

    const updated = questions.map((q, i) =>
      i === index ? { ...q, questionType: newType, answerOptions } : q
    );
    update(updated);
  }

  // Reorder up
  function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...questions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const { questions: renumbered, savedOptions: newSaved } = renumber(updated, savedOptions);
    setSavedOptions(newSaved);
    logEdit({
      session_id: sessionId,
      question_id: questions[index].id,
      original_text: `position ${index + 1}`,
      edited_text: `position ${index}`,
      edit_type: "reorder",
    });
    update(renumbered);
  }

  // Reorder down
  function handleMoveDown(index: number) {
    if (index === questions.length - 1) return;
    const updated = [...questions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const { questions: renumbered, savedOptions: newSaved } = renumber(updated, savedOptions);
    setSavedOptions(newSaved);
    logEdit({
      session_id: sessionId,
      question_id: questions[index].id,
      original_text: `position ${index + 1}`,
      edited_text: `position ${index + 2}`,
      edit_type: "reorder",
    });
    update(renumbered);
  }

  // Add question below current index
  function handleAddQuestion(afterIndex: number) {
    const newQ: SurveyQuestion = {
      id: nextQuestionId(questions),
      base: "ASK ALL",
      questionType: "SINGLE SELECT",
      questionText: "New question",
      answerOptions: [{ text: "Option 1", routing: null }],
      isTracker: false,
    };
    const updated = [
      ...questions.slice(0, afterIndex + 1),
      newQ,
      ...questions.slice(afterIndex + 1),
    ];
    const { questions: renumbered, savedOptions: newSaved } = renumber(updated, savedOptions);
    setSavedOptions(newSaved);
    logEdit({
      session_id: sessionId,
      question_id: newQ.id,
      original_text: "",
      edited_text: newQ.questionText,
      edit_type: "add_question",
    });
    update(renumbered);
  }

  // Delete question
  function handleDelete(index: number) {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    const q = questions[index];
    logEdit({
      session_id: sessionId,
      question_id: q.id,
      original_text: q.questionText,
      edited_text: "",
      edit_type: "delete_question",
    });
    const filtered = questions.filter((_, i) => i !== index);
    const { questions: renumbered, savedOptions: newSaved } = renumber(filtered, savedOptions);
    setSavedOptions(newSaved);
    update(renumbered);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-black pb-4">
        <h2 className="font-headline font-black text-2xl uppercase tracking-tighter">Preview</h2>
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
      {questions.map((q, qIndex) => (
        <div key={q.id} className="border-4 border-black bg-surface-container-lowest">

          {/* Question toolbar */}
          <div className="flex items-center justify-between border-b-2 border-black px-4 py-2 bg-black">
            <div className="flex items-center gap-2">
              <span className="font-label text-xs font-black text-white uppercase tracking-widest">{q.id}</span>
              {q.isTracker && (
                <span className="font-label text-xs font-black px-2 py-0.5 bg-[#00E0FF] text-black uppercase tracking-widest">
                  TRACKER
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMoveUp(qIndex)}
                disabled={qIndex === 0}
                className="font-label text-xs font-black text-white uppercase tracking-widest disabled:opacity-30 hover:text-primary transition-colors px-2"
              >
                ↑
              </button>
              <button
                onClick={() => handleMoveDown(qIndex)}
                disabled={qIndex === questions.length - 1}
                className="font-label text-xs font-black text-white uppercase tracking-widest disabled:opacity-30 hover:text-primary transition-colors px-2"
              >
                ↓
              </button>
              <button
                onClick={() => handleDelete(qIndex)}
                className="font-label text-xs font-black text-white uppercase tracking-widest hover:text-red-400 transition-colors px-2"
              >
                DELETE
              </button>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4">

            {/* BASE + QUESTION TYPE */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={q.base}
                onChange={(e) => handleEditBase(qIndex, e.target.value)}
                className="font-label text-xs font-black px-2 py-1 bg-black text-white uppercase tracking-widest border-2 border-black focus:outline-none focus:bg-primary-container focus:text-black transition-colors"
              />
              {/* Question type dropdown */}
              <select
                value={q.questionType}
                onChange={(e) => handleChangeType(qIndex, e.target.value)}
                className="font-label text-xs font-black px-2 py-1 border-2 border-black uppercase tracking-widest bg-surface-container-lowest focus:outline-none focus:bg-primary-container cursor-pointer"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Editable question text */}
            <textarea
              rows={2}
              value={q.questionText}
              onChange={(e) => handleEditQuestionText(qIndex, e.target.value)}
              className="font-headline font-black text-lg uppercase tracking-tighter border-2 border-transparent hover:border-black focus:border-black focus:outline-none p-2 bg-transparent resize-none transition-colors w-full focus:bg-primary-container"
            />

            {/* TEXTBOX — show open text placeholder */}
            {q.questionType === "TEXTBOX" && (
              <div className="border-2 border-dashed border-black p-4 bg-surface-container-lowest">
                <p className="font-body text-sm text-on-surface-variant italic">Open text response</p>
              </div>
            )}

            {/* SINGLE SELECT / MULTI SELECT — editable answer options */}
            {q.questionType !== "TEXTBOX" && (
              <div className="flex flex-col gap-1">
                <ul className="flex flex-col gap-1">
                  {q.answerOptions.map((opt, optIndex) => (
                    <li key={optIndex} className="flex flex-col gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 w-4 h-4 border-2 border-black inline-block" />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleEditAnswerOption(qIndex, optIndex, e.target.value)}
                          className="flex-1 font-body text-sm border-2 border-transparent hover:border-black focus:border-black focus:outline-none px-2 py-1 bg-transparent transition-colors focus:bg-primary-container"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIndex, optIndex)}
                          className="font-label text-xs font-black text-black/30 hover:text-red-600 transition-colors shrink-0"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-center gap-1 ml-6">
                        <span className="font-label text-xs font-black text-on-surface-variant uppercase tracking-widest shrink-0">→</span>
                        <input
                          type="text"
                          value={opt.routing ?? ""}
                          onChange={(e) => handleEditRouting(qIndex, optIndex, e.target.value)}
                          placeholder="e.g. SKIP TO Q5 / EXCLUSIVE / LOCK OPTION"
                          className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant border-2 border-transparent hover:border-black focus:border-black focus:outline-none px-2 py-0.5 bg-transparent transition-colors focus:bg-primary-container w-72 placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleAddOption(qIndex)}
                  className="font-label text-xs font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors text-left mt-1"
                >
                  + ADD OPTION
                </button>
              </div>
            )}
          </div>

          {/* Add question below */}
          <div className="border-t-2 border-black px-4 py-2 flex justify-center">
            <button
              onClick={() => handleAddQuestion(qIndex)}
              className="font-label text-xs font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
            >
              + ADD QUESTION BELOW
            </button>
          </div>
        </div>
      ))}

      {/* Add question at end if list is empty */}
      {questions.length === 0 && (
        <button
          onClick={() => handleAddQuestion(-1)}
          className="border-4 border-black p-6 font-label text-xs font-black uppercase tracking-widest hover:bg-primary-container transition-colors text-center"
        >
          + ADD QUESTION
        </button>
      )}
    </div>
  );
}
