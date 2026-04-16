"use client";

import { useState, useRef } from "react";
import {
  validateFile,
  validateItemCount,
  validateTotalSize,
  parseFile,
  type ContextItem,
  type ContextSourceType,
} from "@/lib/context-upload";

const SOURCE_TYPES: ContextSourceType[] = [
  "Call/Meeting Transcript",
  "Email Thread",
  "Teams Chat",
];

type ContextUploadProps = {
  items: ContextItem[];
  onChange: (items: ContextItem[]) => void;
};

export function ContextUpload({ items, onChange }: ContextUploadProps) {
  const [selectedType, setSelectedType] = useState<ContextSourceType | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearError() {
    setError(null);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;

    clearError();

    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      setError(fileValidation.error!);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const countValidation = validateItemCount(items);
    if (!countValidation.valid) {
      setError(countValidation.error!);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsProcessing(true);
    try {
      const text = await parseFile(file);

      const sizeValidation = validateTotalSize(items, text);
      if (!sizeValidation.valid) {
        setError(sizeValidation.error!);
        return;
      }

      const newItem: ContextItem = {
        id: crypto.randomUUID(),
        label: selectedType,
        text,
        fileName: file.name,
        fileSize: file.size,
      };

      onChange([...items, newItem]);
      setSelectedType(null);
    } catch (err) {
      setError("Failed to read file. Please try again.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handlePasteAdd() {
    if (!pasteText.trim() || !selectedType) return;

    clearError();

    const countValidation = validateItemCount(items);
    if (!countValidation.valid) {
      setError(countValidation.error!);
      return;
    }

    const sizeValidation = validateTotalSize(items, pasteText);
    if (!sizeValidation.valid) {
      setError(sizeValidation.error!);
      return;
    }

    const newItem: ContextItem = {
      id: crypto.randomUUID(),
      label: selectedType,
      text: pasteText.trim(),
    };

    onChange([...items, newItem]);
    setPasteText("");
    setShowPaste(false);
    setSelectedType(null);
  }

  function handleRemove(id: string) {
    onChange(items.filter((item) => item.id !== id));
    clearError();
  }

  const atLimit = items.length >= 5;

  return (
    <div className="mt-8 border-t-4 border-black pt-8">
      <div className="flex items-center justify-between mb-4">
        <span className="font-label text-xs font-black px-2 py-1 bg-tertiary-container text-on-tertiary-container">
          CONTEXT_UPLOAD
        </span>
        <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {items.length}/5 items
        </span>
      </div>

      <p className="font-body text-sm text-on-surface-variant mb-6">
        Got a call transcript, email thread, or Teams chat? Add it here and the
        AI will extract the requirements for you.
      </p>

      {/* Source type selector */}
      {!atLimit && (
        <div className="mb-4">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Source type
          </p>
          <div className="flex gap-2 flex-wrap">
            {SOURCE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  clearError();
                }}
                className={`px-3 py-2 border-2 border-black font-label text-xs font-bold uppercase tracking-widest transition-colors ${
                  selectedType === type
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload / Paste actions */}
      {selectedType && !atLimit && (
        <div className="mb-4 flex gap-3">
          <label className="cursor-pointer px-4 py-2 border-2 border-black bg-surface-container-lowest font-headline font-bold uppercase tracking-widest text-xs hover:bg-surface-container transition-colors">
            UPLOAD_FILE
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.vtt,.docx"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowPaste(!showPaste)}
            className={`px-4 py-2 border-2 border-black font-headline font-bold uppercase tracking-widest text-xs transition-colors ${
              showPaste
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container-lowest hover:bg-surface-container"
            }`}
          >
            PASTE_TEXT
          </button>
        </div>
      )}

      {/* Paste area */}
      {showPaste && selectedType && (
        <div className="mb-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your email thread, Teams chat, or transcript here..."
            className="w-full p-4 border-2 border-black bg-surface-container-lowest font-body text-sm focus:outline-none focus:border-primary-container min-h-[120px] resize-y"
          />
          <button
            onClick={handlePasteAdd}
            disabled={!pasteText.trim()}
            className="mt-2 px-4 py-2 border-2 border-black bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest text-xs hover:bg-[#cffc00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ADD_CONTEXT
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 border-2 border-black bg-error/10 text-error font-body text-sm font-bold">
          {error}
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="mb-4 p-3 border-2 border-black bg-surface-container font-body text-sm animate-pulse">
          Reading file...
        </div>
      )}

      {/* Added items list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border-2 border-black bg-surface-container-lowest"
            >
              <div className="flex items-center gap-3">
                <span className="font-label text-[10px] font-black px-2 py-0.5 bg-black text-white whitespace-nowrap">
                  {item.label.toUpperCase()}
                </span>
                <span className="font-body text-sm text-on-surface truncate max-w-[250px]">
                  {item.fileName || "Pasted text"}
                </span>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="ml-3 px-2 py-1 border-2 border-black bg-surface-container-lowest font-headline font-black text-xs hover:bg-error/10 hover:text-error transition-colors"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
