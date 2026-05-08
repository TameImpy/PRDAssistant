import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { parseQuestionnaire } from "@/lib/survey-parser";
import type { ParsedQuestionnaire } from "@/lib/survey-parser";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
});

const EXTEND_SYSTEM_PROMPT = `You are an expert survey questionnaire writer for consumer research at a media company.

You will receive an existing survey questionnaire and an instruction describing what additional questions to add.

Rules:
- Generate only the new questions requested — do not repeat or rewrite any existing questions
- New questions must not duplicate topics already covered in the existing questionnaire
- Follow the same format as the existing questionnaire exactly
- Number new questions starting from the next available number (provided in the prompt)
- Every question must include: BASE label, QUESTION TYPE label, bold question text, answer options
- Do not include routing instructions unless the instruction explicitly asks for them

Output format — every question block must follow this structure exactly:

BASE: [audience filter, e.g. ASK ALL or describe the qualifying condition]
QUESTION TYPE: [SINGLE SELECT / MULTI SELECT / TEXTBOX]

**Q[n]. [Question text]**

[Answer option 1]
[Answer option 2]

---`;

function buildExtendPrompt(
  questionnaire: ParsedQuestionnaire,
  instruction: string,
  nextNumber: number
): string {
  const existingSummary = questionnaire.questions
    .map((q) => `${q.id}. ${q.questionText}`)
    .join("\n");

  return `Existing questionnaire questions (do not repeat these):
${existingSummary}

Instruction for new questions: ${instruction}

Start numbering from Q${nextNumber}. Generate only the new questions.`;
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function POST(request: NextRequest) {
  let body: { questionnaire: ParsedQuestionnaire; instruction: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.instruction?.trim()) {
    return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
  }

  const nextNumber = body.questionnaire.questions.length + 1;

  let responseText: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: EXTEND_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildExtendPrompt(body.questionnaire, body.instruction, nextNumber),
        },
      ],
    });
    responseText = extractText(response);
  } catch (error) {
    console.error("Extend API error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions — the AI service returned an error. Please try again." },
      { status: 502 }
    );
  }

  const parsed = parseQuestionnaire(responseText);

  if (parsed.questions.length === 0) {
    return NextResponse.json(
      { error: "No new questions could be parsed from the response. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ questions: parsed.questions });
}
