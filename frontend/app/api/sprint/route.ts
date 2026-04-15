import { NextResponse } from "next/server";
import { getCachedSprintData } from "@/lib/sprint-cache";
import { getOrGenerateSummary } from "@/lib/sprint-summary";

const BOARD_ID = process.env.MONDAY_BOARD_ID || "5094486524";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    const data = await getCachedSprintData(BOARD_ID, forceRefresh);

    // Generate AI summary for previous sprint's done items
    let summary = "";
    if (data.previousSprint && data.previousSprint.doneItems.length > 0) {
      const doneNames = data.previousSprint.doneItems.map((item) => item.name);
      summary = await getOrGenerateSummary(data.previousSprint.name, doneNames);
    }

    return NextResponse.json({ ...data, summary });
  } catch (error) {
    console.error("[Sprint API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sprint data" },
      { status: 500 }
    );
  }
}
