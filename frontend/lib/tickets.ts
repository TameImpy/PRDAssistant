export type TicketInput = {
  whatTheyNeed: string;
  whoBenefits: string;
  whyItMatters: string;
  successCriteria: string;
  team: string;
};

export type Ticket = {
  title: string;
  userStory: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  priority: "Critical" | "High" | "Medium" | "Low";
  type: "Story" | "Bug" | "Spike";
  team: string;
  dependencies: string;
  issueDescription: string;
};

export function generateTickets(input: TicketInput): Ticket[] {
  const title = generateTitle(input.whatTheyNeed);
  const userStory = `As a ${input.whoBenefits} member, I want ${input.whatTheyNeed}, so that ${input.whyItMatters}.`;

  const acceptanceCriteria = generateAcceptanceCriteria(input.successCriteria);
  const storyPoints = estimateStoryPoints(input.whatTheyNeed);
  const priority = inferPriority(input.whyItMatters);

  return [
    {
      title,
      userStory,
      acceptanceCriteria,
      storyPoints,
      priority,
      type: "Story",
      team: input.team,
      dependencies: "",
      issueDescription: input.whyItMatters,
    },
  ];
}

function generateTitle(whatTheyNeed: string): string {
  // Create a concise title from the request description
  const cleaned = whatTheyNeed
    .replace(/^(a|an|the)\s+/i, "")
    .replace(/\.$/, "");

  // Capitalise first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function generateAcceptanceCriteria(successCriteria: string): string[] {
  // Split success criteria into individual criteria and format as Given-When-Then
  const parts = successCriteria
    .split(/[,;]|and\s/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  return parts.map((part) => {
    return `Given the feature is complete, When a user accesses it, Then ${part.toLowerCase().replace(/^they\s+/i, "they should be able to ")}`;
  });
}

function estimateStoryPoints(whatTheyNeed: string): number {
  const description = whatTheyNeed.toLowerCase();

  // Simple heuristic based on complexity indicators
  const complexityIndicators = [
    "integrate",
    "migration",
    "pipeline",
    "rebuild",
    "redesign",
    "refactor",
    "multiple",
    "complex",
    "automat",
  ];

  const simpleIndicators = [
    "report",
    "update",
    "fix",
    "add",
    "change",
    "rename",
    "simple",
  ];

  const complexCount = complexityIndicators.filter((i) =>
    description.includes(i)
  ).length;
  const simpleCount = simpleIndicators.filter((i) =>
    description.includes(i)
  ).length;

  if (complexCount >= 2) return 8;
  if (complexCount >= 1) return 5;
  if (simpleCount >= 1) return 2;
  return 3; // default medium
}

function inferPriority(
  whyItMatters: string
): "Critical" | "High" | "Medium" | "Low" {
  const text = whyItMatters.toLowerCase();

  const criticalIndicators = [
    "urgent",
    "immediately",
    "critical",
    "broken",
    "down",
    "outage",
  ];
  const highIndicators = [
    "deadline",
    "launch",
    "revenue",
    "compliance",
    "blocking",
    "asap",
  ];
  const lowIndicators = [
    "nice to have",
    "when possible",
    "eventually",
    "low priority",
    "no rush",
  ];

  if (criticalIndicators.some((i) => text.includes(i))) return "Critical";
  if (highIndicators.some((i) => text.includes(i))) return "High";
  if (lowIndicators.some((i) => text.includes(i))) return "Low";
  return "Medium";
}

export function shouldBeEpic(totalStoryPoints: number): boolean {
  return totalStoryPoints > 13;
}

export type TShirtSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export function getEpicTShirtSize(totalStoryPoints: number): TShirtSize {
  if (totalStoryPoints <= 13) return "XS";
  if (totalStoryPoints <= 25) return "S";
  if (totalStoryPoints <= 50) return "M";
  if (totalStoryPoints <= 100) return "L";
  if (totalStoryPoints <= 200) return "XL";
  return "XXL";
}
