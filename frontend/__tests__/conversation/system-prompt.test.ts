import { getSystemPrompt } from "@/lib/conversation";

describe("Stakeholder system prompt", () => {
  const prompt = getSystemPrompt("stakeholder", []);

  test("does not contain agile jargon", () => {
    const jargonTerms = [
      "story point",
      "acceptance criteria",
      "sprint",
      "backlog",
      "epic",
      "scrum",
      "kanban",
      "velocity",
      "burndown",
      "definition of ready",
      "BDD",
      "given-when-then",
      "user story",
    ];

    const promptLower = prompt.toLowerCase();
    for (const term of jargonTerms) {
      expect(promptLower).not.toContain(term);
    }
  });

  test("instructs the agent to be warm and encouraging", () => {
    const promptLower = prompt.toLowerCase();
    expect(
      promptLower.includes("warm") ||
        promptLower.includes("friendly") ||
        promptLower.includes("encouraging")
    ).toBe(true);
  });

  test("references the mandatory fields to capture", () => {
    const promptLower = prompt.toLowerCase();
    expect(promptLower).toContain("what");
    expect(promptLower).toContain("who");
    expect(promptLower).toContain("why");
    expect(promptLower).toContain("success");
  });

  test("instructs the assistant to ask who the request is for", () => {
    const promptWithMissing = getSystemPrompt("stakeholder", ["requestedBy"]);
    const promptLower = promptWithMissing.toLowerCase();
    expect(
      promptLower.includes("who") &&
        (promptLower.includes("request is for") ||
          promptLower.includes("behalf") ||
          promptLower.includes("requesting"))
    ).toBe(true);
  });
});
