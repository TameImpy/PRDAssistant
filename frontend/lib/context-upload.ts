export type ContextSourceType =
  | "Call/Meeting Transcript"
  | "Email Thread"
  | "Teams Chat";

export type ContextItem = {
  id: string;
  label: ContextSourceType;
  text: string;
  fileName?: string;
  fileSize?: number;
};

const ALLOWED_EXTENSIONS = [".txt", ".vtt", ".docx"];
const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500KB
const MAX_ITEMS = 5;
const MAX_TOTAL_SIZE_BYTES = 1024 * 1024; // ~1MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  const name = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));

  if (!hasValidExtension) {
    return { valid: false, error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File too large. Maximum size is 500KB.` };
  }

  return { valid: true };
}

export function validateItemCount(currentItems: ContextItem[]): { valid: boolean; error?: string } {
  if (currentItems.length >= MAX_ITEMS) {
    return { valid: false, error: `Maximum ${MAX_ITEMS} context items allowed.` };
  }
  return { valid: true };
}

export function validateTotalSize(currentItems: ContextItem[], newText: string): { valid: boolean; error?: string } {
  const existingSize = currentItems.reduce((sum, item) => sum + new Blob([item.text]).size, 0);
  const newSize = new Blob([newText]).size;

  if (existingSize + newSize > MAX_TOTAL_SIZE_BYTES) {
    return { valid: false, error: `Total context exceeds 1MB. Remove an item or use shorter text.` };
  }
  return { valid: true };
}

export async function parseFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".txt") || name.endsWith(".vtt")) {
    return file.text();
  }

  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${file.name}`);
}
