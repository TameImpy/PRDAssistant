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

function splitBlocks(raw: string): string[] {
  return raw
    .split(/\n---+\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

function parseAnswerOption(line: string): AnswerOption {
  const routingMatch = line.match(/[–—-]\s*(SKIP TO Q\d+|EXCLUSIVE|LOCK OPTION)/i);
  const routing = routingMatch ? routingMatch[1].toUpperCase() : null;
  const text = line.replace(/[–—-]\s*(SKIP TO Q\d+|EXCLUSIVE|LOCK OPTION)/i, "").trim();
  return { text, routing };
}

function isTrackerQuestion(questionText: string): boolean {
  return /\[TRACKER\]/i.test(questionText);
}

export function parseQuestionnaire(raw: string): ParsedQuestionnaire {
  const blocks = splitBlocks(raw);
  const questions: SurveyQuestion[] = [];
  let intro = "";

  for (const block of blocks) {
    const baseMatch = block.match(/^BASE:\s*(.+)/im);
    const typeMatch = block.match(/^QUESTION TYPE:\s*(.+)/im);
    const questionMatch = block.match(/\*\*Q\d+\.\s*(.*?)\*\*/s);

    if (!baseMatch && !typeMatch) {
      if (!intro) intro = block;
      continue;
    }

    const base = baseMatch ? baseMatch[1].trim() : "";
    const questionType = typeMatch ? typeMatch[1].trim() : "";
    const rawQuestionText = questionMatch ? questionMatch[0] : "";
    const questionText = questionMatch ? questionMatch[1].trim() : "";

    const qNumMatch = block.match(/\*\*Q(\d+)\./);
    const id = qNumMatch ? `Q${qNumMatch[1]}` : `Q${questions.length + 1}`;

    const afterQuestion = block
      .replace(/^BASE:.*$/im, "")
      .replace(/^QUESTION TYPE:.*$/im, "")
      .replace(rawQuestionText, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("---"));

    const answerOptions = afterQuestion.map(parseAnswerOption);

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

export function mergeQAResult(
  original: ParsedQuestionnaire,
  qaRaw: string
): ParsedQuestionnaire {
  const qaResult = parseQuestionnaire(qaRaw);
  let qaIndex = 0;

  const merged: SurveyQuestion[] = original.questions.map((q) => {
    if (q.isTracker) return q;
    return qaResult.questions[qaIndex++] ?? q;
  });

  return { intro: qaResult.intro || original.intro, questions: merged };
}
