import { MondayClient } from "@/lib/monday";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Monday.com client - batch create", () => {
  const client = new MondayClient("test-token");

  beforeEach(() => {
    mockFetch.mockReset();
  });

  test("creates multiple items and returns results for each", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { create_item: { id: "111" } } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { create_item: { id: "222" } } }),
      });

    const results = await client.createItems([
      {
        boardId: "5094486524",
        groupId: "new_group29179",
        itemName: "Ticket 1",
        columnValues: {},
      },
      {
        boardId: "5094486524",
        groupId: "new_group29179",
        itemName: "Ticket 2",
        columnValues: {},
      },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[0].itemId).toBe("111");
    expect(results[1].success).toBe(true);
    expect(results[1].itemId).toBe("222");
  });

  test("returns partial results when some items fail", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { create_item: { id: "111" } } }),
      })
      .mockRejectedValueOnce(new Error("Network error"));

    const results = await client.createItems([
      {
        boardId: "5094486524",
        groupId: "new_group29179",
        itemName: "Ticket 1",
        columnValues: {},
      },
      {
        boardId: "5094486524",
        groupId: "new_group29179",
        itemName: "Ticket 2",
        columnValues: {},
      },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
    expect(results[1].error).toContain("Network error");
  });
});
