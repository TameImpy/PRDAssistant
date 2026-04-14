import { createSupabaseClient } from "./supabase";
import type { RequestRecord, RequestStatus } from "./types";
import type { Ticket } from "./tickets";
import type { ConversationMessage } from "./conversation";

export type CreateRequestInput = {
  tickets: Ticket[];
  conversation_transcript: ConversationMessage[];
  submitted_by_name: string;
  submitted_by_email: string;
  requested_by: string;
  team: string;
};

export async function createRequest(input: CreateRequestInput): Promise<RequestRecord> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("requests")
    .insert({
      tickets: input.tickets,
      conversation_transcript: input.conversation_transcript,
      submitted_by_name: input.submitted_by_name,
      submitted_by_email: input.submitted_by_email,
      requested_by: input.requested_by,
      team: input.team,
      status: "Open",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as RequestRecord;
}

export async function getRequests(status: RequestStatus = "Open"): Promise<RequestRecord[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("requests")
    .select()
    .eq("status", status)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as RequestRecord[];
}

export async function getRequestById(id: string): Promise<RequestRecord | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("requests")
    .select()
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as RequestRecord;
}

export async function updateRequestTickets(id: string, tickets: Ticket[]): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("requests")
    .update({ tickets, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function submitRequestToBacklog(id: string, mondayItemIds: string[]): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("requests")
    .update({
      status: "Submitted to Backlog",
      monday_item_ids: mondayItemIds,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function rejectRequest(id: string, reason: string): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("requests")
    .update({
      status: "Rejected",
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
