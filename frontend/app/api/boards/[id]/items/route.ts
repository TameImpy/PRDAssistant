import { NextResponse } from "next/server";
import { getBoardItemsByBoardId } from "@/lib/boards";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: boardId } = await context.params;
    const items = await getBoardItemsByBoardId(boardId);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[Boards API] Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
