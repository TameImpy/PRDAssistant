export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ExtractedFields = {
  whatTheyNeed: string | null;
  whoBenefits: string | null;
  whyItMatters: string | null;
  successCriteria: string | null;
};

const EMPTY_FIELDS: ExtractedFields = {
  whatTheyNeed: null,
  whoBenefits: null,
  whyItMatters: null,
  successCriteria: null,
};

export function extractFields(messages: ConversationMessage[]): ExtractedFields {
  const fields = { ...EMPTY_FIELDS };

  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

  if (!userMessages) return fields;

  // Extract what they need — the first substantive user message typically contains the request
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (firstUserMessage) {
    fields.whatTheyNeed = firstUserMessage.content;
  }

  return fields;
}

const MANDATORY_FIELDS: (keyof ExtractedFields)[] = [
  "whatTheyNeed",
  "whoBenefits",
  "whyItMatters",
  "successCriteria",
];

export function getMissingFields(fields: ExtractedFields): string[] {
  return MANDATORY_FIELDS.filter((key) => !fields[key]);
}

export function isConversationComplete(fields: ExtractedFields): boolean {
  return getMissingFields(fields).length === 0;
}

export type Pathway = "stakeholder" | "analyst";

export function getSystemPrompt(
  pathway: Pathway,
  missingFields: string[]
): string {
  if (pathway === "stakeholder") {
    return `You are a friendly, warm, and encouraging assistant helping someone submit a data request to the Commercial Analysts team at Immediate Media.

Your job is to understand what they need through a natural conversation. Be approachable and supportive — make them feel comfortable sharing their request. Never use technical terminology.

You need to capture the following information through the conversation:
- What they need: what data, report, dashboard, or analysis are they looking for?
- Who benefits: who will use this and how does it help them?
- Why it matters: what problem does this solve or what opportunity does it unlock?
- What success looks like: how will they know this request has been fulfilled well?

${missingFields.length > 0 ? `You still need to find out about: ${missingFields.join(", ")}. Ask about these naturally — don't list them as a checklist.` : "You have gathered all the key information. Summarise what you've heard back to the user in plain language and ask them to confirm it's correct."}

Guidelines:
- Keep your responses concise and conversational
- Ask one question at a time
- If the user is vague, gently probe with concrete examples
- Skip questions the user has already answered naturally
- Never mention tickets, points, criteria, or any project management terminology
- Be warm and encouraging throughout — make them want to come back`;
  }

  // Analyst path
  return `You are an assistant helping a Commercial Analyst at Immediate Media create well-structured agile tickets.

You should use proper agile terminology throughout. Your job is to help the analyst define:
- User story in "As a [persona], I want [goal] so that [reason]" format
- Acceptance criteria in Given-When-Then (BDD) format
- Story point estimate using the scale: 1 (trivial, 0.5 days), 2 (small, 1 day), 3 (medium, 1.5 days), 5 (moderate, 3 days), 8 (large, 5 days), 13 (very large, 7+ days)
- Ticket type: Story, Bug, or Spike
- Dependencies (mandatory — any blockers or required inputs from other teams)

${missingFields.length > 0 ? `You still need to capture: ${missingFields.join(", ")}. Ask about these.` : "You have all the information needed. Summarise the ticket(s) you'll create and ask the analyst to confirm."}

Guidelines:
- If the total work exceeds 13 story points, suggest breaking it into an epic with constituent stories
- Be concise and technical — the analyst knows agile
- Ask about dependencies explicitly — this is a mandatory field
- Suggest story points based on the complexity described, but let the analyst override
- Help refine acceptance criteria to be specific and testable`;
}
