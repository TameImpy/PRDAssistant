import { generateTickets, type TicketInput } from "@/lib/tickets";

describe("Acceptance criteria generation", () => {
  test("generates Given-When-Then format criteria", () => {
    const input: TicketInput = {
      whatTheyNeed: "a revenue dashboard",
      whoBenefits: "sales team",
      whyItMatters: "no visibility into brand revenue",
      successCriteria:
        "sales team can see revenue by brand, filter by date range, and export to CSV",
      team: "Sales",
    };

    const tickets = generateTickets(input);
    const criteria = tickets[0].acceptanceCriteria;

    expect(criteria.length).toBeGreaterThan(0);

    for (const criterion of criteria) {
      expect(criterion.toLowerCase()).toContain("given");
      expect(criterion.toLowerCase()).toContain("when");
      expect(criterion.toLowerCase()).toContain("then");
    }
  });

  test("creates separate criteria for each success condition", () => {
    const input: TicketInput = {
      whatTheyNeed: "an automated email report",
      whoBenefits: "editorial team",
      whyItMatters: "need to track content performance",
      successCriteria:
        "email sent every Monday, contains top 10 articles, shows pageview counts",
      team: "Content",
    };

    const tickets = generateTickets(input);
    const criteria = tickets[0].acceptanceCriteria;

    expect(criteria.length).toBeGreaterThanOrEqual(3);
  });
});
