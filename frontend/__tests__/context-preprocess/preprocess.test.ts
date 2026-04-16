import { preprocessContext } from "@/lib/context-preprocess";

const mockCreate = jest.fn();

jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }));
});

const FULL_RESPONSE = {
  whatTheyNeed: "A weekly revenue dashboard broken down by brand",
  whoBenefits: "Commercial leadership team",
  whyItMatters: "Currently no visibility into brand-level revenue trends",
  successCriteria: "Dashboard updates every Monday with week-over-week comparisons",
  requestedBy: "Sarah Chen, Head of Commercial",
  keyDecisions: ["Data should come from GAM, not internal billing"],
  openQuestions: ["Should archived brands be included?", "What date range for historical data?"],
  constraints: ["Must use existing Looker infrastructure"],
  deadlines: ["End of Q2 2026"],
  participants: ["Sarah Chen (Head of Commercial)", "Dev team (Analytics Engineering)"],
};

beforeEach(() => {
  mockCreate.mockReset();
});

describe("Context pre-processing", () => {
  test("returns structured context from a successful API call", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(FULL_RESPONSE) }],
    });

    const result = await preprocessContext([
      { text: "Call transcript about revenue dashboard...", label: "Call/Meeting Transcript" },
    ]);

    expect(result.context.whatTheyNeed).toBe(FULL_RESPONSE.whatTheyNeed);
    expect(result.context.whoBenefits).toBe(FULL_RESPONSE.whoBenefits);
    expect(result.context.whyItMatters).toBe(FULL_RESPONSE.whyItMatters);
    expect(result.context.successCriteria).toBe(FULL_RESPONSE.successCriteria);
    expect(result.context.requestedBy).toBe(FULL_RESPONSE.requestedBy);
    expect(result.context.keyDecisions).toEqual(FULL_RESPONSE.keyDecisions);
    expect(result.context.openQuestions).toEqual(FULL_RESPONSE.openQuestions);
    expect(result.context.constraints).toEqual(FULL_RESPONSE.constraints);
    expect(result.context.deadlines).toEqual(FULL_RESPONSE.deadlines);
    expect(result.context.participants).toEqual(FULL_RESPONSE.participants);
  });

  test("returns null and empty arrays for fields not found in source", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{
        type: "text",
        text: JSON.stringify({
          whatTheyNeed: "Some dashboard",
          whoBenefits: null,
          whyItMatters: null,
          successCriteria: null,
          requestedBy: null,
          keyDecisions: [],
          openQuestions: ["What data sources?"],
          constraints: [],
          deadlines: [],
          participants: [],
        }),
      }],
    });

    const result = await preprocessContext([
      { text: "We need a dashboard", label: "Email Thread" },
    ]);

    expect(result.context.whatTheyNeed).toBe("Some dashboard");
    expect(result.context.whoBenefits).toBeNull();
    expect(result.context.whyItMatters).toBeNull();
    expect(result.context.successCriteria).toBeNull();
    expect(result.context.requestedBy).toBeNull();
    expect(result.context.keyDecisions).toEqual([]);
    expect(result.context.openQuestions).toEqual(["What data sources?"]);
    expect(result.context.constraints).toEqual([]);
  });

  test("returns concatenated raw text from all items", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(FULL_RESPONSE) }],
    });

    const result = await preprocessContext([
      { text: "First transcript content", label: "Call/Meeting Transcript" },
      { text: "Second email thread", label: "Email Thread" },
    ]);

    expect(result.rawText).toContain("First transcript content");
    expect(result.rawText).toContain("Second email thread");
  });

  test("includes source type labels in the prompt sent to Claude", async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify(FULL_RESPONSE) }],
    });

    await preprocessContext([
      { text: "Call content", label: "Call/Meeting Transcript" },
      { text: "Teams content", label: "Teams Chat" },
    ]);

    const callArg = mockCreate.mock.calls[0][0];
    const userMessage = callArg.messages[0].content;
    expect(userMessage).toContain("Call/Meeting Transcript");
    expect(userMessage).toContain("Teams Chat");
  });

  test("returns empty context when API call fails", async () => {
    mockCreate.mockRejectedValueOnce(new Error("API unavailable"));

    const result = await preprocessContext([
      { text: "Some content", label: "Email Thread" },
    ]);

    expect(result.context.whatTheyNeed).toBeNull();
    expect(result.context.openQuestions).toEqual([]);
    expect(result.rawText).toContain("Some content");
  });
});
