const mockCreateBoardItem = jest.fn();
const mockGetBoardItemsByBoardId = jest.fn();

jest.mock("@/lib/boards", () => ({
  createBoardItem: (...args: any[]) => mockCreateBoardItem(...args),
  getBoardItemsByBoardId: (...args: any[]) => mockGetBoardItemsByBoardId(...args),
}));

import { POST } from "@/app/api/boards/[id]/groups/[groupId]/items/route";
import { GET } from "@/app/api/boards/[id]/items/route";

type GroupItemContext = { params: Promise<{ id: string; groupId: string }> };
type BoardItemContext = { params: Promise<{ id: string }> };

describe("POST /api/boards/[id]/groups/[groupId]/items", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates an item and returns it", async () => {
    const savedRecord = { id: "item-1", name: "Build dashboard", group_id: "group-1", position: 0 };
    mockCreateBoardItem.mockResolvedValue(savedRecord);

    const request = new Request("http://localhost/api/boards/board-1/groups/group-1/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Build dashboard", priority: "High" }),
    });

    const context: GroupItemContext = { params: Promise.resolve({ id: "board-1", groupId: "group-1" }) };
    const response = await POST(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.item).toEqual(savedRecord);
    expect(mockCreateBoardItem).toHaveBeenCalledWith("group-1", expect.objectContaining({ name: "Build dashboard", priority: "High" }));
  });

  it("returns 400 when name is missing", async () => {
    const request = new Request("http://localhost/api/boards/board-1/groups/group-1/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: "High" }),
    });

    const context: GroupItemContext = { params: Promise.resolve({ id: "board-1", groupId: "group-1" }) };
    const response = await POST(request, context);
    expect(response.status).toBe(400);
  });
});

describe("GET /api/boards/[id]/items", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all items for a board", async () => {
    const items = [
      { id: "item-1", name: "Task A", group_id: "group-1" },
      { id: "item-2", name: "Task B", group_id: "group-2" },
    ];
    mockGetBoardItemsByBoardId.mockResolvedValue(items);

    const request = new Request("http://localhost/api/boards/board-1/items");
    const context: BoardItemContext = { params: Promise.resolve({ id: "board-1" }) };
    const response = await GET(request, context);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toEqual(items);
  });
});
