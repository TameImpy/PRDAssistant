import { shouldBeEpic, getEpicTShirtSize } from "@/lib/tickets";

describe("Epic detection", () => {
  test("returns false for total points <= 13", () => {
    expect(shouldBeEpic(13)).toBe(false);
    expect(shouldBeEpic(5)).toBe(false);
    expect(shouldBeEpic(1)).toBe(false);
  });

  test("returns true for total points > 13", () => {
    expect(shouldBeEpic(14)).toBe(true);
    expect(shouldBeEpic(25)).toBe(true);
    expect(shouldBeEpic(100)).toBe(true);
  });
});

describe("Epic T-shirt sizing", () => {
  test("maps story points to T-shirt sizes", () => {
    expect(getEpicTShirtSize(10)).toBe("XS");
    expect(getEpicTShirtSize(20)).toBe("S");
    expect(getEpicTShirtSize(40)).toBe("M");
    expect(getEpicTShirtSize(75)).toBe("L");
    expect(getEpicTShirtSize(150)).toBe("XL");
    expect(getEpicTShirtSize(250)).toBe("XXL");
  });
});
