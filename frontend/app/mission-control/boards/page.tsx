"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useIsAnalyst } from "@/lib/useIsAnalyst";
import { AuthGate } from "@/components/AuthGate";
import type { BoardRecord } from "@/lib/types";

export default function BoardsPage() {
  const { data: session } = useSession();
  const { isAnalyst, isLoading: isCheckingAnalyst } = useIsAnalyst();
  const [boards, setBoards] = useState<BoardRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  async function fetchBoards() {
    try {
      const res = await fetch("/api/boards");
      const data = await res.json();
      setBoards(data.boards ?? []);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim() || !session?.user?.email) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBoardName.trim(),
          created_by_email: session.user.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBoards((prev) => [data.board, ...prev]);
        setNewBoardName("");
      }
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteBoard(boardId: string) {
    try {
      const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBoards((prev) => prev.filter((b) => b.id !== boardId));
      }
    } catch (error) {
      console.error("Failed to delete board:", error);
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

  if (!isAnalyst) {
    return (
      <AuthGate>
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="border-4 border-black bg-error-container neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter">
                ANALYST_ACCESS_ONLY
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                href="/mission-control"
                className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary mb-2 inline-block"
              >
                ← MISSION_CONTROL
              </Link>
              <h1 className="font-headline font-black text-4xl uppercase tracking-tighter">
                BOARDS
              </h1>
            </div>
            <span className="font-label text-xs font-black px-2 py-1 bg-black text-white">
              TRIAL
            </span>
          </div>

          {/* Create Board */}
          <form
            onSubmit={handleCreateBoard}
            className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-6 mb-8 flex gap-4"
          >
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="New board name..."
              className="flex-1 px-4 py-3 border-4 border-black font-body bg-white focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isCreating || !newBoardName.trim()}
              className="px-8 py-3 bg-primary-container text-on-primary-container border-4 border-black font-headline font-bold uppercase tracking-widest text-sm hover:bg-[#cffc00] transition-colors disabled:opacity-50"
            >
              {isCreating ? "CREATING..." : "CREATE_BOARD"}
            </button>
          </form>

          {/* Board List */}
          {boards.length === 0 ? (
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter text-on-surface-variant">
                NO_BOARDS_YET
              </p>
              <p className="font-body text-sm text-on-surface-variant mt-2">
                Create your first board above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-6 flex items-center justify-between hover:-translate-x-1 hover:-translate-y-1 transition-transform"
                >
                  <Link
                    href={`/mission-control/boards/${board.id}`}
                    className="flex-1"
                  >
                    <h2 className="font-headline font-bold text-2xl uppercase tracking-tighter">
                      {board.name}
                    </h2>
                    <p className="font-body text-sm text-on-surface-variant mt-1">
                      Created by {board.created_by_email} ·{" "}
                      {new Date(board.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDeleteBoard(board.id)}
                    className="px-4 py-2 border-4 border-black font-headline font-bold uppercase text-xs tracking-widest hover:bg-error-container hover:text-on-error-container transition-colors"
                  >
                    DELETE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}
