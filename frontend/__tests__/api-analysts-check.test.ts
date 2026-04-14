const mockIsAnalyst = jest.fn();
const mockAuth = jest.fn();

jest.mock("@/lib/analysts", () => ({
  isAnalyst: (...args: any[]) => mockIsAnalyst(...args),
}));

jest.mock("@/lib/auth-provider", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

import { GET } from "@/app/api/analysts/check/route";

describe("GET /api/analysts/check", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns isAnalyst: true when user is an analyst", async () => {
    mockAuth.mockResolvedValue({ user: { email: "matt@immediatemedia.com" } });
    mockIsAnalyst.mockResolvedValue(true);

    const response = await GET();
    const data = await response.json();

    expect(data.isAnalyst).toBe(true);
  });

  it("returns isAnalyst: false when user is not an analyst", async () => {
    mockAuth.mockResolvedValue({ user: { email: "stakeholder@immediatemedia.com" } });
    mockIsAnalyst.mockResolvedValue(false);

    const response = await GET();
    const data = await response.json();

    expect(data.isAnalyst).toBe(false);
  });

  it("returns isAnalyst: false when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(data.isAnalyst).toBe(false);
  });
});
