import { MondayClient } from "@/lib/monday";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Monday.com client - create item", () => {
  const client = new MondayClient("test-api-token");

  beforeEach(() => {
    mockFetch.mockReset();
  });

  test("creates an item and returns its ID", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          create_item: { id: "123456789" },
        },
      }),
    });

    const result = await client.createItem({
      boardId: "5094486524",
      groupId: "new_group29179",
      itemName: "Revenue dashboard by brand",
      columnValues: {},
    });

    expect(result.success).toBe(true);
    expect(result.itemId).toBe("123456789");

    // Verify the fetch was called with correct structure
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.monday.com/v2");
    expect(options.headers["Authorization"]).toBe("test-api-token");

    const body = JSON.parse(options.body);
    expect(body.query).toContain("create_item");
    expect(body.query).toContain("5094486524");
  });
});
