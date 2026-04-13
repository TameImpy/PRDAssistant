import { generateTickets, type TicketInput } from "@/lib/tickets";

describe("User story generation", () => {
  test("generates a user story in 'As a... I want... so that...' format", () => {
    const input: TicketInput = {
      whatTheyNeed: "a dashboard showing ad revenue broken down by brand",
      whoBenefits: "the sales team",
      whyItMatters:
        "they currently have no visibility into brand-level revenue which slows decision making",
      successCriteria:
        "sales team can see revenue by brand, filter by date range, and export to CSV",
      team: "Sales",
    };

    const tickets = generateTickets(input);

    expect(tickets.length).toBeGreaterThan(0);

    const firstTicket = tickets[0];
    expect(firstTicket.userStory).toMatch(/^As a/i);
    expect(firstTicket.userStory).toMatch(/I want/i);
    expect(firstTicket.userStory).toMatch(/so that/i);
  });

  test("includes a title for each ticket", () => {
    const input: TicketInput = {
      whatTheyNeed: "a weekly email report of top performing articles",
      whoBenefits: "the editorial team",
      whyItMatters: "editors need to know what content is driving traffic",
      successCriteria: "automated email every Monday with top 10 articles by pageviews",
      team: "Content",
    };

    const tickets = generateTickets(input);

    expect(tickets[0].title).toBeTruthy();
    expect(tickets[0].title.length).toBeGreaterThan(5);
  });
});
