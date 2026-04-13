import { mapTicketToColumnValues, COLUMN_IDS } from "@/lib/monday";
import type { Ticket } from "@/lib/tickets";

describe("Column value mapping", () => {
  const ticket: Ticket = {
    title: "Revenue dashboard by brand",
    userStory:
      "As a Sales team member, I want a dashboard showing revenue by brand, so that I can make better decisions.",
    acceptanceCriteria: [
      "Given the dashboard is built, When a user opens it, Then they see revenue by brand",
    ],
    storyPoints: 5,
    priority: "High",
    type: "Story",
    team: "Sales",
    dependencies: "Needs data from BigQuery",
    issueDescription: "Sales team lacks visibility into brand-level revenue",
  };

  test("maps all ticket fields to Monday.com column values", () => {
    const values = mapTicketToColumnValues(ticket);

    expect(values[COLUMN_IDS.status]).toEqual({ label: "Not Started" });
    expect(values[COLUMN_IDS.taskDescription]).toEqual({
      text: ticket.userStory,
    });
    expect(values[COLUMN_IDS.priority]).toEqual({ label: "High" });
    expect(values[COLUMN_IDS.type]).toEqual({ label: "Story" });
    expect(values[COLUMN_IDS.team]).toEqual({ label: "Sales" });
    expect(values[COLUMN_IDS.estimate]).toBe("5 SP");
    expect(values[COLUMN_IDS.dependencies]).toEqual({
      text: "Needs data from BigQuery",
    });
    expect(values[COLUMN_IDS.issueDescription]).toEqual({
      text: "Sales team lacks visibility into brand-level revenue",
    });
  });

  test("maps Critical priority with emoji to match Monday.com label", () => {
    const criticalTicket = { ...ticket, priority: "Critical" as const };
    const values = mapTicketToColumnValues(criticalTicket);

    expect(values[COLUMN_IDS.priority].label).toContain("Critical");
  });

  test("defaults dependencies to 'None' when empty", () => {
    const noDeps = { ...ticket, dependencies: "" };
    const values = mapTicketToColumnValues(noDeps);

    expect(values[COLUMN_IDS.dependencies]).toEqual({ text: "None" });
  });
});
