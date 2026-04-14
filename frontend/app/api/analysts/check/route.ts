import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-provider";
import { isAnalyst } from "@/lib/analysts";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ isAnalyst: false });
    }

    const result = await isAnalyst(session.user.email);
    return NextResponse.json({ isAnalyst: result });
  } catch {
    return NextResponse.json({ isAnalyst: false });
  }
}
