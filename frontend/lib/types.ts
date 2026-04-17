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

// Board Management types

export type BoardRecord = {
  id: string;
  name: string;
  created_by_email: string;
  created_at: string;
};

export type GroupRecord = {
  id: string;
  name: string;
  board_id: string;
  position: number;
  created_at: string;
};

export type BoardItemStatus = "Not Started" | "Working on it" | "Stuck" | "Waiting for review" | "Done";
export type BoardItemPriority = "Critical" | "High" | "Medium" | "Low";
export type BoardItemType = "Story" | "Bug" | "Spike" | "Epic";

export type BoardItemRecord = {
  id: string;
  name: string;
  description: string;
  status: BoardItemStatus;
  priority: BoardItemPriority;
  type: BoardItemType;
  team: string;
  estimate: number | null;
  dependencies: string;
  issue_description: string;
  owner: string;
  due_date: string | null;
  group_id: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type CreateBoardItemInput = {
  name: string;
  description?: string;
  status?: BoardItemStatus;
  priority?: BoardItemPriority;
  type?: BoardItemType;
  team?: string;
  estimate?: number | null;
  dependencies?: string;
  issue_description?: string;
  owner?: string;
  due_date?: string | null;
};
