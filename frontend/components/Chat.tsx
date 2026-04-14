"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { ConversationMessage } from "@/lib/conversation";
import type { ExtractedFields } from "@/lib/conversation";
import type { Ticket } from "@/lib/tickets";
import { ReviewScreen } from "./ReviewScreen";

type ChatProps = {
  pathway: "stakeholder" | "analyst";
  team: string;
};

type ChatState = "chatting" | "reviewing" | "confirmed";

export function Chat({ pathway, team }: ChatProps) {
  const { data: session } = useSession();
  const [extractedFields, setExtractedFields] = useState<ExtractedFields | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: "assistant",
      content:
        "Hi there! Welcome to DATA_WORKSHOP. I'm here to help you submit a request to the Commercial Analysts team. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<ChatState>("chatting");
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [boardUrl, setBoardUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      role: "user",
      content: input.trim(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          pathway,
          team,
        }),
      });

      const data = await response.json();

      const assistantContent = data.message || data.error || "I didn't catch that — could you try again?";
      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantContent },
      ]);

      if (data.isComplete && data.tickets) {
        setTickets(data.tickets);
        if (data.extractedFields) {
          setExtractedFields(data.extractedFields);
        }
        // Don't immediately switch to review — let the user read the summary message first
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try sending your message again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  if (state === "reviewing" && tickets) {
    return (
      <ReviewScreen
        tickets={tickets}
        pathway={pathway}
        team={team}
        messages={messages}
        submittedByName={session?.user?.name || undefined}
        submittedByEmail={session?.user?.email || undefined}
        requestedBy={extractedFields?.requestedBy || undefined}
        onBack={() => setState("chatting")}
        onConfirm={(url) => {
          setBoardUrl(url || null);
          setState("confirmed");
        }}
      />
    );
  }

  if (state === "confirmed") {
    return (
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="border-4 border-black bg-primary-container neo-brutalist-shadow p-12 text-center">
            <h2 className="font-headline font-black text-4xl uppercase tracking-tighter mb-4">
              {pathway === "stakeholder" ? "REQUEST_SUBMITTED" : "TICKET_CREATED"}
            </h2>
            <p className="font-body text-on-primary-container text-lg mb-8">
              {pathway === "stakeholder"
                ? "Your request has been received and is in the review queue. An analyst will review, shape, and prioritise it. If we need more info, we'll reach out."
                : "Your ticket has been added to the backlog. It's ready for refinement and sprint planning."}
            </p>
            {boardUrl && pathway === "analyst" && (
              <a
                href={boardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mb-6 font-label text-sm font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 text-on-primary-container hover:text-black"
              >
                VIEW_ON_MONDAY.COM →
              </a>
            )}
            <br />
            <button
              onClick={() => {
                setMessages([
                  {
                    role: "assistant",
                    content:
                      "Hi there! Welcome back. What can I help you with today?",
                  },
                ]);
                setTickets(null);
                setState("chatting");
              }}
              className="bg-black text-white px-8 py-4 border-4 border-black font-headline font-black uppercase tracking-widest hover:bg-surface-container-highest hover:text-black transition-colors neo-brutalist-shadow"
            >
              SUBMIT_ANOTHER_REQUEST
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
          {/* Chat header */}
          <div className="border-b-4 border-black p-4 bg-surface-container flex justify-between items-center">
            <div>
              <span className="font-label text-xs font-black px-2 py-1 bg-black text-white mr-2">
                {pathway === "stakeholder" ? "SUBMIT_REQUEST" : "CREATE_TICKET"}
              </span>
              <span className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Team: {team}
              </span>
            </div>
            {tickets && (
              <button
                onClick={() => setState("reviewing")}
                className="bg-primary-container text-on-primary-container px-4 py-2 border-2 border-black font-headline font-bold uppercase tracking-widest text-xs hover:bg-[#cffc00] transition-colors neo-brutalist-shadow"
              >
                REVIEW_SUMMARY →
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 border-2 border-black ${
                    msg.role === "user"
                      ? "bg-primary-container text-on-primary-container neo-brutalist-shadow"
                      : "bg-surface-container"
                  }`}
                >
                  <p className="font-body text-sm whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 border-2 border-black bg-surface-container">
                  <p className="font-body text-sm text-on-surface-variant animate-pulse">
                    Thinking...
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="border-t-4 border-black flex"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 p-4 font-body bg-surface-container-lowest focus:outline-none focus:bg-primary-fixed-dim/10 placeholder-on-surface-variant/40 border-0"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-8 py-4 bg-primary-container text-on-primary-container font-headline font-black uppercase tracking-widest text-sm border-l-4 border-black hover:bg-[#cffc00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              SEND
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
