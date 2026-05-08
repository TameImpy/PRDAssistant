import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

export type EditLogEntry = {
  session_id: string;
  question_id: string;
  original_text: string;
  edited_text: string;
  edit_type: "question_text" | "answer_option" | "question_type" | "reorder" | "add_question" | "delete_question";
};

export async function POST(request: NextRequest) {
  let entry: EditLogEntry;
  try {
    entry = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Silently skip logging if Supabase is not configured (e.g. local dev without keys)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("edit_logs").insert(entry);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Edit log write error:", error);
    // Non-fatal — don't block the editor if logging fails
    return NextResponse.json({ ok: true, skipped: true });
  }
}
