export type AnswerOption = {
  text: string;
  routing: string | null;
};

export type SurveyQuestion = {
  id: string;
  base: string;
  questionType: string;
  questionText: string;
  answerOptions: AnswerOption[];
  isTracker: boolean;
};

export type ParsedQuestionnaire = {
  intro: string;
  questions: SurveyQuestion[];
};

// Tolerant split — handles varying whitespace and dash counts around the separator
function splitBlocks(raw: string): string[] {
  return raw
    .split(/\n\s*---+\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

// Only strip routing annotations that follow the exact pattern at end-of-line
// to avoid stripping dashes that are part of the answer text itself
function parseAnswerOption(line: string): AnswerOption {
  const routingPattern = /\s+[–—-]\s+(SKIP TO Q\d+|EXCLUSIVE|LOCK OPTION)\s*$/i;
  const routingMatch = line.match(routingPattern);
  const routing = routingMatch ? routingMatch[1].toUpperCase() : null;
  const text = routing ? line.replace(routingPattern, "").trim() : line.trim();
  return { text, routing };
}

export function isTrackerQuestion(questionText: string): boolean {
  return /\[TRACKER\]/i.test(questionText);
}

export function parseQuestionnaire(raw: string): ParsedQuestionnaire {
  if (!raw || typeof raw !== "string") return { intro: "", questions: [] };

  const blocks = splitBlocks(raw);
  const questions: SurveyQuestion[] = [];
  let intro = "";

  for (const block of blocks) {
    const baseMatch = block.match(/^BASE:\s*(.+)/im);
    const typeMatch = block.match(/^QUESTION TYPE:\s*(.+)/im);

    // No BASE or QUESTION TYPE — treat as intro
    if (!baseMatch && !typeMatch) {
      if (!intro) intro = block;
      continue;
    }

    const base = baseMatch ? baseMatch[1].trim() : "";
    const questionType = typeMatch ? typeMatch[1].trim() : "";

    // Match bold question: **Q1. text** or **Q1. multi\nline text**
    const questionMatch = block.match(/\*\*Q(\d+)\.\s*([\s\S]*?)\*\*/);
    const id = questionMatch ? `Q${questionMatch[1]}` : `Q${questions.length + 1}`;
    const questionText = questionMatch ? questionMatch[2].replace(/\n/g, " ").trim() : "";

    // Extract answer options: lines after stripping BASE, QUESTION TYPE, and question header
    const cleaned = block
      .replace(/^BASE:.*$/im, "")
      .replace(/^QUESTION TYPE:.*$/im, "")
      .replace(/\*\*Q\d+\.[\s\S]*?\*\*/, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !/^---+$/.test(l));

    const answerOptions = cleaned.map(parseAnswerOption);

    questions.push({
      id,
      base,
      questionType,
      questionText,
      answerOptions,
      isTracker: isTrackerQuestion(questionText),
    });
  }

  return { intro, questions };
}

// Reconstruct text for QA call, excluding tracker questions
export function buildQAInput(questionnaire: ParsedQuestionnaire): string {
  const parts: string[] = [];
  if (questionnaire.intro) parts.push(questionnaire.intro);

  for (const q of questionnaire.questions) {
    if (q.isTracker) continue;
    const options = q.answerOptions
      .map((o) => (o.routing ? `${o.text} – ${o.routing}` : o.text))
      .join("\n");
    parts.push(
      `BASE: ${q.base}\nQUESTION TYPE: ${q.questionType}\n\n**${q.id}. ${q.questionText}**\n\n${options}`
    );
  }

  return parts.join("\n\n---\n\n");
}

// Validate routing references — returns list of invalid references found
export function validateRouting(questionnaire: ParsedQuestionnaire): string[] {
  const validIds = new Set(questionnaire.questions.map((q) => q.id));
  const issues: string[] = [];

  for (const q of questionnaire.questions) {
    for (const opt of q.answerOptions) {
      if (!opt.routing) continue;
      const skipMatch = opt.routing.match(/^SKIP TO (Q\d+)$/i);
      if (skipMatch && !validIds.has(skipMatch[1].toUpperCase())) {
        issues.push(`${q.id}: "${opt.text}" routes to ${skipMatch[1]} which does not exist`);
      }
    }
  }

  return issues;
}

// Merge QA-reviewed non-tracker questions back with original tracker questions.
// If QA returns a different question count, fall back to the original generation.
export function mergeQAResult(
  original: ParsedQuestionnaire,
  qaRaw: string
): { questionnaire: ParsedQuestionnaire; qaFailed: boolean } {
  const qaResult = parseQuestionnaire(qaRaw);

  const nonTrackerCount = original.questions.filter((q) => !q.isTracker).length;
  const qaFailed = qaResult.questions.length !== nonTrackerCount;

  // If QA returned wrong number of questions, use the original generation as-is
  if (qaFailed) {
    return { questionnaire: original, qaFailed: true };
  }

  let qaIndex = 0;
  const merged: SurveyQuestion[] = original.questions.map((q) => {
    if (q.isTracker) return q;
    return qaResult.questions[qaIndex++];
  });

  return {
    questionnaire: { intro: qaResult.intro || original.intro, questions: merged },
    qaFailed: false,
  };
}
