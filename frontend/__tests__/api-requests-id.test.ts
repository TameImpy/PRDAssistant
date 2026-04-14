const mockGetRequestById = jest.fn();
const mockUpdateRequestTickets = jest.fn();

jest.mock("@/lib/requests", () => ({
  getRequestById: (...args: any[]) => mockGetRequestById(...args),
  updateRequestTickets: (...args: any[]) => mockUpdateRequestTickets(...args),
}));

import { GET, PATCH } from "@/app/api/requests/[id]/route";

describe("GET /api/requests/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the request when found", async () => {
    const record = { id: "abc-123", status: "Open", tickets: [] };
    mockGetRequestById.mockResolvedValue(record);

    const request = new Request("http://localhost/api/requests/abc-123");
    const response = await GET(request, { params: Promise.resolve({ id: "abc-123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.request.id).toBe("abc-123");
  });

  it("returns 404 when not found", async () => {
    mockGetRequestById.mockResolvedValue(null);

    const request = new Request("http://localhost/api/requests/nope");
    const response = await GET(request, { params: Promise.resolve({ id: "nope" }) });

    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/requests/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates tickets and returns success", async () => {
    mockUpdateRequestTickets.mockResolvedValue(undefined);

    const updatedTickets = [{ title: "Updated ticket" }];
    const request = new Request("http://localhost/api/requests/abc-123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickets: updatedTickets }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "abc-123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateRequestTickets).toHaveBeenCalledWith("abc-123", updatedTickets);
  });
});
