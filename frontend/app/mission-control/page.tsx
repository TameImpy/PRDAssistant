"use client";

import { useState } from "react";
import Link from "next/link";
import { useIsAnalyst } from "@/lib/useIsAnalyst";
import { AuthGate } from "@/components/AuthGate";
import { OpenRequests } from "@/components/OpenRequests";
import { SprintOverview } from "@/components/SprintOverview";

type SubPage = "sprint-overview" | "open-requests";

export default function MissionControlPage() {
  const { isAnalyst, isLoading: isCheckingAnalyst } = useIsAnalyst();
  const [activePage, setActivePage] = useState<SubPage>("sprint-overview");

  if (isCheckingAnalyst) {
    return (
      <AuthGate>
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter animate-pulse">
                LOADING...
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
          </div>

          {/* Sub-navigation */}
          <div className="flex border-4 border-black mb-8">
            <button
              onClick={() => setActivePage("sprint-overview")}
              className={`flex-1 p-4 font-headline font-bold uppercase tracking-widest text-sm transition-colors ${
                activePage === "sprint-overview"
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
              } ${isAnalyst ? "border-r-4 border-black" : ""}`}
            >
              SPRINT_OVERVIEW
            </button>
            {isAnalyst && (
              <button
                onClick={() => setActivePage("open-requests")}
                className={`flex-1 p-4 font-headline font-bold uppercase tracking-widest text-sm transition-colors border-r-4 border-black ${
                  activePage === "open-requests"
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                OPEN_REQUESTS
              </button>
            )}
            {isAnalyst && (
              <Link
                href="/mission-control/boards"
                className="flex-1 p-4 font-headline font-bold uppercase tracking-widest text-sm transition-colors bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container text-center"
              >
                BOARDS
              </Link>
            )}
          </div>

          {/* Content */}
          {activePage === "sprint-overview" && <SprintOverview />}
          {activePage === "open-requests" && isAnalyst && <OpenRequests />}
        </div>
      </section>
    </AuthGate>
  );
}
