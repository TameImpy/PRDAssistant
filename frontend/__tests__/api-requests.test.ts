const mockCreateRequest = jest.fn();
const mockGetRequests = jest.fn();

jest.mock("@/lib/requests", () => ({
  createRequest: (...args: any[]) => mockCreateRequest(...args),
  getRequests: (...args: any[]) => mockGetRequests(...args),
}));

import { POST } from "@/app/api/requests/route";

describe("POST /api/requests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validBody = {
    tickets: [{ title: "Test ticket", userStory: "As a user...", acceptanceCriteria: [], storyPoints: 3, priority: "Medium", type: "Story", team: "Sales", dependencies: "None", issueDescription: "Test" }],
    conversation_transcript: [{ role: "user", content: "I need help" }],
    submitted_by_name: "Matt Rance",
    submitted_by_email: "matt@immediatemedia.com",
    requested_by: "Sarah from Sales",
    team: "Sales",
  };

  it("saves request to Supabase and returns success", async () => {
    const savedRecord = { id: "abc-123", ...validBody, status: "Open", created_at: "2026-04-14T12:00:00Z", updated_at: "2026-04-14T12:00:00Z", rejection_reason: null, monday_item_ids: null };
    mockCreateRequest.mockResolvedValue(savedRecord);

    const request = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestId).toBe("abc-123");
    expect(mockCreateRequest).toHaveBeenCalledWith({
      tickets: validBody.tickets,
      conversation_transcript: validBody.conversation_transcript,
      submitted_by_name: validBody.submitted_by_name,
      submitted_by_email: validBody.submitted_by_email,
      requested_by: validBody.requested_by,
      team: validBody.team,
    });
  });

  it("returns 400 when tickets are missing", async () => {
    const request = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, tickets: [] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 500 when Supabase fails", async () => {
    mockCreateRequest.mockRejectedValue(new Error("connection failed"));

    const request = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
