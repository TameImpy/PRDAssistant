import { getContextAwareSystemPrompt } from "@/lib/conversation";
import type { PreProcessedContext } from "@/lib/context-preprocess";

const fullContext: PreProcessedContext = {
  whatTheyNeed: "A weekly revenue dashboard broken down by brand",
  whoBenefits: "Commercial leadership team",
  whyItMatters: "No visibility into brand-level revenue trends",
  successCriteria: "Dashboard updates every Monday",
  requestedBy: "Sarah Chen, Head of Commercial",
  keyDecisions: ["Data should come from GAM"],
  openQuestions: ["Should archived brands be included?"],
  constraints: ["Must use existing Looker infrastructure"],
  deadlines: ["End of Q2 2026"],
  participants: ["Sarah Chen (Head of Commercial)"],
};

const partialContext: PreProcessedContext = {
  whatTheyNeed: "Some kind of reporting tool",
  whoBenefits: null,
  whyItMatters: null,
  successCriteria: null,
  requestedBy: null,
  keyDecisions: [],
  openQuestions: ["Who is this for?", "What problem does it solve?"],
  constraints: [],
  deadlines: [],
  participants: [],
};

describe("Context-aware system prompt", () => {
  test("includes the extracted summary in the prompt", () => {
    const prompt = getContextAwareSystemPrompt(fullContext, []);

    expect(prompt).toContain("weekly revenue dashboard");
    expect(prompt).toContain("Commercial leadership team");
    expect(prompt).toContain("Sarah Chen");
  });

  test("includes open questions for the AI to ask about", () => {
    const prompt = getContextAwareSystemPrompt(fullContext, []);

    expect(prompt).toContain("archived brands");
  });

  test("includes constraints and deadlines", () => {
    const prompt = getContextAwareSystemPrompt(fullContext, []);

    expect(prompt).toContain("Looker");
    expect(prompt).toContain("Q2 2026");
  });

  test("instructs AI to open with summary, not generic greeting", () => {
    const prompt = getContextAwareSystemPrompt(fullContext, []);
    const promptLower = prompt.toLowerCase();

    expect(
      promptLower.includes("summary") || promptLower.includes("summarise") || promptLower.includes("summarize")
    ).toBe(true);
    expect(
      promptLower.includes("do not") || promptLower.includes("never")
    ).toBe(true);
  });

  test("tells AI to only ask about missing fields when some are null", () => {
    const prompt = getContextAwareSystemPrompt(partialContext, ["whoBenefits", "whyItMatters", "successCriteria", "requestedBy"]);

    expect(prompt).toContain("whoBenefits");
    expect(prompt).toContain("whyItMatters");
  });

  test("includes key decisions from the transcript", () => {
    const prompt = getContextAwareSystemPrompt(fullContext, []);

    expect(prompt).toContain("GAM");
  });
});
