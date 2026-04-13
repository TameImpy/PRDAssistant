import { MondayClient } from "@/lib/monday";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Monday.com client - error handling", () => {
  const client = new MondayClient("test-token");

  beforeEach(() => {
    mockFetch.mockReset();
  });

  test("returns error when API returns non-200 status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const result = await client.createItem({
      boardId: "123",
      groupId: "group1",
      itemName: "Test",
      columnValues: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("500");
  });

  test("returns error when API returns GraphQL errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        errors: [{ message: "Invalid board ID" }],
      }),
    });

    const result = await client.createItem({
      boardId: "invalid",
      groupId: "group1",
      itemName: "Test",
      columnValues: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid board ID");
  });

  test("returns error when network fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await client.createItem({
      boardId: "123",
      groupId: "group1",
      itemName: "Test",
      columnValues: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Network error");
  });
});
