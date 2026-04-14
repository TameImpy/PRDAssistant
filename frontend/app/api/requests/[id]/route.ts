import { NextResponse } from "next/server";
import { getRequestById, updateRequestTickets } from "@/lib/requests";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const record = await getRequestById(id);

    if (!record) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: record });
  } catch (error) {
    console.error("[Requests API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch request" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { tickets } = await request.json();

    await updateRequestTickets(id, tickets);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Requests API] Error:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
