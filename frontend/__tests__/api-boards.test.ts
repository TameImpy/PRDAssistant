const mockCreateBoard = jest.fn();
const mockGetBoards = jest.fn();

jest.mock("@/lib/boards", () => ({
  createBoard: (...args: any[]) => mockCreateBoard(...args),
  getBoards: (...args: any[]) => mockGetBoards(...args),
}));

import { POST, GET } from "@/app/api/boards/route";

describe("POST /api/boards", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a board and returns it", async () => {
    const savedRecord = { id: "board-1", name: "Sprint Board", created_by_email: "matt@immediate.co.uk", created_at: "2026-04-16T12:00:00Z" };
    mockCreateBoard.mockResolvedValue(savedRecord);

    const request = new Request("http://localhost/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Sprint Board", created_by_email: "matt@immediate.co.uk" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.board).toEqual(savedRecord);
    expect(mockCreateBoard).toHaveBeenCalledWith("Sprint Board", "matt@immediate.co.uk");
  });

  it("returns 400 when name is missing", async () => {
    const request = new Request("http://localhost/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ created_by_email: "matt@immediate.co.uk" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 500 when Supabase fails", async () => {
    mockCreateBoard.mockRejectedValue(new Error("connection failed"));

    const request = new Request("http://localhost/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", created_by_email: "matt@immediate.co.uk" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});

describe("GET /api/boards", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns all boards", async () => {
    const boards = [
      { id: "board-1", name: "Sprint Board" },
      { id: "board-2", name: "Other Board" },
    ];
    mockGetBoards.mockResolvedValue(boards);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.boards).toEqual(boards);
  });
});
