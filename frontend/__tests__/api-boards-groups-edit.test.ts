const mockUpdateGroup = jest.fn();
const mockDeleteGroup = jest.fn();

jest.mock("@/lib/boards", () => ({
  updateGroup: (...args: any[]) => mockUpdateGroup(...args),
  deleteGroup: (...args: any[]) => mockDeleteGroup(...args),
}));

import { PATCH, DELETE } from "@/app/api/boards/[id]/groups/[groupId]/route";

type RouteContext = { params: Promise<{ id: string; groupId: string }> };

function makeContext(id: string, groupId: string): RouteContext {
  return { params: Promise.resolve({ id, groupId }) };
}

describe("PATCH /api/boards/[id]/groups/[groupId]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates group name and returns the updated group", async () => {
    const updated = { id: "group-1", name: "Sprint 2", position: 0 };
    mockUpdateGroup.mockResolvedValue(updated);

    const request = new Request("http://localhost/api/boards/board-1/groups/group-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Sprint 2" }),
    });

    const response = await PATCH(request, makeContext("board-1", "group-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.group).toEqual(updated);
    expect(mockUpdateGroup).toHaveBeenCalledWith("group-1", { name: "Sprint 2" });
  });

  it("returns 400 when body is empty", async () => {
    const request = new Request("http://localhost/api/boards/board-1/groups/group-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await PATCH(request, makeContext("board-1", "group-1"));
    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/boards/[id]/groups/[groupId]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes a group and returns success", async () => {
    mockDeleteGroup.mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/boards/board-1/groups/group-1", { method: "DELETE" });
    const response = await DELETE(request, makeContext("board-1", "group-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
