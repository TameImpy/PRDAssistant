import { getSystemPrompt } from "@/lib/conversation";

describe("Analyst system prompt", () => {
  const prompt = getSystemPrompt("analyst", []);

  test("uses agile terminology", () => {
    const promptLower = prompt.toLowerCase();
    expect(
      promptLower.includes("user story") ||
        promptLower.includes("story point") ||
        promptLower.includes("acceptance criteria")
    ).toBe(true);
  });

  test("mentions Given-When-Then format", () => {
    const promptLower = prompt.toLowerCase();
    expect(promptLower).toContain("given");
    expect(promptLower).toContain("when");
    expect(promptLower).toContain("then");
  });

  test("references the story point scale", () => {
    expect(prompt).toContain("1");
    expect(prompt).toContain("13");
  });

  test("mentions dependencies as mandatory", () => {
    const promptLower = prompt.toLowerCase();
    expect(promptLower).toContain("dependenc");
  });

  test("mentions ticket types", () => {
    const promptLower = prompt.toLowerCase();
    expect(promptLower).toContain("story");
    expect(promptLower).toContain("bug");
    expect(promptLower).toContain("spike");
  });
});
