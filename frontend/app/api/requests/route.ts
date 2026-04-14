import { NextResponse } from "next/server";
import { createRequest, getRequests } from "@/lib/requests";
import type { RequestStatus } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tickets, conversation_transcript, submitted_by_name, submitted_by_email, requested_by, team } = body;

    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: "No tickets to submit" }, { status: 400 });
    }

    const record = await createRequest({
      tickets,
      conversation_transcript,
      submitted_by_name,
      submitted_by_email,
      requested_by,
      team,
    });

    return NextResponse.json({ success: true, requestId: record.id });
  } catch (error) {
    console.error("[Requests API] Error:", error);
    return NextResponse.json(
      { error: "Failed to save request" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") || "Open") as RequestStatus;

    const requests = await getRequests(status);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error("[Requests API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
