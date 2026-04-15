const mockGetCachedSprintData = jest.fn();

jest.mock("@/lib/sprint-cache", () => ({
  getCachedSprintData: (...args: any[]) => mockGetCachedSprintData(...args),
}));

import { GET } from "@/app/api/sprint/route";

describe("GET /api/sprint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONDAY_API_TOKEN = "test-token";
    process.env.MONDAY_BOARD_ID = "5094486524";
  });

  it("returns current and previous sprint data", async () => {
    mockGetCachedSprintData.mockResolvedValue({
      currentSprint: {
        name: "Sprint - w/c 13st April",
        items: [{ id: "1", name: "POC dashboard", status: "Not Started", owner: "Matt" }],
      },
      previousSprint: {
        name: "Sprint - w/c 30th March",
        items: [
          { id: "2", name: "Ad-hoc report", status: "Done", owner: "Sarah" },
          { id: "3", name: "Stuck task", status: "Stuck", owner: "Tom" },
        ],
        doneItems: [{ id: "2", name: "Ad-hoc report", status: "Done", owner: "Sarah" }],
      },
      cachedAt: "2026-04-15T12:00:00Z",
    });

    const request = new Request("http://localhost/api/sprint");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.currentSprint.name).toBe("Sprint - w/c 13st April");
    expect(data.currentSprint.items).toHaveLength(1);
    expect(data.previousSprint.doneItems).toHaveLength(1);
    expect(data.cachedAt).toBeDefined();
  });

  it("passes refresh=true to cache when query param is set", async () => {
    mockGetCachedSprintData.mockResolvedValue({
      currentSprint: null,
      previousSprint: null,
      cachedAt: "2026-04-15T12:00:00Z",
    });

    const request = new Request("http://localhost/api/sprint?refresh=true");
    await GET(request);

    expect(mockGetCachedSprintData).toHaveBeenCalledWith(
      "5094486524",
      true
    );
  });
});
