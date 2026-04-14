const mockGetRequestById = jest.fn();
const mockRejectRequest = jest.fn();

jest.mock("@/lib/requests", () => ({
  getRequestById: (...args: any[]) => mockGetRequestById(...args),
  rejectRequest: (...args: any[]) => mockRejectRequest(...args),
}));

import { POST } from "@/app/api/requests/[id]/reject/route";

describe("POST /api/requests/[id]/reject", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects a request with a reason", async () => {
    mockGetRequestById.mockResolvedValue({ id: "abc-123", status: "Open" });
    mockRejectRequest.mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/requests/abc-123/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Too vague, needs more detail" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "abc-123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockRejectRequest).toHaveBeenCalledWith("abc-123", "Too vague, needs more detail");
  });

  it("returns 400 when reason is empty", async () => {
    mockGetRequestById.mockResolvedValue({ id: "abc-123", status: "Open" });

    const request = new Request("http://localhost/api/requests/abc-123/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "abc-123" }) });
    expect(response.status).toBe(400);
  });

  it("returns 400 when request is not Open", async () => {
    mockGetRequestById.mockResolvedValue({ id: "abc-123", status: "Submitted to Backlog" });

    const request = new Request("http://localhost/api/requests/abc-123/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Not needed" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "abc-123" }) });
    expect(response.status).toBe(400);
  });

  it("returns 404 when request not found", async () => {
    mockGetRequestById.mockResolvedValue(null);

    const request = new Request("http://localhost/api/requests/nope/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Not needed" }),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "nope" }) });
    expect(response.status).toBe(404);
  });
});
