import { NextResponse } from "next/server";
import { getRequestById, rejectRequest } from "@/lib/requests";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    const record = await getRequestById(id);

    if (!record) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (record.status !== "Open") {
      return NextResponse.json({ error: "Request is not open" }, { status: 400 });
    }

    await rejectRequest(id, reason.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Reject API] Error:", error);
    return NextResponse.json({ error: "Failed to reject request" }, { status: 500 });
  }
}
