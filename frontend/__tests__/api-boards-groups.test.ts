const mockCreateGroup = jest.fn();

jest.mock("@/lib/boards", () => ({
  createGroup: (...args: any[]) => mockCreateGroup(...args),
}));

import { POST } from "@/app/api/boards/[id]/groups/route";

type RouteContext = { params: Promise<{ id: string }> };

function makeContext(id: string): RouteContext {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/boards/[id]/groups", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a group and returns it", async () => {
    const savedRecord = { id: "group-1", name: "Backlog", board_id: "board-1", position: 0 };
    mockCreateGroup.mockResolvedValue(savedRecord);

    const request = new Request("http://localhost/api/boards/board-1/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Backlog" }),
    });

    const response = await POST(request, makeContext("board-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.group).toEqual(savedRecord);
    expect(mockCreateGroup).toHaveBeenCalledWith("board-1", "Backlog");
  });

  it("returns 400 when name is missing", async () => {
    const request = new Request("http://localhost/api/boards/board-1/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request, makeContext("board-1"));
    expect(response.status).toBe(400);
  });
});
