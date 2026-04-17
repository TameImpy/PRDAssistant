import { NextResponse } from "next/server";
import { getBoardById, deleteBoard } from "@/lib/boards";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const board = await getBoardById(id);

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error("[Boards API] Error fetching board:", error);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteBoard(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Boards API] Error deleting board:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}
