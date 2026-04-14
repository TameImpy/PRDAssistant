import {
  extractFields,
  getMissingFields,
  type ConversationMessage,
} from "@/lib/conversation";

describe("Missing field detection", () => {
  test("identifies all fields as missing when conversation just started", () => {
    const messages: ConversationMessage[] = [
      { role: "assistant", content: "Hi! What can I help you with today?" },
    ];

    const fields = extractFields(messages);
    const missing = getMissingFields(fields);

    expect(missing).toContain("whatTheyNeed");
    expect(missing).toContain("whoBenefits");
    expect(missing).toContain("whyItMatters");
    expect(missing).toContain("successCriteria");
    expect(missing).toContain("requestedBy");
    expect(missing).toHaveLength(5);
  });

  test("removes 'whatTheyNeed' from missing when user describes request", () => {
    const messages: ConversationMessage[] = [
      { role: "assistant", content: "Hi! What can I help you with today?" },
      {
        role: "user",
        content: "We need a revenue dashboard by brand",
      },
    ];

    const fields = extractFields(messages);
    const missing = getMissingFields(fields);

    expect(missing).not.toContain("whatTheyNeed");
    expect(missing).toContain("whoBenefits");
    expect(missing).toContain("whyItMatters");
    expect(missing).toContain("successCriteria");
  });
});
