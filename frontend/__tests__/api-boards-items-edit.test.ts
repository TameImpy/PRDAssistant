const mockUpdateBoardItem = jest.fn();
const mockDeleteBoardItem = jest.fn();

jest.mock("@/lib/boards", () => ({
  updateBoardItem: (...args: any[]) => mockUpdateBoardItem(...args),
  deleteBoardItem: (...args: any[]) => mockDeleteBoardItem(...args),
}));

import { PATCH, DELETE } from "@/app/api/boards/[id]/items/[itemId]/route";

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

function makeContext(id: string, itemId: string): RouteContext {
  return { params: Promise.resolve({ id, itemId }) };
}

describe("PATCH /api/boards/[id]/items/[itemId]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates item fields and returns the updated item", async () => {
    const updated = { id: "item-1", status: "Done", priority: "High" };
    mockUpdateBoardItem.mockResolvedValue(updated);

    const request = new Request("http://localhost/api/boards/board-1/items/item-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Done", priority: "High" }),
    });

    const response = await PATCH(request, makeContext("board-1", "item-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.item).toEqual(updated);
    expect(mockUpdateBoardItem).toHaveBeenCalledWith("item-1", { status: "Done", priority: "High" });
  });

  it("returns 400 when body is empty", async () => {
    const request = new Request("http://localhost/api/boards/board-1/items/item-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await PATCH(request, makeContext("board-1", "item-1"));
    expect(response.status).toBe(400);
  });

  it("returns 500 when update fails", async () => {
    mockUpdateBoardItem.mockRejectedValue(new Error("update failed"));

    const request = new Request("http://localhost/api/boards/board-1/items/item-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Done" }),
    });

    const response = await PATCH(request, makeContext("board-1", "item-1"));
    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/boards/[id]/items/[itemId]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes an item and returns success", async () => {
    mockDeleteBoardItem.mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/boards/board-1/items/item-1", { method: "DELETE" });
    const response = await DELETE(request, makeContext("board-1", "item-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
