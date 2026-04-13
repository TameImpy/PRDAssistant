import { isConversationComplete, type ExtractedFields } from "@/lib/conversation";

describe("Conversation completion", () => {
  test("returns false when fields are missing", () => {
    const fields: ExtractedFields = {
      whatTheyNeed: "a revenue dashboard",
      whoBenefits: null,
      whyItMatters: null,
      successCriteria: null,
    };

    expect(isConversationComplete(fields)).toBe(false);
  });

  test("returns true when all mandatory fields are captured", () => {
    const fields: ExtractedFields = {
      whatTheyNeed: "a revenue dashboard by brand",
      whoBenefits: "the sales team",
      whyItMatters: "they can't currently see revenue by brand which slows decision making",
      successCriteria: "sales team can filter by brand and date range and export to CSV",
    };

    expect(isConversationComplete(fields)).toBe(true);
  });
});
