import { validateFile, validateItemCount, validateTotalSize, type ContextItem } from "@/lib/context-upload";

describe("File validation", () => {
  test("rejects unsupported file extensions", () => {
    const file = new File(["content"], "report.pdf", { type: "application/pdf" });
    const result = validateFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("rejects files over 500KB", () => {
    const largeContent = "x".repeat(501 * 1024);
    const file = new File([largeContent], "big.txt", { type: "text/plain" });
    const result = validateFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/500/);
  });

  test.each([
    ["transcript.txt", "text/plain"],
    ["meeting.vtt", "text/vtt"],
    ["notes.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ])("accepts %s", (fileName, mimeType) => {
    const file = new File(["content"], fileName, { type: mimeType });
    const result = validateFile(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

function makeItem(id: string): ContextItem {
  return { id, label: "Email Thread", text: "some text" };
}

describe("Item count validation", () => {
  test("rejects when adding a 6th item", () => {
    const existing = [1, 2, 3, 4, 5].map((n) => makeItem(`item-${n}`));
    const result = validateItemCount(existing);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/5/);
  });

  test("allows adding when under the limit", () => {
    const existing = [1, 2].map((n) => makeItem(`item-${n}`));
    const result = validateItemCount(existing);

    expect(result.valid).toBe(true);
  });
});

describe("Total size validation", () => {
  test("rejects when total exceeds 1MB", () => {
    const bigText = "x".repeat(600 * 1024);
    const existing: ContextItem[] = [
      { id: "1", label: "Email Thread", text: bigText },
    ];
    const newText = "y".repeat(500 * 1024);
    const result = validateTotalSize(existing, newText);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/1MB/);
  });

  test("allows when total is under 1MB", () => {
    const existing: ContextItem[] = [
      { id: "1", label: "Email Thread", text: "short text" },
    ];
    const result = validateTotalSize(existing, "also short");

    expect(result.valid).toBe(true);
  });
});
