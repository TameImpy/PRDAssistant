import { NextResponse } from "next/server";
import { updateGroup, deleteGroup } from "@/lib/boards";

type RouteContext = { params: Promise<{ id: string; groupId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { groupId } = await context.params;
    const body = await request.json();

    const { id: _id, created_at: _ca, board_id: _bid, ...updates } = body;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const group = await updateGroup(groupId, updates);
    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error("[Boards API] Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { groupId } = await context.params;
    await deleteGroup(groupId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Boards API] Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
