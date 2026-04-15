"use client";

import { useState, useEffect, useCallback } from "react";
import type { SprintItem } from "@/lib/monday";

type SprintData = {
  currentSprint: { name: string; items: SprintItem[] } | null;
  previousSprint: {
    name: string;
    items: SprintItem[];
    doneItems: SprintItem[];
  } | null;
  summary?: string;
  cachedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  Done: "bg-green-500",
  "Working on it": "bg-yellow-400",
  Stuck: "bg-red-500",
  "Not Started": "bg-gray-400",
  "Waiting for review": "bg-blue-400",
};

function StatusDot({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "bg-gray-400";
  return (
    <span
      className={`inline-block w-3 h-3 ${color} border border-black flex-shrink-0`}
      title={status}
    />
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export function SprintOverview() {
  const [data, setData] = useState<SprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const url = refresh ? "/api/sprint?refresh=true" : "/api/sprint";
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
        <p className="font-headline font-bold text-xl uppercase tracking-tighter animate-pulse">
          LOADING_SPRINT_DATA...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Cache indicator + refresh */}
      <div className="flex items-center gap-4">
        <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {data?.cachedAt ? `Last updated ${timeAgo(data.cachedAt)}` : "No data"}
        </span>
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="font-label text-xs font-bold uppercase tracking-widest text-primary hover:text-black transition-colors disabled:opacity-40"
        >
          {isRefreshing ? "REFRESHING..." : "REFRESH"}
        </button>
      </div>

      {/* Currently Building */}
      <div>
        <h2 className="font-headline font-black text-3xl uppercase tracking-tighter mb-6">
          {data?.currentSprint
            ? `CURRENTLY_BUILDING — ${data.currentSprint.name.replace(/Sprint - /i, "").toUpperCase()}`
            : "CURRENTLY_BUILDING"}
        </h2>

        {!data?.currentSprint || data.currentSprint.items.length === 0 ? (
          <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-8 text-center">
            <p className="font-body text-on-surface-variant">
              No items in the current sprint.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.currentSprint.items.map((item) => (
              <div
                key={item.id}
                className="border-4 border-black bg-surface-container-lowest p-4 flex items-center gap-4"
              >
                <StatusDot status={item.status} />
                <span className="font-body font-bold flex-1">{item.name}</span>
                {item.owner && (
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {item.owner}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Shipped */}
      {data?.previousSprint && (
        <div>
          <h2 className="font-headline font-black text-3xl uppercase tracking-tighter mb-6">
            RECENTLY_SHIPPED — {data.previousSprint.name.replace(/Sprint - /i, "").toUpperCase()}
          </h2>

          {/* AI Summary */}
          {data.summary && (
            <div className="border-4 border-black bg-primary-container neo-brutalist-shadow p-6 mb-6">
              <p className="font-label text-xs font-black uppercase tracking-widest mb-2">
                AI_SUMMARY
              </p>
              <p className="font-body text-on-primary-container text-lg">
                {data.summary}
              </p>
            </div>
          )}

          {data.previousSprint.doneItems.length === 0 ? (
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-8 text-center">
              <p className="font-body text-on-surface-variant">
                No items shipped in the previous sprint.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.previousSprint.doneItems.map((item) => (
                <div
                  key={item.id}
                  className="border-4 border-black bg-surface-container-lowest p-4 flex items-center gap-4"
                >
                  <StatusDot status="Done" />
                  <span className="font-body font-bold flex-1">{item.name}</span>
                  {item.owner && (
                    <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      {item.owner}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
