import { generateTickets, type TicketInput } from "@/lib/tickets";

const baseInput: TicketInput = {
  whatTheyNeed: "a dashboard",
  whoBenefits: "team",
  whyItMatters: "",
  successCriteria: "it works",
  team: "Sales",
};

describe("Priority inference", () => {
  test("infers Critical when language indicates urgency", () => {
    const input = {
      ...baseInput,
      whyItMatters: "this is urgent — the reporting system is broken and we need it immediately",
    };
    const tickets = generateTickets(input);
    expect(tickets[0].priority).toBe("Critical");
  });

  test("infers High when deadline or revenue is mentioned", () => {
    const input = {
      ...baseInput,
      whyItMatters: "we have a revenue reporting deadline next week",
    };
    const tickets = generateTickets(input);
    expect(tickets[0].priority).toBe("High");
  });

  test("infers Low when explicitly non-urgent", () => {
    const input = {
      ...baseInput,
      whyItMatters: "this would be nice to have when possible, no rush",
    };
    const tickets = generateTickets(input);
    expect(tickets[0].priority).toBe("Low");
  });

  test("defaults to Medium when no urgency signals", () => {
    const input = {
      ...baseInput,
      whyItMatters: "it would help the team make better decisions",
    };
    const tickets = generateTickets(input);
    expect(tickets[0].priority).toBe("Medium");
  });
});
