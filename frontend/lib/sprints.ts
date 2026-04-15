const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

const SPRINT_PATTERN = /sprint\s*-\s*w\/c\s+(\d{1,2})\w*\s+(\w+)/i;

export function parseSprintDate(groupName: string): Date | null {
  const match = groupName.match(SPRINT_PATTERN);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();
  const month = MONTHS[monthName];

  if (month === undefined || isNaN(day)) return null;

  const now = new Date();
  const year = now.getFullYear();
  const date = new Date(year, month, day);

  // If the parsed date is more than 6 months in the future, assume it's from last year
  if (date.getTime() - now.getTime() > 6 * 30 * 24 * 60 * 60 * 1000) {
    date.setFullYear(year - 1);
  }

  return date;
}

export type SprintGroup = {
  id: string;
  title: string;
};

export type SprintIdentification = {
  current: SprintGroup | null;
  previous: SprintGroup | null;
};

export function identifyCurrentAndPreviousSprint(
  groups: SprintGroup[]
): SprintIdentification {
  const sprintGroups = groups
    .map((group) => ({ group, date: parseSprintDate(group.title) }))
    .filter((entry): entry is { group: SprintGroup; date: Date } => entry.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    current: sprintGroups[0]?.group ?? null,
    previous: sprintGroups[1]?.group ?? null,
  };
}
