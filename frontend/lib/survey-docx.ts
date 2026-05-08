import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  TableRow,
  TableCell,
  Table,
  WidthType,
} from "docx";
import type { ParsedQuestionnaire } from "@/lib/survey-parser";

const BRAND_YELLOW = "D1FF00";
const BLACK = "000000";
const GREY = "666666";
const LIGHT_GREY = "F5F5F5";

function labelRun(text: string): TextRun {
  return new TextRun({
    text,
    bold: true,
    size: 16, // 8pt
    color: GREY,
    font: "Barlow",
  });
}

function metaRow(base: string, questionType: string, isTracker: boolean): Paragraph {
  const parts: TextRun[] = [
    new TextRun({ text: "BASE: ", bold: true, size: 16, color: GREY, font: "Barlow" }),
    new TextRun({ text: base, size: 16, color: GREY, font: "Barlow" }),
    new TextRun({ text: "   |   ", size: 16, color: GREY, font: "Barlow" }),
    new TextRun({ text: questionType, bold: true, size: 16, color: GREY, font: "Barlow" }),
  ];
  if (isTracker) {
    parts.push(
      new TextRun({ text: "   ", size: 16, font: "Barlow" }),
      new TextRun({
        text: " TRACKER ",
        bold: true,
        size: 16,
        color: BLACK,
        font: "Barlow",
        shading: { type: ShadingType.SOLID, color: "00E0FF", fill: "00E0FF" },
      })
    );
  }
  return new Paragraph({ children: parts, spacing: { before: 240, after: 40 } });
}

function questionHeading(id: string, text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${id}. ${text}`,
        bold: true,
        size: 24, // 12pt
        font: "Barlow",
        color: BLACK,
      }),
    ],
    spacing: { before: 40, after: 80 },
  });
}

function answerOptionParagraph(text: string, routing: string | null): Paragraph {
  const children: TextRun[] = [
    new TextRun({ text: "□  ", size: 20, font: "Barlow", color: BLACK }), // □
    new TextRun({ text, size: 20, font: "Barlow", color: BLACK }),
  ];
  if (routing) {
    children.push(
      new TextRun({ text: `  → ${routing}`, size: 18, font: "Barlow", color: GREY, italics: true })
    );
  }
  return new Paragraph({
    children,
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
  });
}

function openTextPlaceholder(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: "[Open text response]",
        size: 20,
        font: "Barlow",
        color: GREY,
        italics: true,
      }),
    ],
    spacing: { before: 40, after: 40 },
    indent: { left: 360 },
  });
}

function divider(): Paragraph {
  return new Paragraph({
    children: [],
    spacing: { before: 160, after: 160 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
    },
  });
}

export async function generateQuestionnaireDOCX(
  questionnaire: ParsedQuestionnaire,
  filename?: string,
  title?: string
): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: (title ?? "SURVEY QUESTIONNAIRE").toUpperCase(),
          bold: true,
          size: 40,
          font: "Barlow",
          color: BLACK,
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Intro
  if (questionnaire.intro) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: questionnaire.intro,
            size: 20,
            font: "Barlow",
            color: BLACK,
          }),
        ],
        spacing: { after: 120 },
        shading: { type: ShadingType.SOLID, color: LIGHT_GREY, fill: LIGHT_GREY },
      }),
      divider()
    );
  }

  // Questions
  questionnaire.questions.forEach((q, index) => {
    children.push(metaRow(q.base, q.questionType, q.isTracker));
    children.push(questionHeading(q.id, q.questionText));

    if (q.questionType === "TEXTBOX") {
      children.push(openTextPlaceholder());
    } else {
      q.answerOptions.forEach((opt) => {
        children.push(answerOptionParagraph(opt.text, opt.routing));
      });
    }

    if (index < questionnaire.questions.length - 1) {
      children.push(divider());
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? "questionnaire.docx";
  a.click();
  URL.revokeObjectURL(url);
}
