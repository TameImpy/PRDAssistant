import Anthropic from "@anthropic-ai/sdk";
import type { ContextSourceType } from "@/lib/context-upload";

export type PreProcessedContext = {
  whatTheyNeed: string | null;
  whoBenefits: string | null;
  whyItMatters: string | null;
  successCriteria: string | null;
  requestedBy: string | null;
  keyDecisions: string[];
  openQuestions: string[];
  constraints: string[];
  deadlines: string[];
  participants: string[];
};

export type PreProcessResult = {
  context: PreProcessedContext;
  rawText: string;
};

const EMPTY_CONTEXT: PreProcessedContext = {
  whatTheyNeed: null,
  whoBenefits: null,
  whyItMatters: null,
  successCriteria: null,
  requestedBy: null,
  keyDecisions: [],
  openQuestions: [],
  constraints: [],
  deadlines: [],
  participants: [],
};

const PREPROCESS_PROMPT = `You are an expert requirements analyst. You will receive one or more pieces of context from conversations between analysts and stakeholders (call transcripts, email threads, or Teams chats). Each piece is labelled with its source type.

Analyze all provided context and extract structured information. Return ONLY valid JSON in this exact format:

{
  "whatTheyNeed": "concise summary of the data request or null if unclear",
  "whoBenefits": "who will use this and how, or null",
  "whyItMatters": "the problem this solves or opportunity it unlocks, or null",
  "successCriteria": "how they'll know the request is fulfilled, or null",
  "requestedBy": "name and role/team of the person requesting, or null",
  "keyDecisions": ["decisions already made in the conversation"],
  "openQuestions": ["things that are ambiguous or need clarification"],
  "constraints": ["limitations or requirements mentioned"],
  "deadlines": ["specific dates or timeframes mentioned"],
  "participants": ["people/roles mentioned and their relationship to the request"]
}

Rules:
- Use null (not the string "null") for fields you cannot determine from the source material
- Use empty arrays [] for list fields with no entries
- Be concise but specific — include exact details, names, dates, and numbers from the source
- For openQuestions, identify things the analyst would need to clarify before creating tickets
- Do not invent information not present in the source material`;

type ContextInput = {
  text: string;
  label: ContextSourceType;
};

export async function preprocessContext(items: ContextInput[]): Promise<PreProcessResult> {
  const rawText = items.map((item) => item.text).join("\n\n---\n\n");

  const userMessage = items
    .map((item, i) => `--- Source ${i + 1}: ${item.label} ---\n\n${item.text}`)
    .join("\n\n");

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: PREPROCESS_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { context: { ...EMPTY_CONTEXT }, rawText };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const context: PreProcessedContext = {
      whatTheyNeed: parsed.whatTheyNeed || null,
      whoBenefits: parsed.whoBenefits || null,
      whyItMatters: parsed.whyItMatters || null,
      successCriteria: parsed.successCriteria || null,
      requestedBy: parsed.requestedBy || null,
      keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : [],
      openQuestions: Array.isArray(parsed.openQuestions) ? parsed.openQuestions : [],
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
      deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
    };

    return { context, rawText };
  } catch (error) {
    console.error("[Preprocess] Failed:", error);
    return { context: { ...EMPTY_CONTEXT }, rawText };
  }
}
