"use client";

import { useState, useRef } from "react";
import { parseFile, validateSurveyFile } from "@/lib/context-upload";

type UploadedFile = {
  name: string;
  text: string;
};

export type SurveyFormData = {
  researchGoal: string;
  researchAreas: string;
  minQuestions: string;
  maxQuestions: string;
  briefFiles: UploadedFile[];
  previousQuestionnairesFiles: UploadedFile[];
  brandGuidelinesFiles: UploadedFile[];
  exampleQuestions: string;
  newWave: "yes" | "no";
};

const MAX_FILES = 3;

const emptyForm = (): SurveyFormData => ({
  researchGoal: "",
  researchAreas: "",
  minQuestions: "",
  maxQuestions: "",
  briefFiles: [],
  previousQuestionnairesFiles: [],
  brandGuidelinesFiles: [],
  exampleQuestions: "",
  newWave: "no",
});

type MultiFileFieldProps = {
  label: string;
  files: UploadedFile[];
  error: string;
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

function MultiFileUploadField({ label, files = [], error, onAdd, onRemove, inputRef }: MultiFileFieldProps) {
  const atMax = files.length >= MAX_FILES;

  return (
    <div className="flex flex-col gap-2">
      <label className="font-label text-xs font-black uppercase tracking-widest">{label}</label>

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between border-2 border-black px-4 py-2 bg-surface-container-lowest">
              <span className="font-label text-xs font-bold uppercase tracking-widest truncate">✓ {f.name}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="font-label text-xs font-black uppercase tracking-widest ml-4 hover:text-red-600 shrink-0"
              >
                REMOVE ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button — hidden when at max */}
      {!atMax && (
        <div
          className="border-4 border-black p-4 bg-surface-container-lowest cursor-pointer hover:bg-primary-container transition-colors flex items-center justify-between gap-4"
          onClick={() => inputRef.current?.click()}
        >
          <span className="font-body text-sm text-on-surface-variant">
            {files.length === 0 ? "Click to upload PDF or DOCX" : `Add another file (${files.length}/${MAX_FILES})`}
          </span>
          <span className="font-label text-xs font-black uppercase tracking-widest shrink-0">UPLOAD</span>
        </div>
      )}
      {atMax && (
        <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Maximum {MAX_FILES} files reached.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAdd(file);
        }}
      />

      {error && (
        <p className="font-label text-xs font-bold uppercase tracking-widest text-red-600">{error}</p>
      )}
    </div>
  );
}

type Props = {
  onSubmit: (data: SurveyFormData) => void;
  isLoading: boolean;
};

