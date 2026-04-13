import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getSystemPrompt,
  type ConversationMessage,
  type ExtractedFields,
  type Pathway,
} from "@/lib/conversation";
import { generateTickets } from "@/lib/tickets";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      pathway,
      team,
    }: {
      messages: ConversationMessage[];
      pathway: Pathway;
      team: string;
    } = body;

    // Single Claude call that both responds AND extracts fields
    // We ask Claude to include a JSON block at the end of its response
    const basePrompt = getSystemPrompt(pathway, []);

    const combinedPrompt = `${basePrompt}

IMPORTANT INSTRUCTION: At the very end of every response, after your conversational message, include a hidden extraction block in exactly this format on its own line:

<!--FIELDS:{"whatTheyNeed":"value or null","whoBenefits":"value or null","whyItMatters":"value or null","successCriteria":"value or null"}-->

Fill in each field with a concise summary of what the user has said so far for that topic, or null if they haven't addressed it yet. This block will be stripped from the visible message — the user will never see it. Always include this block, even if all fields are still null.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: combinedPrompt,
      messages: messages
        .map((m) => ({
          role: m.role,
          // Strip any existing FIELDS blocks from history so Claude doesn't see them
          content: m.content.replace(/<!--FIELDS:.*?-->/gs, "").trim(),
        }))
        // Filter out any messages that ended up with empty content after stripping
        .filter((m) => m.content.length > 0),
    });

    const rawMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract the fields JSON from the hidden block
    let fields: ExtractedFields = {
      whatTheyNeed: null,
      whoBenefits: null,
      whyItMatters: null,
      successCriteria: null,
    };

    const fieldsMatch = rawMessage.match(/<!--FIELDS:(.*?)-->/s);
    if (fieldsMatch) {
      try {
        const parsed = JSON.parse(fieldsMatch[1]);
        fields = {
          whatTheyNeed: parsed.whatTheyNeed || null,
          whoBenefits: parsed.whoBenefits || null,
          whyItMatters: parsed.whyItMatters || null,
          successCriteria: parsed.successCriteria || null,
        };
      } catch (e) {
        console.error("[Chat API] Failed to parse fields:", e);
      }
    }

    // Strip the hidden block from the visible message
    const assistantMessage = rawMessage
      .replace(/<!--FIELDS:.*?-->/gs, "")
      .trim();

    // Check completion
    const missingFields = (
      Object.keys(fields) as (keyof ExtractedFields)[]
    ).filter((key) => !fields[key]);
    const complete = missingFields.length === 0;

    // Generate tickets when all fields are captured
    let tickets = null;
    if (complete) {
      tickets = generateTickets({
        whatTheyNeed: fields.whatTheyNeed!,
        whoBenefits: fields.whoBenefits!,
        whyItMatters: fields.whyItMatters!,
        successCriteria: fields.successCriteria!,
        team,
      });
    }

    return NextResponse.json({
      message: assistantMessage,
      isComplete: complete,
      extractedFields: fields,
      missingFields,
      tickets,
    });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
