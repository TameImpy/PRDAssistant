import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-provider";
import { preprocessContext } from "@/lib/context-preprocess";
import type { ContextSourceType } from "@/lib/context-upload";

type RequestBody = {
  items: Array<{ text: string; label: ContextSourceType }>;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RequestBody = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "At least one context item is required" },
        { status: 400 }
      );
    }

    const invalidItem = body.items.find(
      (item) => !item.text || typeof item.text !== "string" || !item.label
    );
    if (invalidItem) {
      return NextResponse.json(
        { error: "Each item must have text and label" },
        { status: 400 }
      );
    }

    const result = await preprocessContext(body.items);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Preprocess API] Error:", error);
    return NextResponse.json(
      { error: "Failed to preprocess context" },
      { status: 500 }
    );
  }
}
