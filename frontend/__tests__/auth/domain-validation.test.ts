import { isAllowedDomain } from "@/lib/auth";

describe("Domain validation", () => {
  test("allows immediate.co.uk emails", () => {
    expect(isAllowedDomain("matt@immediate.co.uk")).toBe(true);
  });

  test("rejects non-immediate.co.uk emails", () => {
    expect(isAllowedDomain("someone@gmail.com")).toBe(false);
  });

  test("rejects emails with no domain", () => {
    expect(isAllowedDomain("nodomain")).toBe(false);
  });

  test("rejects empty string", () => {
    expect(isAllowedDomain("")).toBe(false);
  });

  test("is case-insensitive", () => {
    expect(isAllowedDomain("Matt@IMMEDIATE.CO.UK")).toBe(true);
  });
});
