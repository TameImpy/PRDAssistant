import type { Ticket } from "./tickets";

const MONDAY_API_URL = "https://api.monday.com/v2";

// Column IDs discovered from the Monday.com board API
export const COLUMN_IDS = {
  status: "project_status",
  taskDescription: "long_text_mm2cfmst",
  priority: "color_mm2cgscq",
  type: "color_mm2c6d4m",
  team: "color_mm2cvp5b",
  estimate: "text_mm2cah7s",
  dependencies: "long_text_mm2c2qby",
  issueDescription: "long_text_mm2cjd07",
} as const;

export function mapTicketToColumnValues(
  ticket: Ticket
): Record<string, any> {
  return {
    // Status → "Not Started" for new backlog items
    [COLUMN_IDS.status]: { label: "Not Started" },

    // Task Description (user story) — long_text requires { text } format
    [COLUMN_IDS.taskDescription]: { text: ticket.userStory },

    // Priority — status label
    [COLUMN_IDS.priority]: { label: ticket.priority === "Critical" ? "Critical ⚠️️" : ticket.priority },

    // Type — status label
    [COLUMN_IDS.type]: { label: ticket.type },

    // Team — status label
    [COLUMN_IDS.team]: { label: ticket.team },

    // Estimate — text field with SP suffix
    [COLUMN_IDS.estimate]: `${ticket.storyPoints} SP`,

    // Dependencies — long_text
    [COLUMN_IDS.dependencies]: { text: ticket.dependencies || "None" },

    // Issue Description — long_text
    [COLUMN_IDS.issueDescription]: { text: ticket.issueDescription },
  };
}

type CreateItemParams = {
  boardId: string;
  groupId: string;
  itemName: string;
  columnValues: Record<string, any>;
};

type CreateItemResult = {
  success: boolean;
  itemId?: string;
  error?: string;
};

export class MondayClient {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async createItem(params: CreateItemParams): Promise<CreateItemResult> {
    const { boardId, groupId, itemName, columnValues } = params;
    const columnValuesJson = JSON.stringify(JSON.stringify(columnValues));

    const query = `mutation {
      create_item(
        board_id: ${boardId},
        group_id: "${groupId}",
        item_name: "${itemName.replace(/"/g, '\\"')}",
        column_values: ${columnValuesJson}
      ) {
        id
      }
    }`;

    try {
      const response = await fetch(MONDAY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiToken,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Monday.com API returned ${response.status}`,
        };
      }

      const data = await response.json();

      if (data.errors) {
        return {
          success: false,
          error: data.errors[0]?.message || "Unknown Monday.com error",
        };
      }

      return {
        success: true,
        itemId: data.data.create_item.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to Monday.com",
      };
    }
  }

  async createItems(
    items: CreateItemParams[]
  ): Promise<CreateItemResult[]> {
    const results: CreateItemResult[] = [];
    for (const item of items) {
      const result = await this.createItem(item);
      results.push(result);
    }
    return results;
  }

  async getGroups(boardId: string): Promise<{ id: string; title: string }[]> {
    const query = `query { boards(ids: [${boardId}]) { groups { id title } } }`;

    try {
      const response = await fetch(MONDAY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiToken,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (data.errors) return [];

      return data.data.boards[0]?.groups ?? [];
    } catch {
      return [];
    }
  }

  async getGroupItems(
    boardId: string,
    groupId: string
  ): Promise<SprintItem[]> {
    const query = `query {
      boards(ids: [${boardId}]) {
        groups(ids: ["${groupId}"]) {
          items_page(limit: 50) {
            items {
              id
              name
              column_values {
                id
                text
              }
            }
          }
        }
      }
    }`;

    try {
      const response = await fetch(MONDAY_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.apiToken,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (data.errors) return [];

      const items =
        data.data.boards[0]?.groups[0]?.items_page?.items ?? [];

      return items.map((item: any) => {
        const statusCol = item.column_values?.find(
          (cv: any) => cv.id === COLUMN_IDS.status
        );
        const ownerCol = item.column_values?.find(
          (cv: any) => cv.id === "person"
        );

        return {
          id: item.id,
          name: item.name,
          status: statusCol?.text || "Not Started",
          owner: ownerCol?.text || null,
        };
      });
    } catch {
      return [];
    }
  }
}

export type SprintItem = {
  id: string;
  name: string;
  status: string;
  owner: string | null;
};
