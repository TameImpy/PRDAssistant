import { isAnalyst } from "@/lib/analysts";

// Mock the supabase module at the system boundary
jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: jest.fn(),
}));

import { createSupabaseClient } from "@/lib/supabase";

function mockSupabase(rows: any[], error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: rows.length > 0 ? rows[0] : null, error }),
        }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

describe("isAnalyst", () => {
  it("returns true when email exists in analysts table", async () => {
    mockSupabase([{ id: "1", email: "matt@immediatemedia.com" }]);

    const result = await isAnalyst("matt@immediatemedia.com");
    expect(result).toBe(true);
  });

  it("returns false when email is not in analysts table", async () => {
    mockSupabase([]);

    const result = await isAnalyst("stranger@immediatemedia.com");
    expect(result).toBe(false);
  });

  it("returns false when supabase returns an error", async () => {
    mockSupabase([], { message: "connection failed" });

    const result = await isAnalyst("matt@immediatemedia.com");
    expect(result).toBe(false);
  });
});
