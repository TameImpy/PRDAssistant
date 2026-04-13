import { generateTickets, type TicketInput } from "@/lib/tickets";

// Mock the Anthropic SDK
jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              tickets: [
                {
                  title: "Audio revenue dashboard by brand and channel",
                  userStory:
                    "As a Director of Agency Trading, I want an audio revenue dashboard tracking revenue and impressions by brand and channel against budget, so that I can make faster trading decisions without relying on manual Excel processes.",
                  acceptanceCriteria: [
                    "Given the dashboard is loaded, When the user selects a brand, Then revenue and impressions for that brand are displayed against budget",
                    "Given the dashboard is loaded, When the user filters by channel, Then only data for that channel is shown",
                    "Given the dashboard data is updated monthly, When new data is uploaded, Then the dashboard reflects the latest figures within 24 hours",
                  ],
                  storyPoints: 5,
                  priority: "High",
                  type: "Story",
                  dependencies: "Manual data uploads from Connect, Adomik and YouTube",
                },
              ],
            }),
          },
        ],
      }),
    },
  }));
});

const input: TicketInput = {
  whatTheyNeed:
    "an audio revenue dashboard tracking revenue and impressions by brand and channel against budget",
  whoBenefits: "James Walmsley, Director of Agency Trading",
  whyItMatters:
    "currently relies on a manual Excel process which is slow and prevents fast trading decisions",
  successCriteria:
    "see revenue vs budget by brand, filter by channel, identify underperforming areas",
  team: "Sales",
};

describe("LLM-powered ticket generation", () => {
  test("returns tickets with all required fields", async () => {
    const tickets = await generateTickets(input);

    expect(tickets.length).toBeGreaterThan(0);

    const ticket = tickets[0];
    expect(ticket).toHaveProperty("title");
    expect(ticket).toHaveProperty("userStory");
    expect(ticket).toHaveProperty("acceptanceCriteria");
    expect(ticket).toHaveProperty("storyPoints");
    expect(ticket).toHaveProperty("priority");
    expect(ticket).toHaveProperty("type");
    expect(ticket).toHaveProperty("team");
    expect(ticket).toHaveProperty("dependencies");
    expect(ticket).toHaveProperty("issueDescription");
  });

  test("title is concise — under 60 characters", async () => {
    const tickets = await generateTickets(input);
    expect(tickets[0].title.length).toBeLessThanOrEqual(60);
  });

  test("user story follows As a / I want / so that format", async () => {
    const tickets = await generateTickets(input);
    const story = tickets[0].userStory;

    expect(story).toMatch(/^As a/i);
    expect(story).toMatch(/I want/i);
    expect(story).toMatch(/so that/i);
  });

  test("acceptance criteria are in Given-When-Then format", async () => {
    const tickets = await generateTickets(input);
    const criteria = tickets[0].acceptanceCriteria;

    expect(criteria.length).toBeGreaterThan(0);
    for (const criterion of criteria) {
      expect(criterion.toLowerCase()).toContain("given");
      expect(criterion.toLowerCase()).toContain("when");
      expect(criterion.toLowerCase()).toContain("then");
    }
  });

  test("story points are from the valid scale", async () => {
    const validPoints = [1, 2, 3, 5, 8, 13];
    const tickets = await generateTickets(input);
    expect(validPoints).toContain(tickets[0].storyPoints);
  });

  test("team is passed through from input", async () => {
    const tickets = await generateTickets(input);
    expect(tickets[0].team).toBe("Sales");
  });
});
