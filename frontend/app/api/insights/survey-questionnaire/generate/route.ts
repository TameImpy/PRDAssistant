import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { parseQuestionnaire, buildQAInput, mergeQAResult } from "@/lib/survey-parser";
import type { SurveyFormData } from "@/components/SurveyIntakeForm";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
});

const GENERATION_SYSTEM_PROMPT = `You are an expert survey questionnaire writer for consumer research at a media company.

Your job is to draft a complete, structured survey questionnaire based on the analyst's inputs.
Think thoroughly before producing output — quality is more important than speed.

Rules:
- Every question must include: BASE label, QUESTION TYPE label, bold question text, answer options
- Routing instructions (SKIP TO Qn, EXCLUSIVE, LOCK OPTION): include only if the analyst has requested routing logic. If routing is not requested, do not add any routing instructions to any answer option.
- Never reference a question number in routing that does not exist in the questionnaire
- Begin the questionnaire with an intro message (brief, friendly, states estimated time)
- If brand guidelines or writing style & tone documents are provided, adapt question language, style, and tone accordingly
- If new wave = Yes and a previous questionnaire is uploaded, preserve exact wording of NPS and tracker questions — do not paraphrase or rewrite these. Mark each preserved question with [TRACKER] in the question text.
- If a target question count range is provided, stay within that range
- If the input is too sparse, flag the assumptions you are making rather than inventing context

Output format — every question block must follow this structure exactly:

BASE: [audience filter, e.g. ASK ALL or describe the qualifying condition]
QUESTION TYPE: [SINGLE SELECT / MULTI SELECT / TEXTBOX]

**Q[n]. [Question text]**

[Answer option 1]
[Answer option 2] – SKIP TO Q[n] [only if routing is needed here]
[Answer option 3] – EXCLUSIVE [only if applicable]
[Answer option 4] – LOCK OPTION [only if applicable]

---`;

const QA_SYSTEM_PROMPT = `You are a critical survey quality reviewer.

You will receive a draft survey questionnaire. Your job is to review every question and rewrite any that fail on one or more of the following criteria:
1. Is this question relevant to the research goal?
2. Is this question unique — does it overlap with another question in the questionnaire?
3. Is the question easy to understand for a general consumer audience?
4. Is the question easy to answer — are the answer options clear and appropriate?
5. Are the answer options exhaustive and mutually exclusive where appropriate?

Rules:
- Rewrite failing questions directly. Do not annotate, flag, or explain changes.
- Do not rewrite questions that are marked as NPS, tracker, or new wave questions — these must remain exactly as written.
- Return only the corrected questionnaire in exactly the same format as the input.
- Do not add or remove questions. Do not change BASE or QUESTION TYPE labels unless the question type genuinely needs correcting.`;

function buildUserPrompt(data: SurveyFormData): string {
  const briefText = data.briefFiles.map((f) => f.text).join("\n\n") || "not provided";
  const prevText = data.previousQuestionnairesFiles.map((f) => f.text).join("\n\n") || "not provided";
  const brandText = data.brandGuidelinesFiles.map((f) => f.text).join("\n\n") || "not provided";

  const min = parseInt(data.minQuestions, 10);
  const max = parseInt(data.maxQuestions, 10);
  const questionRange =
    !isNaN(min) && !isNaN(max)
      ? `${min} to ${max} questions`
      : !isNaN(min)
      ? `at least ${min} questions`
      : !isNaN(max)
      ? `no more than ${max} questions`
      : "no range specified";

  const newWaveSection =
    data.newWave === "yes"
      ? data.previousQuestionnairesFiles.length > 0
        ? "New wave survey: Yes\nPreserve exact wording of NPS and tracker questions from the previous questionnaire above. Mark each with [TRACKER] in the question text."
        : "New wave survey: Yes\nFlag that prior wording cannot be matched — no previous questionnaire was provided."
      : "New wave survey: No";

  return `Draft a survey questionnaire using the following inputs.

Research goal: ${data.researchGoal || "none provided"}

Research areas to include: ${data.researchAreas || "none provided"}

Target question count: ${questionRange}

Context documents:
- Brief/proposal/notes: ${briefText}
- Previous/similar questionnaire: ${prevText}
- Brand guidelines + writing style & tone: ${brandText}

Example questions from external sources:
${data.exampleQuestions || "none provided"}

${newWaveSection}

Routing logic: ${data.includeRouting === "yes" ? "Yes — include skip logic and routing flags where appropriate." : "No — do not include any routing instructions."}`;
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function POST(request: NextRequest) {
  let data: SurveyFormData;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Pass 1: generation with extended thinking
  let generationText: string;
  try {
    const generationResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      thinking: { type: "enabled", budget_tokens: 8000 },
      system: GENERATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(data) }],
    });
    generationText = extractText(generationResponse);
  } catch (error) {
    console.error("Generation API error:", error);
    return NextResponse.json({ error: "Generation failed — the AI service returned an error. Please try again." }, { status: 502 });
  }

  if (!generationText.trim()) {
    return NextResponse.json({ error: "Generation returned empty output. Please try again." }, { status: 502 });
  }

  const parsedGeneration = parseQuestionnaire(generationText);

  if (parsedGeneration.questions.length === 0) {
    return NextResponse.json({ error: "Could not parse any questions from the generated output. Please try again." }, { status: 502 });
  }

  // Pass 2: silent QA call (excludes tracker questions)
  let qaText: string;
  try {
    const qaResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: QA_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildQAInput(parsedGeneration) }],
    });
    qaText = extractText(qaResponse);
  } catch (error) {
    console.error("QA API error:", error);
    // QA network failure is non-fatal — return the generation result with a specific flag
    return NextResponse.json({ questionnaire: parsedGeneration, qaStatus: "network_error" });
  }

  const { questionnaire, qaFailed } = mergeQAResult(parsedGeneration, qaText);

  return NextResponse.json({
    questionnaire,
    qaStatus: qaFailed ? "parse_error" : "ok",
  });
}
