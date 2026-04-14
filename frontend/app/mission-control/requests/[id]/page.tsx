"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useIsAnalyst } from "@/lib/useIsAnalyst";
import { AuthGate } from "@/components/AuthGate";
import { TEAMS } from "@/components/TeamSelector";
import type { RequestRecord } from "@/lib/types";
import type { Ticket } from "@/lib/tickets";

const VALID_POINTS = [1, 2, 3, 5, 8, 13];
const VALID_PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;
const VALID_TYPES = ["Story", "Bug", "Spike"] as const;

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAnalyst, isLoading: isCheckingAnalyst } = useIsAnalyst();
  const [request, setRequest] = useState<RequestRecord | null>(null);
  const [editedTickets, setEditedTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; boardUrl?: string; error?: string } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (!isAnalyst || !params.id) return;

    fetch(`/api/requests/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.request) {
          setRequest(data.request);
          setEditedTickets(data.request.tickets);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAnalyst, params.id]);

  function updateTicket(index: number, field: keyof Ticket, value: any) {
    setEditedTickets((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function updateAcceptanceCriteria(ticketIndex: number, criteriaIndex: number, value: string) {
    setEditedTickets((prev) => {
      const updated = [...prev];
      const criteria = [...updated[ticketIndex].acceptanceCriteria];
      criteria[criteriaIndex] = value;
      updated[ticketIndex] = { ...updated[ticketIndex], acceptanceCriteria: criteria };
      return updated;
    });
  }

  function addAcceptanceCriteria(ticketIndex: number) {
    setEditedTickets((prev) => {
      const updated = [...prev];
      updated[ticketIndex] = {
        ...updated[ticketIndex],
        acceptanceCriteria: [...updated[ticketIndex].acceptanceCriteria, ""],
      };
      return updated;
    });
  }

  function removeAcceptanceCriteria(ticketIndex: number, criteriaIndex: number) {
    setEditedTickets((prev) => {
      const updated = [...prev];
      const criteria = updated[ticketIndex].acceptanceCriteria.filter((_, i) => i !== criteriaIndex);
      updated[ticketIndex] = { ...updated[ticketIndex], acceptanceCriteria: criteria };
      return updated;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: editedTickets }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage("Saved");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    } catch {
      setSaveMessage("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitToBacklog() {
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      // Save any pending edits first
      await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: editedTickets }),
      });

      const res = await fetch(`/api/requests/${params.id}/submit`, { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setSubmitResult({ success: true, boardUrl: data.boardUrl });
        setRequest((prev) => prev ? { ...prev, status: "Submitted to Backlog" } : prev);
      } else {
        setSubmitResult({ success: false, error: data.error });
      }
    } catch {
      setSubmitResult({ success: false, error: "Failed to connect to server" });
    } finally {
      setIsSubmitting(false);
      setShowSubmitConfirm(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/requests/${params.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/mission-control");
      }
    } catch {
      // stay on page
    } finally {
      setIsRejecting(false);
    }
  }

  if (isCheckingAnalyst || isLoading) {
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

  if (!isAnalyst || !request) {
    return (
      <AuthGate>
        <section className="px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <h2 className="font-headline font-black text-4xl uppercase tracking-tighter mb-4">
                {!isAnalyst ? "ANALYST_ACCESS_ONLY" : "REQUEST_NOT_FOUND"}
              </h2>
            </div>
          </div>
        </section>
      </AuthGate>
    );
  }

  const isEditable = request.status === "Open";

  return (
    <AuthGate>
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back + header */}
          <button
            onClick={() => router.push("/mission-control")}
            className="font-headline font-bold text-sm uppercase tracking-widest mb-6 hover:text-primary transition-colors"
          >
            &larr; BACK_TO_QUEUE
          </button>

          {/* Request metadata */}
          <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-8 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-label text-xs font-black px-2 py-1 bg-black text-white mr-2">
                  REQUEST
                </span>
                <span
                  className={`font-label text-xs font-black px-2 py-1 ${
                    request.status === "Open"
                      ? "bg-tertiary-container text-on-tertiary-container"
                      : request.status === "Rejected"
                        ? "bg-error-container text-on-error-container"
                        : "bg-primary-container text-on-primary-container"
                  }`}
                >
                  {request.status === "Submitted to Backlog" ? "SUBMITTED" : request.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">REQUESTED_BY</p>
                <p className="font-body font-bold">{request.requested_by}</p>
              </div>
              <div>
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">SUBMITTED_BY</p>
                <p className="font-body font-bold">{request.submitted_by_name}</p>
                <p className="font-body text-xs text-on-surface-variant">{request.submitted_by_email}</p>
              </div>
              <div>
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">TEAM</p>
                <p className="font-body font-bold">{request.team}</p>
              </div>
              <div>
                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">CREATED</p>
                <p className="font-body font-bold">{new Date(request.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Conversation transcript (collapsible) */}
          <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow mb-6">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full p-4 font-headline font-bold uppercase tracking-widest text-sm text-left flex justify-between items-center hover:bg-surface-container transition-colors"
            >
              <span>VIEW_ORIGINAL_CONVERSATION</span>
              <span>{showTranscript ? "▲" : "▼"}</span>
            </button>
            {showTranscript && (
              <div className="border-t-4 border-black p-6 space-y-3 max-h-96 overflow-y-auto">
                {request.conversation_transcript.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 border-2 border-black ${
                        msg.role === "user"
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-container"
                      }`}
                    >
                      <p className="font-body text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ticket cards */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-headline font-black text-3xl uppercase tracking-tighter">
                TICKETS ({editedTickets.length})
              </h2>
              {isEditable && (
                <div className="flex items-center gap-3">
                  {saveMessage && (
                    <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      {saveMessage}
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-black text-white px-6 py-3 border-4 border-black font-headline font-bold uppercase tracking-widest text-xs hover:bg-surface-container-highest hover:text-black transition-colors disabled:opacity-40"
                  >
                    {isSaving ? "SAVING..." : "SAVE_CHANGES"}
                  </button>
                </div>
              )}
            </div>

            {editedTickets.map((ticket, ti) => (
              <div key={ti} className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-6">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                      TITLE
                    </label>
                    <input
                      type="text"
                      value={ticket.title}
                      onChange={(e) => updateTicket(ti, "title", e.target.value.slice(0, 60))}
                      disabled={!isEditable}
                      maxLength={60}
                      className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none focus:border-primary disabled:opacity-60"
                    />
                  </div>

                  {/* User Story */}
                  <div>
                    <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                      USER_STORY
                    </label>
                    <textarea
                      value={ticket.userStory}
                      onChange={(e) => updateTicket(ti, "userStory", e.target.value)}
                      disabled={!isEditable}
                      rows={3}
                      className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none focus:border-primary disabled:opacity-60 resize-vertical"
                    />
                  </div>

                  {/* Acceptance Criteria */}
                  <div>
                    <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                      ACCEPTANCE_CRITERIA
                    </label>
                    {ticket.acceptanceCriteria.map((ac, ci) => (
                      <div key={ci} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={ac}
                          onChange={(e) => updateAcceptanceCriteria(ti, ci, e.target.value)}
                          disabled={!isEditable}
                          className="flex-1 p-2 border-2 border-black font-body text-sm bg-surface-container-lowest focus:outline-none focus:border-primary disabled:opacity-60"
                        />
                        {isEditable && (
                          <button
                            onClick={() => removeAcceptanceCriteria(ti, ci)}
                            className="px-3 border-2 border-black font-headline font-bold text-sm hover:bg-error-container transition-colors"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditable && (
                      <button
                        onClick={() => addAcceptanceCriteria(ti)}
                        className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary"
                      >
                        + ADD_CRITERIA
                      </button>
                    )}
                  </div>

                  {/* Dropdowns row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                        STORY_POINTS
                      </label>
                      <select
                        value={ticket.storyPoints}
                        onChange={(e) => updateTicket(ti, "storyPoints", Number(e.target.value))}
                        disabled={!isEditable}
                        className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none disabled:opacity-60"
                      >
                        {VALID_POINTS.map((sp) => (
                          <option key={sp} value={sp}>{sp}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                        PRIORITY
                      </label>
                      <select
                        value={ticket.priority}
                        onChange={(e) => updateTicket(ti, "priority", e.target.value)}
                        disabled={!isEditable}
                        className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none disabled:opacity-60"
                      >
                        {VALID_PRIORITIES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                        TYPE
                      </label>
                      <select
                        value={ticket.type}
                        onChange={(e) => updateTicket(ti, "type", e.target.value)}
                        disabled={!isEditable}
                        className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none disabled:opacity-60"
                      >
                        {VALID_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                        TEAM
                      </label>
                      <select
                        value={ticket.team}
                        onChange={(e) => updateTicket(ti, "team", e.target.value)}
                        disabled={!isEditable}
                        className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none disabled:opacity-60"
                      >
                        {TEAMS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dependencies */}
                  <div>
                    <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                      DEPENDENCIES
                    </label>
                    <textarea
                      value={ticket.dependencies}
                      onChange={(e) => updateTicket(ti, "dependencies", e.target.value)}
                      disabled={!isEditable}
                      rows={2}
                      className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none focus:border-primary disabled:opacity-60 resize-vertical"
                    />
                  </div>

                  {/* Issue Description */}
                  <div>
                    <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                      ISSUE_DESCRIPTION
                    </label>
                    <textarea
                      value={ticket.issueDescription}
                      onChange={(e) => updateTicket(ti, "issueDescription", e.target.value)}
                      disabled={!isEditable}
                      rows={2}
                      className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none focus:border-primary disabled:opacity-60 resize-vertical"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {isEditable && (
            <div className="mt-8 space-y-4">
              {/* Submit confirmation dialog */}
              {showSubmitConfirm && (
                <div className="border-4 border-black bg-primary-container neo-brutalist-shadow p-6">
                  <p className="font-headline font-bold text-sm uppercase tracking-tighter mb-4">
                    This will create {editedTickets.length} {editedTickets.length === 1 ? "ticket" : "tickets"} on the Monday.com backlog. Proceed?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowSubmitConfirm(false)}
                      disabled={isSubmitting}
                      className="flex-1 p-3 border-4 border-black bg-surface-container-lowest font-headline font-bold uppercase tracking-widest text-xs hover:bg-surface-container transition-colors disabled:opacity-40"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleSubmitToBacklog}
                      disabled={isSubmitting}
                      className="flex-1 p-3 border-4 border-black bg-black text-white font-headline font-black uppercase tracking-widest text-xs hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-40"
                    >
                      {isSubmitting ? "SUBMITTING..." : "YES_SUBMIT"}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit result */}
              {submitResult && (
                <div className={`border-4 border-black neo-brutalist-shadow p-6 ${submitResult.success ? "bg-primary-container" : "bg-error-container"}`}>
                  {submitResult.success ? (
                    <>
                      <p className="font-headline font-bold text-sm uppercase tracking-tighter mb-2">
                        SUBMITTED_TO_BACKLOG
                      </p>
                      {submitResult.boardUrl && (
                        <a
                          href={submitResult.boardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-label text-sm font-bold uppercase tracking-widest underline decoration-2 underline-offset-4"
                        >
                          VIEW_ON_MONDAY.COM &rarr;
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="font-headline font-bold text-sm uppercase tracking-tighter text-on-error-container">
                      FAILED: {submitResult.error}
                    </p>
                  )}
                </div>
              )}

              {/* Reject form */}
              {showRejectForm && (
                <div className="border-4 border-black bg-error-container neo-brutalist-shadow p-6">
                  <p className="font-headline font-bold text-sm uppercase tracking-tighter mb-3 text-on-error-container">
                    WHY_IS_THIS_BEING_REJECTED?
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    rows={3}
                    className="w-full p-3 border-2 border-black font-body bg-surface-container-lowest focus:outline-none mb-3 resize-vertical"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                      disabled={isRejecting}
                      className="flex-1 p-3 border-4 border-black bg-surface-container-lowest font-headline font-bold uppercase tracking-widest text-xs hover:bg-surface-container transition-colors disabled:opacity-40"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isRejecting || !rejectReason.trim()}
                      className="flex-1 p-3 border-4 border-black bg-black text-white font-headline font-black uppercase tracking-widest text-xs hover:bg-error-container hover:text-on-error-container transition-colors disabled:opacity-40"
                    >
                      {isRejecting ? "REJECTING..." : "CONFIRM_REJECT"}
                    </button>
                  </div>
                </div>
              )}

              {!showSubmitConfirm && !showRejectForm && !submitResult?.success && (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 p-4 border-4 border-black bg-surface-container-lowest font-headline font-bold uppercase tracking-widest text-sm hover:bg-error-container hover:text-on-error-container transition-colors"
                  >
                    REJECT
                  </button>
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="flex-1 p-4 border-4 border-black bg-primary-container text-on-primary-container font-headline font-black uppercase tracking-widest text-sm hover:bg-[#cffc00] transition-colors neo-brutalist-shadow transform hover:-translate-x-1 hover:-translate-y-1"
                  >
                    SUBMIT_TO_BACKLOG
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}
