import Anthropic from "@anthropic-ai/sdk";

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

const TICKET_GENERATION_PROMPT = `You are an expert agile project manager. Given a data request, generate well-structured tickets.

Return ONLY valid JSON in this exact format (no other text):
{
  "tickets": [
    {
      "title": "Concise, action-oriented title (max 60 characters)",
      "userStory": "As a [specific persona], I want [specific goal], so that [specific business reason].",
      "acceptanceCriteria": [
        "Given [precondition], When [action], Then [expected result]",
        "Given [precondition], When [action], Then [expected result]"
      ],
      "storyPoints": 5,
      "priority": "High",
      "type": "Story",
      "dependencies": "Any blockers or required inputs"
    }
  ]
}

Rules:
- Title must be under 60 characters, action-oriented (e.g. "Build audio revenue dashboard" not "An audio revenue dashboard tracking revenue...")
- User story must use natural language with a specific persona (not "[persona] member")
- Acceptance criteria must each follow Given-When-Then format and be specific and testable
- Story points must be from this scale only: 1 (trivial, 0.5 days), 2 (small, 1 day), 3 (medium, 1.5 days), 5 (moderate, 3 days), 8 (large, 5 days), 13 (very large, 7+ days)
- Priority must be exactly one of: Critical, High, Medium, Low — infer from the business context
- Type must be exactly one of: Story, Bug, Spike
- If the request describes multiple distinct deliverables, create multiple tickets
- If total work would exceed 13 story points, split into multiple smaller tickets`;

export async function generateTickets(input: TicketInput): Promise<Ticket[]> {
  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: TICKET_GENERATION_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate tickets for this request:

What they need: ${input.whatTheyNeed}
Who benefits: ${input.whoBenefits}
Why it matters: ${input.whyItMatters}
Success criteria: ${input.successCriteria}
Team: ${input.team}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Claude response");

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.tickets || !Array.isArray(parsed.tickets)) {
      throw new Error("Invalid ticket structure from Claude");
    }

    // Map Claude's output to our Ticket type, adding team and issueDescription
    return parsed.tickets.map((t: any) => ({
      title: String(t.title || "").slice(0, 60),
      userStory: String(t.userStory || ""),
      acceptanceCriteria: Array.isArray(t.acceptanceCriteria)
        ? t.acceptanceCriteria.map(String)
        : [],
      storyPoints: VALID_POINTS.includes(t.storyPoints) ? t.storyPoints : 3,
      priority: VALID_PRIORITIES.includes(t.priority) ? t.priority : "Medium",
      type: VALID_TYPES.includes(t.type) ? t.type : "Story",
      team: input.team,
      dependencies: String(t.dependencies || "None"),
      issueDescription: input.whyItMatters,
    }));
  } catch (error) {
    console.error("[Tickets] Claude generation failed, using fallback:", error);
    return generateTicketsFallback(input);
  }
}

const VALID_POINTS = [1, 2, 3, 5, 8, 13];
const VALID_PRIORITIES = ["Critical", "High", "Medium", "Low"];
const VALID_TYPES = ["Story", "Bug", "Spike"];

// Rule-based fallback — used when Claude is unavailable
function generateTicketsFallback(input: TicketInput): Ticket[] {
  const title = input.whatTheyNeed
    .replace(/^(a|an|the)\s+/i, "")
    .replace(/\.$/, "")
    .slice(0, 60);

  const userStory = `As a ${input.whoBenefits}, I want ${input.whatTheyNeed}, so that ${input.whyItMatters}.`;

  const acceptanceCriteria = input.successCriteria
    .split(/[,;]|and\s/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .map(
      (part) =>
        `Given the feature is complete, When a user accesses it, Then ${part.toLowerCase()}`
    );

  return [
    {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      userStory,
      acceptanceCriteria,
      storyPoints: 3,
      priority: "Medium",
      type: "Story",
      team: input.team,
      dependencies: "None",
      issueDescription: input.whyItMatters,
    },
  ];
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
