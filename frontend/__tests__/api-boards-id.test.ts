const mockGetBoardById = jest.fn();
const mockDeleteBoard = jest.fn();

jest.mock("@/lib/boards", () => ({
  getBoardById: (...args: any[]) => mockGetBoardById(...args),
  deleteBoard: (...args: any[]) => mockDeleteBoard(...args),
}));

import { GET, DELETE } from "@/app/api/boards/[id]/route";

type RouteContext = { params: Promise<{ id: string }> };

function makeContext(id: string): RouteContext {
  return { params: Promise.resolve({ id }) };
}

describe("GET /api/boards/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns a board when found", async () => {
    const board = { id: "board-1", name: "Sprint Board" };
    mockGetBoardById.mockResolvedValue(board);

    const request = new Request("http://localhost/api/boards/board-1");
    const response = await GET(request, makeContext("board-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.board).toEqual(board);
  });

  it("returns 404 when not found", async () => {
    mockGetBoardById.mockResolvedValue(null);

    const request = new Request("http://localhost/api/boards/nonexistent");
    const response = await GET(request, makeContext("nonexistent"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/boards/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes a board and returns success", async () => {
    mockDeleteBoard.mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/boards/board-1", { method: "DELETE" });
    const response = await DELETE(request, makeContext("board-1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDeleteBoard).toHaveBeenCalledWith("board-1");
  });

  it("returns 500 when delete fails", async () => {
    mockDeleteBoard.mockRejectedValue(new Error("delete failed"));

    const request = new Request("http://localhost/api/boards/board-1", { method: "DELETE" });
    const response = await DELETE(request, makeContext("board-1"));

    expect(response.status).toBe(500);
  });
});
