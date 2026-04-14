const mockGetRequestById = jest.fn();
const mockSubmitRequestToBacklog = jest.fn();

jest.mock("@/lib/requests", () => ({
  getRequestById: (...args: any[]) => mockGetRequestById(...args),
  submitRequestToBacklog: (...args: any[]) => mockSubmitRequestToBacklog(...args),
}));

const mockMondayCreateItems = jest.fn();

jest.mock("@/lib/monday", () => ({
  MondayClient: jest.fn().mockImplementation(() => ({
    createItems: (...args: any[]) => mockMondayCreateItems(...args),
  })),
  mapTicketToColumnValues: jest.fn().mockReturnValue({}),
}));

import { POST } from "@/app/api/requests/[id]/submit/route";

describe("POST /api/requests/[id]/submit", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, MONDAY_API_TOKEN: "test-token", MONDAY_BOARD_ID: "123", MONDAY_BACKLOG_GROUP_ID: "group1" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("pushes tickets to Monday.com and updates request status", async () => {
    const record = {
      id: "abc-123",
      status: "Open",
      tickets: [{ title: "Test", userStory: "As a user...", storyPoints: 3, priority: "Medium", type: "Story", team: "Sales", dependencies: "None", issueDescription: "Test" }],
    };
    mockGetRequestById.mockResolvedValue(record);
    mockMondayCreateItems.mockResolvedValue([{ success: true, itemId: "monday-1" }]);
    mockSubmitRequestToBacklog.mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/requests/abc-123/submit", { method: "POST" });
    const response = await POST(request, { params: Promise.resolve({ id: "abc-123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.boardUrl).toContain("monday.com");
    expect(mockSubmitRequestToBacklog).toHaveBeenCalledWith("abc-123", ["monday-1"]);
  });

  it("returns 404 when request not found", async () => {
    mockGetRequestById.mockResolvedValue(null);

    const request = new Request("http://localhost/api/requests/nope/submit", { method: "POST" });
    const response = await POST(request, { params: Promise.resolve({ id: "nope" }) });

    expect(response.status).toBe(404);
  });

  it("returns 400 when request is not Open", async () => {
    mockGetRequestById.mockResolvedValue({ id: "abc-123", status: "Submitted to Backlog", tickets: [] });

    const request = new Request("http://localhost/api/requests/abc-123/submit", { method: "POST" });
    const response = await POST(request, { params: Promise.resolve({ id: "abc-123" }) });

    expect(response.status).toBe(400);
  });
});
