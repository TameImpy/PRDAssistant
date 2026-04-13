import { NextRequest, NextResponse } from "next/server";
import { MondayClient, mapTicketToColumnValues } from "@/lib/monday";
import type { Ticket } from "@/lib/tickets";

const BOARD_ID = process.env.MONDAY_BOARD_ID || "5094486524";
const GROUP_ID = process.env.MONDAY_BACKLOG_GROUP_ID || "new_group29179";

export async function POST(request: NextRequest) {
  try {
    const { tickets }: { tickets: Ticket[] } = await request.json();

    if (!tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: "No tickets to submit" },
        { status: 400 }
      );
    }

    const apiToken = process.env.MONDAY_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "Monday.com API token not configured" },
        { status: 500 }
      );
    }

    const client = new MondayClient(apiToken);

    const items = tickets.map((ticket) => ({
      boardId: BOARD_ID,
      groupId: GROUP_ID,
      itemName: ticket.title,
      columnValues: mapTicketToColumnValues(ticket),
    }));

    const results = await client.createItems(items);

    const allSucceeded = results.every((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (!allSucceeded) {
      return NextResponse.json(
        {
          success: false,
          results,
          error: `${failed.length} of ${results.length} tickets failed to create`,
        },
        { status: 207 }
      );
    }

    return NextResponse.json({
      success: true,
      results,
      boardUrl: `https://immediatemedia.monday.com/boards/${BOARD_ID}`,
    });
  } catch (error) {
    console.error("[Submit API] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit tickets" },
      { status: 500 }
    );
  }
}
