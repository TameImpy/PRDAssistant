const mockPreprocessContext = jest.fn();

jest.mock("@/lib/context-preprocess", () => ({
  preprocessContext: (...args: any[]) => mockPreprocessContext(...args),
}));

const mockAuth = jest.fn();

jest.mock("@/lib/auth-provider", () => ({
  auth: () => mockAuth(),
}));

import { POST } from "@/app/api/preprocess/route";
import { NextRequest } from "next/server";

function makeRequest(body: any): NextRequest {
  return new NextRequest("http://localhost/api/preprocess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/preprocess", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ user: { email: "analyst@immediate.co.uk" } });
  });

  test("returns 401 for unauthenticated requests", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await POST(makeRequest({
      items: [{ text: "some text", label: "Email Thread" }],
    }));

    expect(response.status).toBe(401);
  });

  test("returns 400 for empty items array", async () => {
    const response = await POST(makeRequest({ items: [] }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/at least one/i);
  });

  test("returns 400 for missing items", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });

  test("returns 400 for items missing text", async () => {
    const response = await POST(makeRequest({
      items: [{ label: "Email Thread" }],
    }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toMatch(/text and label/i);
  });

  test("returns structured result on success", async () => {
    const mockResult = {
      context: {
        whatTheyNeed: "A dashboard",
        whoBenefits: null,
        whyItMatters: null,
        successCriteria: null,
        requestedBy: null,
        keyDecisions: [],
        openQuestions: ["What data?"],
        constraints: [],
        deadlines: [],
        participants: [],
      },
      rawText: "transcript content",
    };
    mockPreprocessContext.mockResolvedValue(mockResult);

    const response = await POST(makeRequest({
      items: [{ text: "transcript content", label: "Call/Meeting Transcript" }],
    }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.context.whatTheyNeed).toBe("A dashboard");
    expect(data.context.openQuestions).toEqual(["What data?"]);
    expect(data.rawText).toBe("transcript content");
    expect(mockPreprocessContext).toHaveBeenCalledWith([
      { text: "transcript content", label: "Call/Meeting Transcript" },
    ]);
  });
});
