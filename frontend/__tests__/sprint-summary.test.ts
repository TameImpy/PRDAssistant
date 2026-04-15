const mockSupabaseFrom = jest.fn();
const mockAnthropicCreate = jest.fn();

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: jest.fn().mockReturnValue({
    from: (...args: any[]) => mockSupabaseFrom(...args),
  }),
}));

jest.mock("@anthropic-ai/sdk", () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: (...args: any[]) => mockAnthropicCreate(...args) },
  }));
});

import { getOrGenerateSummary } from "@/lib/sprint-summary";

function mockSupabaseSelect(row: any | null) {
  mockSupabaseFrom.mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: row, error: row ? null : { code: "PGRST116" } }),
      }),
    }),
    upsert: jest.fn().mockResolvedValue({ error: null }),
  });
}

describe("getOrGenerateSummary", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns cached summary when done items match", async () => {
    mockSupabaseSelect({
      summary: "The team shipped 3 reports and a dashboard.",
      done_item_names: ["Report A", "Report B", "Report C", "Dashboard"],
    });

    const result = await getOrGenerateSummary(
      "Sprint - w/c 30th March",
      ["Report A", "Report B", "Report C", "Dashboard"]
    );

    expect(result).toBe("The team shipped 3 reports and a dashboard.");
    expect(mockAnthropicCreate).not.toHaveBeenCalled();
  });

  it("generates new summary when no cache exists", async () => {
    mockSupabaseSelect(null);
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "Last sprint the team delivered two key analytics reports." }],
    });

    const result = await getOrGenerateSummary(
      "Sprint - w/c 30th March",
      ["Analytics report A", "Analytics report B"]
    );

    expect(result).toBe("Last sprint the team delivered two key analytics reports.");
    expect(mockAnthropicCreate).toHaveBeenCalled();
  });

  it("regenerates when done items have changed", async () => {
    mockSupabaseSelect({
      summary: "Old summary",
      done_item_names: ["Old task A"],
    });
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "New summary with updated items." }],
    });

    const result = await getOrGenerateSummary(
      "Sprint - w/c 30th March",
      ["New task A", "New task B"]
    );

    expect(result).toBe("New summary with updated items.");
    expect(mockAnthropicCreate).toHaveBeenCalled();
  });

  it("returns empty string when no done items", async () => {
    const result = await getOrGenerateSummary("Sprint - w/c 30th March", []);

    expect(result).toBe("");
    expect(mockAnthropicCreate).not.toHaveBeenCalled();
  });
});
