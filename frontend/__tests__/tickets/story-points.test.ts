import { generateTickets, type TicketInput } from "@/lib/tickets";

const baseInput: TicketInput = {
  whatTheyNeed: "",
  whoBenefits: "team",
  whyItMatters: "needed",
  successCriteria: "it works",
  team: "Sales",
};

describe("Story point estimation", () => {
  test("estimates low points for simple requests", () => {
    const input = { ...baseInput, whatTheyNeed: "add a new column to the report" };
    const tickets = generateTickets(input);

    expect(tickets[0].storyPoints).toBeLessThanOrEqual(3);
  });

  test("estimates higher points for complex requests", () => {
    const input = {
      ...baseInput,
      whatTheyNeed: "integrate multiple data sources and rebuild the pipeline",
    };
    const tickets = generateTickets(input);

    expect(tickets[0].storyPoints).toBeGreaterThanOrEqual(5);
  });

  test("story points are always from the valid scale", () => {
    const validPoints = [1, 2, 3, 5, 8, 13];
    const inputs = [
      "fix a typo",
      "create a new dashboard",
      "rebuild the entire data pipeline with automated testing",
    ];

    for (const whatTheyNeed of inputs) {
      const tickets = generateTickets({ ...baseInput, whatTheyNeed });
      expect(validPoints).toContain(tickets[0].storyPoints);
    }
  });
});
