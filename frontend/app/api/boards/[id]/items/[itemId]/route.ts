import { NextResponse } from "next/server";
import { updateBoardItem, deleteBoardItem } from "@/lib/boards";

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    const body = await request.json();

    // Remove id, created_at, group_id from updates if present
    const { id: _id, created_at: _ca, group_id: _gid, ...updates } = body;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const item = await updateBoardItem(itemId, updates);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("[Boards API] Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    await deleteBoardItem(itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Boards API] Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
