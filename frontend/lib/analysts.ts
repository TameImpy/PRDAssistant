import { createSupabaseClient } from "./supabase";

export async function isAnalyst(email: string): Promise<boolean> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("analysts")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) return false;
    return true;
  } catch {
    return false;
  }
}
