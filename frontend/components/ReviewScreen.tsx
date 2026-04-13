"use client";

import { useState } from "react";
import type { Ticket } from "@/lib/tickets";

type ReviewScreenProps = {
  tickets: Ticket[];
  pathway: "stakeholder" | "analyst";
  team: string;
  onBack: () => void;
  onConfirm: (boardUrl?: string) => void;
};

export function ReviewScreen({
  tickets,
  pathway,
  team,
  onBack,
  onConfirm,
}: ReviewScreenProps) {
  if (pathway === "stakeholder") {
    return (
      <StakeholderReview
        tickets={tickets}
        team={team}
        onBack={onBack}
        onConfirm={onConfirm}
      />
    );
  }

  // Analyst review will be built in issue #6
  return (
    <StakeholderReview
      tickets={tickets}
      team={team}
      onBack={onBack}
      onConfirm={onConfirm}
    />
  );
}

function StakeholderReview({
  tickets,
  team,
  onBack,
  onConfirm,
}: {
  tickets: Ticket[];
  team: string;
  onBack: () => void;
  onConfirm: (boardUrl?: string) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPoints = tickets.reduce((sum, t) => sum + t.storyPoints, 0);
  const timeEstimate =
    totalPoints <= 3
      ? "a few days"
      : totalPoints <= 8
        ? "about a week"
        : totalPoints <= 13
          ? "one to two weeks"
          : "several weeks";

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets }),
      });

      const data = await response.json();

      if (data.success) {
        onConfirm(data.boardUrl);
      } else {
        setError(
          data.error || "Something went wrong submitting to Monday.com"
        );
      }
    } catch {
      setError(
        "Could not connect to the server. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-8">
          <span className="font-label text-xs font-black px-2 py-1 bg-black text-white mb-6 inline-block">
            REVIEW_SUMMARY
          </span>
          <h2 className="font-headline font-black text-4xl uppercase tracking-tighter mb-2">
            HERE&apos;S WHAT WE CAPTURED
          </h2>
          <p className="font-body text-on-surface-variant mb-8">
            Please review the summary below. If everything looks right, hit
            confirm to submit your request to the team.
          </p>

          {tickets.map((ticket, i) => (
            <div
              key={i}
              className="border-2 border-black p-6 mb-4 bg-surface-container"
            >
              <h3 className="font-headline font-bold text-xl uppercase tracking-tighter mb-3">
                {ticket.title}
              </h3>
              <p className="font-body text-on-surface-variant mb-4">
                {ticket.issueDescription}
              </p>
              <div className="border-t border-black/20 pt-3 flex flex-wrap gap-4">
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Team: {team}
                </span>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Priority: {ticket.priority}
                </span>
                <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Estimated time: {timeEstimate}
                </span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="border-4 border-black bg-error-container p-6 neo-brutalist-shadow">
            <p className="font-headline font-bold text-sm uppercase tracking-tighter mb-2 text-on-error-container">
              SUBMISSION_FAILED
            </p>
            <p className="font-body text-sm text-on-error-container">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 p-4 border-4 border-black bg-surface-container-lowest font-headline font-bold uppercase tracking-widest text-sm hover:bg-surface-container transition-colors disabled:opacity-40"
          >
            ← BACK_TO_CHAT
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 p-4 border-4 border-black bg-primary-container text-on-primary-container font-headline font-black uppercase tracking-widest text-sm hover:bg-[#cffc00] transition-colors neo-brutalist-shadow transform hover:-translate-x-1 hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "SUBMITTING..." : "CONFIRM_AND_SUBMIT"}
          </button>
        </div>
      </div>
    </section>
  );
}
