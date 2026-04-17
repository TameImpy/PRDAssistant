import {
  createBoard, getBoards, getBoardById, deleteBoard,
  createGroup, getGroupsByBoardId, deleteGroup, updateGroup,
  createBoardItem, getBoardItemsByBoardId, updateBoardItem, deleteBoardItem,
} from "@/lib/boards";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: jest.fn(),
}));

import { createSupabaseClient } from "@/lib/supabase";

function mockSupabaseInsert(returnData: any, error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: returnData, error }),
        }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

describe("createBoard", () => {
  it("stores a board and returns it with name and creator email", async () => {
    const savedRecord = {
      id: "board-1",
      name: "Sprint Board",
      created_by_email: "matt@immediate.co.uk",
      created_at: "2026-04-16T12:00:00Z",
    };
    const mockClient = mockSupabaseInsert(savedRecord);

    const result = await createBoard("Sprint Board", "matt@immediate.co.uk");

    expect(result).toEqual(savedRecord);
    expect(mockClient.from).toHaveBeenCalledWith("boards");
  });

  it("throws when supabase insert fails", async () => {
    mockSupabaseInsert(null, { message: "insert failed" });

    await expect(createBoard("Test", "matt@immediate.co.uk")).rejects.toThrow("insert failed");
  });
});

function mockSupabaseSelect(rows: any[], error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: rows, error }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

function mockSupabaseSelectSingle(row: any | null, error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: row, error }),
        }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

function mockSupabaseDelete(error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

describe("getBoards", () => {
  it("returns all boards sorted by created_at descending", async () => {
    const rows = [
      { id: "board-2", name: "Newer Board", created_at: "2026-04-16T14:00:00Z" },
      { id: "board-1", name: "Older Board", created_at: "2026-04-16T12:00:00Z" },
    ];
    const mockClient = mockSupabaseSelect(rows);

    const result = await getBoards();

    expect(result).toEqual(rows);
    expect(mockClient.from).toHaveBeenCalledWith("boards");
  });
});

describe("getBoardById", () => {
  it("returns a board when found", async () => {
    const board = { id: "board-1", name: "Sprint Board" };
    mockSupabaseSelectSingle(board);

    const result = await getBoardById("board-1");
    expect(result).toEqual(board);
  });

  it("returns null when not found", async () => {
    mockSupabaseSelectSingle(null, { code: "PGRST116" });

    const result = await getBoardById("nonexistent");
    expect(result).toBeNull();
  });
});

describe("deleteBoard", () => {
  it("deletes a board by id", async () => {
    const mockClient = mockSupabaseDelete();

    await deleteBoard("board-1");

    expect(mockClient.from).toHaveBeenCalledWith("boards");
  });

  it("throws when delete fails", async () => {
    mockSupabaseDelete({ message: "delete failed" });

    await expect(deleteBoard("board-1")).rejects.toThrow("delete failed");
  });
});

function mockSupabaseSelectWithEqAndOrder(rows: any[], error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: rows, error }),
        }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

describe("createGroup", () => {
  it("stores a group and returns it with board_id and position", async () => {
    const savedRecord = {
      id: "group-1",
      name: "Backlog",
      board_id: "board-1",
      position: 0,
      created_at: "2026-04-16T12:00:00Z",
    };
    // createGroup makes two calls: one to get max position, one to insert
    const mockClient = {
      from: jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: savedRecord, error: null }),
            }),
          }),
        }),
    };
    (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);

    const result = await createGroup("board-1", "Backlog");

    expect(result).toEqual(savedRecord);
    expect(mockClient.from).toHaveBeenCalledWith("groups");
  });
});

describe("getGroupsByBoardId", () => {
  it("returns groups for a board sorted by position", async () => {
    const rows = [
      { id: "group-1", name: "Backlog", board_id: "board-1", position: 0 },
      { id: "group-2", name: "Sprint 1", board_id: "board-1", position: 1 },
    ];
    const mockClient = mockSupabaseSelectWithEqAndOrder(rows);

    const result = await getGroupsByBoardId("board-1");

    expect(result).toEqual(rows);
    expect(mockClient.from).toHaveBeenCalledWith("groups");
  });
});

