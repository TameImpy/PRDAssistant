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
});
