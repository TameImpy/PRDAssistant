import { generateTickets, type TicketInput } from "@/lib/tickets";

const mockCreate = jest.fn();

jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }));
});

const baseInput: TicketInput = {
  whatTheyNeed: "a revenue dashboard",
  whoBenefits: "Commercial leadership",
  whyItMatters: "no visibility into brand revenue",
  successCriteria: "dashboard with weekly updates",
  team: "Sales",
};

const MOCK_TICKET_RESPONSE = {
  tickets: [{
    title: "Build brand revenue dashboard",
    userStory: "As a commercial director, I want a brand revenue dashboard, so that I can track performance weekly.",
    acceptanceCriteria: [
      "Given the dashboard is loaded, When the user views it, Then revenue by brand is displayed",
    ],
    storyPoints: 5,
    priority: "High",
    type: "Story",
    dependencies: "GAM data access",
  }],
};

beforeEach(() => {
  mockCreate.mockReset();
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: JSON.stringify(MOCK_TICKET_RESPONSE) }],
  });
});

describe("Context-aware ticket generation", () => {
  test("includes raw transcript text in the prompt when provided", async () => {
    const input: TicketInput = {
      ...baseInput,
      rawTranscriptText: "Sarah mentioned she needs the data broken down by brand and quarter. The deadline is end of Q2.",
    };

    await generateTickets(input);

    const callArg = mockCreate.mock.calls[0][0];
    const userMessage = callArg.messages[0].content;
    expect(userMessage).toContain("broken down by brand and quarter");
    expect(userMessage).toContain("end of Q2");
  });

  test("does not include transcript section when rawTranscriptText is absent", async () => {
    await generateTickets(baseInput);

    const callArg = mockCreate.mock.calls[0][0];
    const userMessage = callArg.messages[0].content;
    expect(userMessage).not.toContain("Original transcript");
    expect(userMessage).not.toContain("source material");
  });

  test("still produces valid tickets when transcript is provided", async () => {
    const input: TicketInput = {
      ...baseInput,
      rawTranscriptText: "Some call transcript content here.",
    };

    const tickets = await generateTickets(input);

    expect(tickets.length).toBeGreaterThan(0);
    expect(tickets[0].title).toBeTruthy();
    expect(tickets[0].team).toBe("Sales");
  });
});
