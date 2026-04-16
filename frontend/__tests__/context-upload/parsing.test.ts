import { parseFile } from "@/lib/context-upload";

describe("File parsing", () => {
  test("extracts text from .txt files", async () => {
    const content = "This is a plain text transcript of a call.";
    const file = new File([content], "transcript.txt", { type: "text/plain" });

    const text = await parseFile(file);

    expect(text).toBe(content);
  });

  test("extracts text from .docx files", async () => {
    // Create a minimal .docx file using mammoth's expected input
    // We'll use a real (tiny) .docx buffer for an integration-style test
    const mammoth = require("mammoth");

    // Build a real docx from a known buffer — mammoth can extract from ArrayBuffer
    // For test purposes, we'll mock at the file level and verify parseFile calls mammoth
    const fs = require("fs");
    const path = require("path");

    // Create a fixture .docx with mammoth's test helper
    // Actually, let's just verify parseFile handles .docx by testing with a mock
    // since creating a real .docx in a test is complex
    const mockExtractRawText = jest.spyOn(mammoth, "extractRawText");
    mockExtractRawText.mockResolvedValueOnce({ value: "Meeting notes: need Q2 revenue data" });

    const file = new File([new ArrayBuffer(10)], "notes.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const text = await parseFile(file);

    expect(text).toBe("Meeting notes: need Q2 revenue data");
    expect(mockExtractRawText).toHaveBeenCalled();
    mockExtractRawText.mockRestore();
  });

  test("extracts text from .vtt files", async () => {
    const vttContent = `WEBVTT

00:00:00.000 --> 00:00:05.000
Speaker 1: We need a dashboard for ad revenue.

00:00:05.000 --> 00:00:10.000
Speaker 2: Broken down by brand, right?`;
    const file = new File([vttContent], "meeting.vtt", { type: "text/vtt" });

    const text = await parseFile(file);

    expect(text).toContain("dashboard for ad revenue");
    expect(text).toContain("Broken down by brand");
  });
});
