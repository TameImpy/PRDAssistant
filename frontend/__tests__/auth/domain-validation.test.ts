import { isAllowedDomain } from "@/lib/auth";

describe("Domain validation", () => {
  test("allows immediatemedia.com emails", () => {
    expect(isAllowedDomain("matt@immediatemedia.com")).toBe(true);
  });

  test("rejects non-immediatemedia.com emails", () => {
    expect(isAllowedDomain("someone@gmail.com")).toBe(false);
  });

  test("rejects emails with no domain", () => {
    expect(isAllowedDomain("nodomain")).toBe(false);
  });

  test("rejects empty string", () => {
    expect(isAllowedDomain("")).toBe(false);
  });

  test("is case-insensitive", () => {
    expect(isAllowedDomain("Matt@ImmediateMedia.COM")).toBe(true);
  });
});
