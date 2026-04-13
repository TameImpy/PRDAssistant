import { generateTickets, type TicketInput } from "@/lib/tickets";

// Mock Anthropic to simulate failure
jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockRejectedValue(new Error("API unavailable")),
    },
  }));
});

const input: TicketInput = {
  whatTheyNeed: "a weekly email report of top articles",
  whoBenefits: "the editorial team",
  whyItMatters: "editors need to track content performance",
  successCriteria: "automated email every Monday with top 10 articles",
  team: "Content",
};

describe("Ticket generation fallback", () => {
  test("returns tickets even when Claude fails", async () => {
    const tickets = await generateTickets(input);

    expect(tickets.length).toBeGreaterThan(0);
    expect(tickets[0].title).toBeTruthy();
    expect(tickets[0].userStory).toBeTruthy();
    expect(tickets[0].team).toBe("Content");
  });

  test("fallback title is truncated to 60 characters", async () => {
    const longInput = {
      ...input,
      whatTheyNeed:
        "a comprehensive automated reporting system that pulls data from multiple sources and generates weekly summaries",
    };
    const tickets = await generateTickets(longInput);

    expect(tickets[0].title.length).toBeLessThanOrEqual(60);
  });

  test("fallback still produces acceptance criteria", async () => {
    const tickets = await generateTickets(input);

    expect(tickets[0].acceptanceCriteria.length).toBeGreaterThan(0);
  });
});
