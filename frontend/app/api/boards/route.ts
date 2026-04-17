import { NextResponse } from "next/server";
import { createBoard, getBoards } from "@/lib/boards";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, created_by_email } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Board name is required" }, { status: 400 });
    }

    if (!created_by_email) {
      return NextResponse.json({ error: "Creator email is required" }, { status: 400 });
    }

    const board = await createBoard(name.trim(), created_by_email);

    return NextResponse.json({ success: true, board });
  } catch (error) {
    console.error("[Boards API] Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const boards = await getBoards();
    return NextResponse.json({ boards });
  } catch (error) {
    console.error("[Boards API] Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
