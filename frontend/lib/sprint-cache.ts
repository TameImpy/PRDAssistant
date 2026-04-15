import { MondayClient, type SprintItem } from "./monday";
import { identifyCurrentAndPreviousSprint } from "./sprints";

export type SprintData = {
  currentSprint: { name: string; items: SprintItem[] } | null;
  previousSprint: {
    name: string;
    items: SprintItem[];
    doneItems: SprintItem[];
  } | null;
  cachedAt: string;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache: { data: SprintData; timestamp: number } | null = null;

export async function getCachedSprintData(
  boardId: string,
  forceRefresh = false
): Promise<SprintData> {
  const now = Date.now();

  if (!forceRefresh && cache && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }

  const apiToken = process.env.MONDAY_API_TOKEN;
  if (!apiToken) {
    return { currentSprint: null, previousSprint: null, cachedAt: new Date().toISOString() };
  }

  const client = new MondayClient(apiToken);
  const groups = await client.getGroups(boardId);
  const { current, previous } = identifyCurrentAndPreviousSprint(groups);

  const currentItems = current
    ? await client.getGroupItems(boardId, current.id)
    : [];
  const previousItems = previous
    ? await client.getGroupItems(boardId, previous.id)
    : [];
  const doneItems = previousItems.filter((item) => item.status === "Done");

  const data: SprintData = {
    currentSprint: current ? { name: current.title, items: currentItems } : null,
    previousSprint: previous
      ? { name: previous.title, items: previousItems, doneItems }
      : null,
    cachedAt: new Date().toISOString(),
  };

  cache = { data, timestamp: now };
  return data;
}
