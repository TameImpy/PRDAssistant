import { MondayClient } from "@/lib/monday";

// Mock fetch at the system boundary
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("MondayClient.getGroups", () => {
  const client = new MondayClient("test-token");

  beforeEach(() => mockFetch.mockReset());

  it("returns groups with id and title from a board", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          boards: [{
            groups: [
              { id: "backlog", title: "Backlog" },
              { id: "sprint1", title: "Sprint - w/c 30th March" },
              { id: "sprint2", title: "Sprint - w/c 13st April" },
            ],
          }],
        },
      }),
    });

    const groups = await client.getGroups("5094486524");

    expect(groups).toEqual([
      { id: "backlog", title: "Backlog" },
      { id: "sprint1", title: "Sprint - w/c 30th March" },
      { id: "sprint2", title: "Sprint - w/c 13st April" },
    ]);
  });

  it("returns empty array on API error", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const groups = await client.getGroups("5094486524");

    expect(groups).toEqual([]);
  });
});

describe("MondayClient.getGroupItems", () => {
  const client = new MondayClient("test-token");

  beforeEach(() => mockFetch.mockReset());

  it("returns items with name, status, and owner", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          boards: [{
            groups: [{
              items_page: {
                items: [
                  {
                    id: "1",
                    name: "Build revenue dashboard",
                    column_values: [
                      { id: "project_status", text: "Working on it" },
                      { id: "person", text: "Matt Rance" },
                    ],
                  },
                  {
                    id: "2",
                    name: "Fix data pipeline",
                    column_values: [
                      { id: "project_status", text: "Done" },
                    ],
                  },
                ],
              },
            }],
          }],
        },
      }),
    });

    const items = await client.getGroupItems("5094486524", "sprint1");

    expect(items).toEqual([
      { id: "1", name: "Build revenue dashboard", status: "Working on it", owner: "Matt Rance" },
      { id: "2", name: "Fix data pipeline", status: "Done", owner: null },
    ]);
  });

  it("returns empty array on API error", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const items = await client.getGroupItems("5094486524", "sprint1");

    expect(items).toEqual([]);
  });
});
