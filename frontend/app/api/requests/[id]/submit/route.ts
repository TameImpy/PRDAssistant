import { NextResponse } from "next/server";
import { getRequestById, submitRequestToBacklog } from "@/lib/requests";
import { MondayClient, mapTicketToColumnValues } from "@/lib/monday";

const BOARD_ID = process.env.MONDAY_BOARD_ID || "5094486524";
const GROUP_ID = process.env.MONDAY_BACKLOG_GROUP_ID || "new_group29179";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const record = await getRequestById(id);

    if (!record) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (record.status !== "Open") {
      return NextResponse.json({ error: "Request is not open" }, { status: 400 });
    }

    const apiToken = process.env.MONDAY_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ error: "Monday.com API token not configured" }, { status: 500 });
    }

    const client = new MondayClient(apiToken);

    const items = record.tickets.map((ticket) => ({
      boardId: BOARD_ID,
      groupId: GROUP_ID,
      itemName: ticket.title,
      columnValues: mapTicketToColumnValues(ticket),
    }));

    const results = await client.createItems(items);

    const mondayItemIds = results
      .filter((r) => r.success && r.itemId)
      .map((r) => r.itemId!);

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      return NextResponse.json(
        { success: false, error: `${failed.length} of ${results.length} tickets failed` },
        { status: 207 }
      );
    }

    await submitRequestToBacklog(id, mondayItemIds);

    return NextResponse.json({
      success: true,
      boardUrl: `https://immediatemedia.monday.com/boards/${BOARD_ID}`,
      mondayItemIds,
    });
  } catch (error) {
    console.error("[Submit API] Error:", error);
    return NextResponse.json({ error: "Failed to submit to Monday.com" }, { status: 500 });
  }
}