export function SurveyIntakeForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<SurveyFormData>(emptyForm());
  const [fileErrors, setFileErrors] = useState({ brief: "", previousQuestionnaires: "", brandGuidelines: "" });
  const [noInputError, setNoInputError] = useState(false);

  const briefRef = useRef<HTMLInputElement>(null);
  const prevRef = useRef<HTMLInputElement>(null);
  const brandRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof SurveyFormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setNoInputError(false);
  };

  async function handleAddFile(
    file: File,
    filesField: "briefFiles" | "previousQuestionnairesFiles" | "brandGuidelinesFiles",
    errorKey: keyof typeof fileErrors
  ) {
    const validation = validateSurveyFile(file);
    if (!validation.valid) {
      setFileErrors((e) => ({ ...e, [errorKey]: validation.error! }));
      return;
    }
    setFileErrors((e) => ({ ...e, [errorKey]: "" }));
    try {
      const text = await parseFile(file);
      setForm((f) => ({
        ...f,
        [filesField]: [...f[filesField], { name: file.name, text }],
      }));
    } catch {
      setFileErrors((e) => ({ ...e, [errorKey]: "Could not read file — it may be corrupt or password-protected." }));
    }
  }

  function handleRemoveFile(
    filesField: "briefFiles" | "previousQuestionnairesFiles" | "brandGuidelinesFiles",
    index: number
  ) {
    setForm((f) => ({
      ...f,
      [filesField]: f[filesField].filter((_, i) => i !== index),
    }));
  }

  function handleSubmit() {
    const hasAnyInput =
      form.researchGoal.trim() ||
      form.researchAreas.trim() ||
      form.briefFiles.length > 0 ||
      form.previousQuestionnairesFiles.length > 0 ||
      form.brandGuidelinesFiles.length > 0 ||
      form.exampleQuestions.trim();

    if (!hasAnyInput) {
      setNoInputError(true);
      return;
    }
    onSubmit(form);
  }

  const showNewWaveWarning = form.newWave === "yes" && form.previousQuestionnairesFiles.length === 0;

  return (
    <div className="flex flex-col gap-8">

      {/* Research goal */}
      <div className="flex flex-col gap-2">
        <label className="font-label text-xs font-black uppercase tracking-widest">Research Goal</label>
        <textarea
          rows={3}
          placeholder="What is the main objective of this survey? What do you want to learn?"
          value={form.researchGoal}
          onChange={(e) => set("researchGoal", e.target.value)}
          className="border-4 border-black p-4 font-body text-sm bg-surface-container-lowest resize-none focus:outline-none focus:bg-primary-container transition-colors"
        />
      </div>

      {/* Research areas */}
      <div className="flex flex-col gap-2">
        <label className="font-label text-xs font-black uppercase tracking-widest">Research Areas to Include</label>
        <textarea
          rows={3}
          placeholder="Which topics, themes, or areas should the survey cover?"
          value={form.researchAreas}
          onChange={(e) => set("researchAreas", e.target.value)}
          className="border-4 border-black p-4 font-body text-sm bg-surface-container-lowest resize-none focus:outline-none focus:bg-primary-container transition-colors"
        />
      </div>

      {/* Question count */}
      <div className="flex flex-col gap-2">
        <label className="font-label text-xs font-black uppercase tracking-widest">Question Count</label>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Min</span>
            <input
              type="number"
              min={1}
              placeholder="e.g. 10"
              value={form.minQuestions}
              onChange={(e) => set("minQuestions", e.target.value)}
              className="border-4 border-black p-4 font-body text-sm bg-surface-container-lowest focus:outline-none focus:bg-primary-container transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Max</span>
            <input
              type="number"
              min={1}
              placeholder="e.g. 20"
              value={form.maxQuestions}
              onChange={(e) => set("maxQuestions", e.target.value)}
              className="border-4 border-black p-4 font-body text-sm bg-surface-container-lowest focus:outline-none focus:bg-primary-container transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Brief upload */}
      <MultiFileUploadField
        label="Brief / Proposal / Notes"
        files={form.briefFiles}
        error={fileErrors.brief}
        inputRef={briefRef}
        onAdd={(f) => handleAddFile(f, "briefFiles", "brief")}
        onRemove={(i) => handleRemoveFile("briefFiles", i)}
      />

      {/* Previous questionnaires upload */}
      <MultiFileUploadField
        label="Previous Questionnaires"
        files={form.previousQuestionnairesFiles}
        error={fileErrors.previousQuestionnaires}
        inputRef={prevRef}
        onAdd={(f) => handleAddFile(f, "previousQuestionnairesFiles", "previousQuestionnaires")}
        onRemove={(i) => handleRemoveFile("previousQuestionnairesFiles", i)}
      />

      {/* Brand guidelines upload */}
      <MultiFileUploadField
        label="Brand Guidelines"
        files={form.brandGuidelinesFiles}
        error={fileErrors.brandGuidelines}
        inputRef={brandRef}
        onAdd={(f) => handleAddFile(f, "brandGuidelinesFiles", "brandGuidelines")}
        onRemove={(i) => handleRemoveFile("brandGuidelinesFiles", i)}
      />

      {/* Example questions */}
      <div className="flex flex-col gap-2">
        <label className="font-label text-xs font-black uppercase tracking-widest">Example Questions</label>
        <textarea
          rows={4}
          placeholder="Paste any example questions you'd like to include or use as inspiration."
          value={form.exampleQuestions}
          onChange={(e) => set("exampleQuestions", e.target.value)}
          className="border-4 border-black p-4 font-body text-sm bg-surface-container-lowest resize-none focus:outline-none focus:bg-primary-container transition-colors"
        />
      </div>

      {/* New wave toggle */}
      <div className="flex flex-col gap-2">
        <label className="font-label text-xs font-black uppercase tracking-widest">New Wave of Existing Survey?</label>
        <div className="flex gap-0">
          <button
            type="button"
            onClick={() => set("newWave", "yes")}
            className={`px-8 py-4 border-4 border-black font-headline font-black uppercase tracking-widest text-sm transition-colors ${
              form.newWave === "yes" ? "bg-black text-white" : "bg-surface-container-lowest hover:bg-primary-container"
            }`}
          >
            YES
          </button>
          <button
            type="button"
            onClick={() => set("newWave", "no")}
            className={`px-8 py-4 border-4 border-l-0 border-black font-headline font-black uppercase tracking-widest text-sm transition-colors ${
              form.newWave === "no" ? "bg-black text-white" : "bg-surface-container-lowest hover:bg-primary-container"
            }`}
          >
            NO
          </button>
        </div>
        {showNewWaveWarning && (
          <p className="font-label text-xs font-bold uppercase tracking-widest text-amber-600 border-l-4 border-amber-600 pl-3">
            Warning: New wave selected but no previous questionnaire uploaded. Consider uploading one for better results.
          </p>
        )}
      </div>

      {/* No input error */}
      {noInputError && (
        <div className="border-4 border-black bg-primary-container p-4">
          <p className="font-label text-xs font-black uppercase tracking-widest">
            Please add at least a research goal before generating.
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="bg-black text-white px-10 py-5 border-4 border-black font-headline font-black uppercase tracking-widest text-lg hover:bg-primary-container hover:text-black transition-colors transform hover:-translate-x-1 hover:-translate-y-1 neo-brutalist-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? "GENERATING..." : "GENERATE_QUESTIONNAIRE →"}
      </button>
    </div>
  );
}
