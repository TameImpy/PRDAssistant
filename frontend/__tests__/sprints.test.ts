import { parseSprintDate, identifyCurrentAndPreviousSprint } from "@/lib/sprints";

describe("parseSprintDate", () => {
  it("extracts a date from a standard sprint group name", () => {
    const result = parseSprintDate("Sprint - w/c 30th March");

    expect(result).toBeInstanceOf(Date);
    expect(result!.getDate()).toBe(30);
    expect(result!.getMonth()).toBe(2); // March = 2
  });

  it("handles various ordinal suffixes", () => {
    expect(parseSprintDate("Sprint - w/c 1st January")!.getDate()).toBe(1);
    expect(parseSprintDate("Sprint - w/c 2nd February")!.getDate()).toBe(2);
    expect(parseSprintDate("Sprint - w/c 3rd March")!.getDate()).toBe(3);
    expect(parseSprintDate("Sprint - w/c 13st April")!.getDate()).toBe(13);
    expect(parseSprintDate("Sprint - w/c 22nd June")!.getDate()).toBe(22);
  });

  it("returns null for non-sprint group names", () => {
    expect(parseSprintDate("Backlog")).toBeNull();
    expect(parseSprintDate("Done")).toBeNull();
    expect(parseSprintDate("")).toBeNull();
    expect(parseSprintDate("Some random group")).toBeNull();
  });
});

describe("identifyCurrentAndPreviousSprint", () => {
  it("returns the two most recent sprints sorted by date", () => {
    const groups = [
      { id: "backlog", title: "Backlog" },
      { id: "sprint1", title: "Sprint - w/c 2nd March" },
      { id: "sprint2", title: "Sprint - w/c 16th March" },
      { id: "sprint3", title: "Sprint - w/c 30th March" },
    ];

    const result = identifyCurrentAndPreviousSprint(groups);

    expect(result.current?.id).toBe("sprint3");
    expect(result.previous?.id).toBe("sprint2");
  });

  it("returns null for previous when only one sprint exists", () => {
    const groups = [
      { id: "backlog", title: "Backlog" },
      { id: "sprint1", title: "Sprint - w/c 13st April" },
    ];

    const result = identifyCurrentAndPreviousSprint(groups);

    expect(result.current?.id).toBe("sprint1");
    expect(result.previous).toBeNull();
  });

  it("returns both null when no sprint groups exist", () => {
    const groups = [
      { id: "backlog", title: "Backlog" },
      { id: "done", title: "Done" },
    ];

    const result = identifyCurrentAndPreviousSprint(groups);

    expect(result.current).toBeNull();
    expect(result.previous).toBeNull();
  });

  it("excludes non-sprint groups from identification", () => {
    const groups = [
      { id: "backlog", title: "Backlog" },
      { id: "sprint1", title: "Sprint - w/c 30th March" },
      { id: "done", title: "Completed Items" },
      { id: "sprint2", title: "Sprint - w/c 13st April" },
    ];

    const result = identifyCurrentAndPreviousSprint(groups);

    expect(result.current?.id).toBe("sprint2");
    expect(result.previous?.id).toBe("sprint1");
  });
});
