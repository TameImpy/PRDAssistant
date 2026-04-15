import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseClient } from "./supabase";

export async function getOrGenerateSummary(
  sprintGroupName: string,
  doneItemNames: string[]
): Promise<string> {
  if (doneItemNames.length === 0) return "";

  try {
    const supabase = createSupabaseClient();

    // Check cache
    const { data: cached } = await supabase
      .from("sprint_summaries")
      .select("summary, done_item_names")
      .eq("sprint_group_name", sprintGroupName)
      .single();

    if (cached) {
      const cachedNames = cached.done_item_names as string[];
      const itemsMatch =
        cachedNames.length === doneItemNames.length &&
        cachedNames.every((name: string, i: number) => name === doneItemNames[i]);

      if (itemsMatch) {
        return cached.summary;
      }
    }

    // Generate new summary
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system:
        "You summarise completed work items for a non-technical leadership audience. Return exactly 1-2 sentences. Be specific about what was delivered, not generic.",
      messages: [
        {
          role: "user",
          content: `Summarise these completed items from the last sprint:\n${doneItemNames.map((n) => `- ${n}`).join("\n")}`,
        },
      ],
    });

    const summary =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Cache the summary
    await supabase.from("sprint_summaries").upsert({
      sprint_group_name: sprintGroupName,
      done_item_names: doneItemNames,
      summary,
    });

    return summary;
  } catch (error) {
    console.error("[Sprint Summary] Error:", error);
    return "";
  }
}
