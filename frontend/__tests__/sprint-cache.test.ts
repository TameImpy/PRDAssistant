const mockGetGroups = jest.fn();
const mockGetGroupItems = jest.fn();

jest.mock("@/lib/monday", () => ({
  MondayClient: jest.fn().mockImplementation(() => ({
    getGroups: (...args: any[]) => mockGetGroups(...args),
    getGroupItems: (...args: any[]) => mockGetGroupItems(...args),
  })),
  COLUMN_IDS: { status: "project_status" },
}));

describe("getCachedSprintData", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv, MONDAY_API_TOKEN: "test-token" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("fetches from Monday.com and identifies sprints correctly", async () => {
    const { getCachedSprintData } = await import("@/lib/sprint-cache");

    mockGetGroups.mockResolvedValue([
      { id: "backlog", title: "Backlog" },
      { id: "s1", title: "Sprint - w/c 30th March" },
      { id: "s2", title: "Sprint - w/c 13st April" },
    ]);
    mockGetGroupItems
      .mockResolvedValueOnce([{ id: "1", name: "Task A", status: "Working on it", owner: "Matt" }])
      .mockResolvedValueOnce([
        { id: "2", name: "Task B", status: "Done", owner: "Sarah" },
        { id: "3", name: "Task C", status: "Stuck", owner: null },
      ]);

    const data = await getCachedSprintData("123", true);

    expect(data.currentSprint?.name).toBe("Sprint - w/c 13st April");
    expect(data.currentSprint?.items).toHaveLength(1);
    expect(data.previousSprint?.doneItems).toHaveLength(1);
    expect(data.previousSprint?.doneItems[0].name).toBe("Task B");
    expect(data.cachedAt).toBeDefined();
  });
});
