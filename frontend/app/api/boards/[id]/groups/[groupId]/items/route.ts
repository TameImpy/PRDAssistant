import { NextResponse } from "next/server";
import { createBoardItem } from "@/lib/boards";

type RouteContext = { params: Promise<{ id: string; groupId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { groupId } = await context.params;
    const body = await request.json();
    const { name, ...rest } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const item = await createBoardItem(groupId, { name: name.trim(), ...rest });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("[Boards API] Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
