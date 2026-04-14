import type { Ticket } from "./tickets";
import type { ConversationMessage } from "./conversation";

export type RequestStatus = "Open" | "Rejected" | "Submitted to Backlog";

export type RequestRecord = {
  id: string;
  tickets: Ticket[];
  conversation_transcript: ConversationMessage[];
  submitted_by_name: string;
  submitted_by_email: string;
  requested_by: string;
  team: string;
  status: RequestStatus;
  rejection_reason: string | null;
  monday_item_ids: string[] | null;
  created_at: string;
  updated_at: string;
};

export type AnalystRecord = {
  id: string;
  email: string;
  created_at: string;
};
