import { NextResponse } from "next/server";
import { createGroup, getGroupsByBoardId } from "@/lib/boards";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id: boardId } = await context.params;
    const groups = await getGroupsByBoardId(boardId);
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("[Boards API] Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: boardId } = await context.params;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const group = await createGroup(boardId, name.trim());

    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error("[Boards API] Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