const SAMPLE_ITEM_INPUT = {
  name: "Build revenue dashboard",
  description: "Need visibility into revenue data",
  status: "Not Started" as const,
  priority: "High" as const,
  type: "Story" as const,
  team: "Sales",
  estimate: 5,
  dependencies: "None",
  issue_description: "Revenue dashboard for sales team",
  owner: "Matt Rance",
  due_date: "2026-05-01",
};

describe("createBoardItem", () => {
  it("stores an item in a group and returns it", async () => {
    const savedRecord = {
      id: "item-1",
      ...SAMPLE_ITEM_INPUT,
      group_id: "group-1",
      position: 0,
      created_at: "2026-04-16T12:00:00Z",
      updated_at: "2026-04-16T12:00:00Z",
    };
    // createBoardItem makes two calls: one to get max position, one to insert
    const mockClient = {
      from: jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: savedRecord, error: null }),
            }),
          }),
        }),
    };
    (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);

    const result = await createBoardItem("group-1", SAMPLE_ITEM_INPUT);

    expect(result).toEqual(savedRecord);
    expect(mockClient.from).toHaveBeenCalledWith("items");
  });
});

describe("getBoardItemsByBoardId", () => {
  it("returns items for a board via group join, sorted by position", async () => {
    const rows = [
      { id: "item-1", name: "Task A", group_id: "group-1", position: 0 },
      { id: "item-2", name: "Task B", group_id: "group-1", position: 1 },
    ];
    // This uses a join query: select from items where group.board_id = boardId
    const mockClient = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: rows, error: null }),
          }),
        }),
      }),
    };
    (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);

    const result = await getBoardItemsByBoardId("board-1");

    expect(result).toEqual(rows);
    expect(mockClient.from).toHaveBeenCalledWith("items");
  });
});

function mockSupabaseUpdate(returnData: any, error: any = null) {
  const mockClient = {
    from: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: returnData, error }),
          }),
        }),
      }),
    }),
  };
  (createSupabaseClient as jest.Mock).mockReturnValue(mockClient);
  return mockClient;
}

describe("updateBoardItem", () => {
  it("updates specified fields and returns the updated item", async () => {
    const updatedRecord = {
      id: "item-1",
      name: "Updated task",
      status: "Working on it",
      priority: "High",
      updated_at: "2026-04-17T12:00:00Z",
    };
    const mockClient = mockSupabaseUpdate(updatedRecord);

    const result = await updateBoardItem("item-1", { status: "Working on it", priority: "High" });

    expect(result).toEqual(updatedRecord);
    expect(mockClient.from).toHaveBeenCalledWith("items");
  });

  it("throws when update fails", async () => {
    mockSupabaseUpdate(null, { message: "update failed" });

    await expect(updateBoardItem("item-1", { status: "Done" })).rejects.toThrow("update failed");
  });
});

describe("deleteBoardItem", () => {
  it("deletes an item by id", async () => {
    const mockClient = mockSupabaseDelete();

    await deleteBoardItem("item-1");

    expect(mockClient.from).toHaveBeenCalledWith("items");
  });
});

describe("updateGroup", () => {
  it("updates group fields and returns the updated group", async () => {
    const updatedRecord = { id: "group-1", name: "Renamed Group", position: 0 };
    const mockClient = mockSupabaseUpdate(updatedRecord);

    const result = await updateGroup("group-1", { name: "Renamed Group" });

    expect(result).toEqual(updatedRecord);
    expect(mockClient.from).toHaveBeenCalledWith("groups");
  });
});

describe("deleteGroup", () => {
  it("deletes a group by id", async () => {
    const mockClient = mockSupabaseDelete();

    await deleteGroup("group-1");

    expect(mockClient.from).toHaveBeenCalledWith("groups");
  });
});
