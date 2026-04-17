import { createSupabaseClient } from "./supabase";
import type { BoardRecord, GroupRecord, BoardItemRecord, CreateBoardItemInput } from "./types";

export async function createBoard(name: string, createdByEmail: string): Promise<BoardRecord> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("boards")
    .insert({ name, created_by_email: createdByEmail })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as BoardRecord;
}

export async function getBoards(): Promise<BoardRecord[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("boards")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BoardRecord[];
}

export async function getBoardById(id: string): Promise<BoardRecord | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("boards")
    .select()
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as BoardRecord;
}

export async function deleteBoard(id: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("boards")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function createGroup(boardId: string, name: string): Promise<GroupRecord> {
  const supabase = createSupabaseClient();

  // Get current max position for this board to auto-position
  const { data: existing } = await supabase
    .from("groups")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false });

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("groups")
    .insert({ name, board_id: boardId, position: nextPosition })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as GroupRecord;
}

export async function getGroupsByBoardId(boardId: string): Promise<GroupRecord[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("groups")
    .select()
    .eq("board_id", boardId)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as GroupRecord[];
}

export async function createBoardItem(groupId: string, input: CreateBoardItemInput): Promise<BoardItemRecord> {
  const supabase = createSupabaseClient();

  // Get current max position for this group to auto-position
  const { data: existing } = await supabase
    .from("items")
    .select("position")
    .eq("group_id", groupId)
    .order("position", { ascending: false });

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from("items")
    .insert({
      name: input.name,
      description: input.description ?? "",
      status: input.status ?? "Not Started",
      priority: input.priority ?? "Medium",
      type: input.type ?? "Story",
      team: input.team ?? "",
      estimate: input.estimate ?? null,
      dependencies: input.dependencies ?? "",
      issue_description: input.issue_description ?? "",
      owner: input.owner ?? "",
      due_date: input.due_date ?? null,
      group_id: groupId,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as BoardItemRecord;
}

export async function getBoardItemsByBoardId(boardId: string): Promise<BoardItemRecord[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("items")
    .select("*, groups!inner(board_id)")
    .eq("groups.board_id", boardId)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as BoardItemRecord[];
}

export async function updateBoardItem(
  itemId: string,
  updates: Partial<Omit<BoardItemRecord, "id" | "created_at" | "group_id">>
): Promise<BoardItemRecord> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as BoardItemRecord;
}

export async function deleteBoardItem(itemId: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error(error.message);
}

export async function updateGroup(
  groupId: string,
  updates: Partial<Omit<GroupRecord, "id" | "created_at" | "board_id">>
): Promise<GroupRecord> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("groups")
    .update(updates)
    .eq("id", groupId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as GroupRecord;
}

export async function deleteGroup(groupId: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId);

  if (error) throw new Error(error.message);
}
