import { extractFields, type ConversationMessage } from "@/lib/conversation";

describe("Field extraction from conversation", () => {
  test("extracts 'what they need' when user describes their request", () => {
    const messages: ConversationMessage[] = [
      { role: "assistant", content: "Hi! What can I help you with today?" },
      {
        role: "user",
        content:
          "We need a dashboard that shows ad revenue broken down by brand",
      },
    ];

    const fields = extractFields(messages);

    expect(fields.whatTheyNeed).toBeTruthy();
    expect(fields.whatTheyNeed).toContain("dashboard");
  });
});
