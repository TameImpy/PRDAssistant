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
  maxRetries: 3, // Auto-retries on 429 (rate limit) and 529 (overloaded) with backoff
});

const EXTRACTION_PROMPT = `Analyze this conversation and extract what information has been captured so far. Return ONLY valid JSON, nothing else:

{"whatTheyNeed":"concise summary or null","whoBenefits":"concise summary or null","whyItMatters":"concise summary or null","successCriteria":"concise summary or null","requestedBy":"name of person requesting (and role/team if mentioned) or null"}

Use null (not the string "null") for any field the user hasn't addressed yet.`;

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

    // Step 1: Extract fields using Sonnet
    let fields: ExtractedFields = {
      whatTheyNeed: null,
      whoBenefits: null,
      whyItMatters: null,
      successCriteria: null,
      requestedBy: null,
    };

    // Filter out any empty messages to prevent API errors
    const cleanMessages = messages.filter((m) => m.content && m.content.trim().length > 0);
    const userMessages = cleanMessages.filter((m) => m.role === "user");

    if (userMessages.length > 0) {
      try {
        const extractionResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 256,
          system: EXTRACTION_PROMPT,
          messages: cleanMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        const extractionText =
          extractionResponse.content[0].type === "text"
            ? extractionResponse.content[0].text
            : "";

        const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          fields = {
            whatTheyNeed: parsed.whatTheyNeed || null,
            whoBenefits: parsed.whoBenefits || null,
            whyItMatters: parsed.whyItMatters || null,
            successCriteria: parsed.successCriteria || null,
            requestedBy: parsed.requestedBy || null,
          };
        }
      } catch (e) {
        console.error("[Chat API] Field extraction failed:", e);
      }
    }

    const missingFields = (
      Object.keys(fields) as (keyof ExtractedFields)[]
    ).filter((key) => !fields[key]);
    const complete = missingFields.length === 0;

    // Step 2: Get conversational response from Sonnet
    const systemPrompt = getSystemPrompt(pathway, missingFields);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: cleanMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Step 3: Generate tickets when all fields are captured
    let tickets = null;
    if (complete) {
      tickets = await generateTickets({
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
