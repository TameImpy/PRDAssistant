"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useIsAnalyst } from "@/lib/useIsAnalyst";
import { AuthGate } from "@/components/AuthGate";
import type { RequestStatus } from "@/lib/types";

type RequestSummary = {
  id: string;
  tickets: { title: string }[];
  submitted_by_name: string;
  requested_by: string;
  team: string;
  status: RequestStatus;
  rejection_reason: string | null;
  created_at: string;
};

const STATUS_TABS: { label: string; value: RequestStatus }[] = [
  { label: "OPEN", value: "Open" },
  { label: "REJECTED", value: "Rejected" },
  { label: "SUBMITTED_TO_BACKLOG", value: "Submitted to Backlog" },
];

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

export default function MissionControlPage() {
  const { isAnalyst, isLoading: isCheckingAnalyst } = useIsAnalyst();
  const [activeTab, setActiveTab] = useState<RequestStatus>("Open");
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/requests?status=${encodeURIComponent(activeTab)}`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAnalyst) {
      fetchRequests();
    }
  }, [isAnalyst, fetchRequests]);

  if (isCheckingAnalyst) {
    return (
      <AuthGate>
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter animate-pulse">
                CHECKING_ACCESS...
              </p>
            </div>
          </div>
        </section>
      </AuthGate>
    );
  }

  if (!isAnalyst) {
    return (
      <AuthGate>
        <section className="px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <h2 className="font-headline font-black text-4xl uppercase tracking-tighter mb-4">
                ANALYST_ACCESS_ONLY
              </h2>
              <p className="font-body text-on-surface-variant text-lg">
                Mission Control is available to the Commercial Analysts team. If you
                believe you should have access, contact the team lead.
              </p>
            </div>
          </div>
        </section>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <span className="font-label text-xs font-black px-2 py-1 bg-black text-white mb-4 inline-block">
              MISSION_CONTROL
            </span>
            <h1 className="font-headline font-black text-5xl uppercase tracking-tighter">
              OPEN_REQUESTS
            </h1>
          </div>

          {/* Status filter tabs */}
          <div className="flex border-4 border-black mb-6">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 p-3 font-headline font-bold uppercase tracking-widest text-xs border-r-4 border-black last:border-r-0 transition-colors ${
                  activeTab === tab.value
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Request list */}
          {isLoading ? (
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter animate-pulse">
                LOADING_REQUESTS...
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter mb-2">
                NO_REQUESTS
              </p>
              <p className="font-body text-on-surface-variant">
                {activeTab === "Open"
                  ? "No open requests in the queue. Check back later."
                  : `No ${activeTab.toLowerCase()} requests.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <Link
                  key={req.id}
                  href={`/mission-control/requests/${req.id}`}
                  className="block border-4 border-black bg-surface-container-lowest p-6 hover:bg-surface-container transition-colors transform hover:-translate-x-1 hover:-translate-y-1 neo-brutalist-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-headline font-bold text-lg uppercase tracking-tighter truncate">
                        {req.tickets[0]?.title || "Untitled request"}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                          From: {req.requested_by}
                        </span>
                        <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                          Logged by: {req.submitted_by_name}
                        </span>
                        <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                          Team: {req.team}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        {req.tickets.length} {req.tickets.length === 1 ? "ticket" : "tickets"}
                      </span>
                      <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        {timeAgo(req.created_at)}
                      </span>
                      <span
                        className={`font-label text-xs font-black px-2 py-1 ${
                          req.status === "Open"
                            ? "bg-tertiary-container text-on-tertiary-container"
                            : req.status === "Rejected"
                              ? "bg-error-container text-on-error-container"
                              : "bg-primary-container text-on-primary-container"
                        }`}
                      >
                        {req.status === "Submitted to Backlog" ? "SUBMITTED" : req.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {req.status === "Rejected" && req.rejection_reason && (
                    <div className="mt-3 border-t border-black/20 pt-3">
                      <p className="font-body text-sm text-on-surface-variant">
                        <span className="font-bold">Reason: </span>
                        {req.rejection_reason}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}
