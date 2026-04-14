import { createRequest, getRequests, getRequestById } from "@/lib/requests";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: jest.fn(),
}));

import { createSupabaseClient } from "@/lib/supabase";

const SAMPLE_INPUT = {
  tickets: [
    {
      title: "Build revenue dashboard",
      userStory: "As a sales lead, I want a revenue dashboard",
      acceptanceCriteria: ["Given data exists, When I open the page, Then I see revenue"],
      storyPoints: 5,
      priority: "High" as const,
      type: "Story" as const,
      team: "Sales",
      dependencies: "None",
      issueDescription: "Need visibility into revenue",
    },
  ],
  conversation_transcript: [
    { role: "assistant" as const, content: "How can I help?" },
    { role: "user" as const, content: "I need a revenue dashboard" },
  ],
  submitted_by_name: "Matt Rance",
  submitted_by_email: "matt@immediatemedia.com",
  requested_by: "Sarah from Sales",
  team: "Sales",
};

function mockSupabaseInsert(returnData: any, error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: returnData, error }),
        }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

function mockSupabaseSelect(rows: any[], error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: rows, error }),
        }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

function mockSupabaseSelectSingle(row: any | null, error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: row, error }),
        }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

describe("createRequest", () => {
  it("stores a request and returns it with status Open", async () => {
    const savedRecord = {
      id: "abc-123",
      ...SAMPLE_INPUT,
      status: "Open",
      rejection_reason: null,
      monday_item_ids: null,
      created_at: "2026-04-14T12:00:00Z",
      updated_at: "2026-04-14T12:00:00Z",
    };
    const mockClient = mockSupabaseInsert(savedRecord);

    const result = await createRequest(SAMPLE_INPUT);

    expect(result).toEqual(savedRecord);
    expect(mockClient.from).toHaveBeenCalledWith("requests");
  });

  it("throws when supabase insert fails", async () => {
    mockSupabaseInsert(null, { message: "insert failed" });

    await expect(createRequest(SAMPLE_INPUT)).rejects.toThrow("insert failed");
  });
});

describe("getRequests", () => {
  it("returns requests filtered by status, sorted oldest first", async () => {
    const rows = [
      { id: "1", status: "Open", created_at: "2026-04-13T12:00:00Z" },
      { id: "2", status: "Open", created_at: "2026-04-14T12:00:00Z" },
    ];
    const mockClient = mockSupabaseSelect(rows);

    const result = await getRequests("Open");

    expect(result).toEqual(rows);
    expect(mockClient.from).toHaveBeenCalledWith("requests");
  });

  it("defaults to Open status when no filter provided", async () => {
    const mockClient = mockSupabaseSelect([]);

    await getRequests();

    const eqCall = mockClient.from("requests").select().eq;
    expect(eqCall).toHaveBeenCalledWith("status", "Open");
  });
});

describe("getRequestById", () => {
  it("returns a request when found", async () => {
    const row = { id: "abc-123", status: "Open" };
    mockSupabaseSelectSingle(row);

    const result = await getRequestById("abc-123");
    expect(result).toEqual(row);
  });

  it("returns null when not found", async () => {
    mockSupabaseSelectSingle(null, { code: "PGRST116" });

    const result = await getRequestById("nonexistent");
    expect(result).toBeNull();
  });
});
