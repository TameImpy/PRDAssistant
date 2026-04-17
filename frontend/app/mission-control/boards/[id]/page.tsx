"use client";

import { useState, useEffect, use, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useIsAnalyst } from "@/lib/useIsAnalyst";
import { AuthGate } from "@/components/AuthGate";
import type { BoardRecord, GroupRecord, BoardItemRecord, BoardItemStatus, BoardItemPriority, BoardItemType } from "@/lib/types";

const STATUS_OPTIONS: BoardItemStatus[] = ["Not Started", "Working on it", "Stuck", "Waiting for review", "Done"];
const PRIORITY_OPTIONS: BoardItemPriority[] = ["Critical", "High", "Medium", "Low"];
const TYPE_OPTIONS: BoardItemType[] = ["Story", "Bug", "Spike", "Epic"];
const TEAM_OPTIONS = [
  "ELG/LT", "Product & Optimisation", "Analytics Engineering", "Data & Analytics",
  "Audience & Insights", "Cross-department", "Ad Product/Delivery", "Sales",
  "Wider Revops", "Content",
];
const ESTIMATE_OPTIONS = [1, 2, 3, 5, 8, 13];

type EditingCell = { itemId: string; field: string } | null;
type Filters = { owner: string; status: string; team: string };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function BoardDetailPage({ params }: PageProps) {
  const { id: boardId } = use(params);
  const { data: session } = useSession();
  const { isAnalyst, isLoading: isCheckingAnalyst } = useIsAnalyst();
  const [board, setBoard] = useState<BoardRecord | null>(null);
  const [groups, setGroups] = useState<GroupRecord[]>([]);
  const [items, setItems] = useState<BoardItemRecord[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [addingItemToGroup, setAddingItemToGroup] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [filters, setFilters] = useState<Filters>({ owner: "", status: "", team: "" });
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCell]);

  async function fetchBoardData() {
    try {
      const [boardRes, groupsRes, itemsRes] = await Promise.all([
        fetch(`/api/boards/${boardId}`),
        fetch(`/api/boards/${boardId}/groups`),
        fetch(`/api/boards/${boardId}/items`),
      ]);

      const [boardData, groupsData, itemsData] = await Promise.all([
        boardRes.json(), groupsRes.json(), itemsRes.json(),
      ]);

      if (boardData.board) setBoard(boardData.board);
      setGroups(groupsData.groups ?? []);
      setItems(itemsData.items ?? []);
    } catch (error) {
      console.error("Failed to fetch board data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Board CRUD ---

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setGroups((prev) => [...prev, data.group]);
        setNewGroupName("");
      }
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  }

  async function handleCreateItem(groupId: string) {
    if (!newItemName.trim()) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/groups/${groupId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => [...prev, data.item]);
        setNewItemName("");
        setAddingItemToGroup(null);
      }
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  }

  // --- Inline Item Editing (#46) ---

  async function handleUpdateItem(itemId: string, updates: Record<string, any>) {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    );
    setEditingCell(null);

    try {
      const res = await fetch(`/api/boards/${boardId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, ...data.item } : item))
        );
      }
    } catch (error) {
      console.error("Failed to update item:", error);
      fetchBoardData(); // revert on failure
    }
  }

  async function handleDeleteItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    try {
      await fetch(`/api/boards/${boardId}/items/${itemId}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete item:", error);
      fetchBoardData();
    }
  }

  function startEditing(itemId: string, field: string, currentValue: string | number | null) {
    setEditingCell({ itemId, field });
    setEditValue(String(currentValue ?? ""));
  }

  function commitEdit(itemId: string, field: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    let value: any = editValue;
    if (field === "estimate") {
      value = editValue ? parseInt(editValue, 10) : null;
    }

    if (String(value ?? "") !== String((item as any)[field] ?? "")) {
      handleUpdateItem(itemId, { [field]: value });
    } else {
      setEditingCell(null);
    }
  }

  // --- Group Management (#47) ---

  async function handleRenameGroup(groupId: string) {
    if (!editGroupName.trim()) {
      setEditingGroupId(null);
      return;
    }
    const group = groups.find((g) => g.id === groupId);
    if (group && editGroupName.trim() === group.name) {
      setEditingGroupId(null);
      return;
    }

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: editGroupName.trim() } : g))
    );
    setEditingGroupId(null);

    try {
      await fetch(`/api/boards/${boardId}/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editGroupName.trim() }),
      });
    } catch (error) {
      console.error("Failed to rename group:", error);
      fetchBoardData();
    }
  }

  async function handleDeleteGroup(groupId: string) {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setItems((prev) => prev.filter((i) => i.group_id !== groupId));
    setConfirmDeleteGroup(null);

    try {
      await fetch(`/api/boards/${boardId}/groups/${groupId}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete group:", error);
      fetchBoardData();
    }
  }

  async function handleMoveGroup(groupId: string, direction: "up" | "down") {
    const idx = groups.findIndex((g) => g.id === groupId);
    if (direction === "up" && idx <= 0) return;
    if (direction === "down" && idx >= groups.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newGroups = [...groups];
    [newGroups[idx], newGroups[swapIdx]] = [newGroups[swapIdx], newGroups[idx]];

    // Update positions
    const updatedGroups = newGroups.map((g, i) => ({ ...g, position: i }));
    setGroups(updatedGroups);

    // Persist both position changes
    try {
      await Promise.all([
        fetch(`/api/boards/${boardId}/groups/${updatedGroups[idx].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: idx }),
        }),
        fetch(`/api/boards/${boardId}/groups/${updatedGroups[swapIdx].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: swapIdx }),
        }),
      ]);
    } catch (error) {
      console.error("Failed to reorder groups:", error);
      fetchBoardData();
    }
  }

  // --- Drag and Drop (#48) ---

  function handleDragStart(e: React.DragEvent, itemId: string) {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", itemId);
  }

  function handleDragOver(e: React.DragEvent, groupId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGroupId(groupId);
  }

  function handleDragLeave() {
    setDragOverGroupId(null);
  }

  async function handleDrop(e: React.DragEvent, targetGroupId: string) {
    e.preventDefault();
    setDragOverGroupId(null);

    if (!draggedItemId) return;

    const item = items.find((i) => i.id === draggedItemId);
    if (!item || item.group_id === targetGroupId) {
      setDraggedItemId(null);
      return;
    }

    // Optimistic: move item to new group
    const targetGroupItems = items.filter((i) => i.group_id === targetGroupId);
    const newPosition = targetGroupItems.length;

    setItems((prev) =>
      prev.map((i) =>
        i.id === draggedItemId
          ? { ...i, group_id: targetGroupId, position: newPosition }
          : i
      )
    );
    setDraggedItemId(null);

    try {
      await fetch(`/api/boards/${boardId}/items/${draggedItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: targetGroupId, position: newPosition }),
      });
    } catch (error) {
      console.error("Failed to move item:", error);
      fetchBoardData();
    }
  }

  function handleDragEnd() {
    setDraggedItemId(null);
    setDragOverGroupId(null);
  }

  // --- Filters (#49) ---

  function getFilteredItems(groupId: string) {
    return items.filter((item) => {
      if (item.group_id !== groupId) return false;
      if (filters.owner && item.owner !== filters.owner) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.team && item.team !== filters.team) return false;
      return true;
    });
  }

  function getUniqueValues(field: keyof BoardItemRecord): string[] {
    const values = new Set(items.map((item) => String(item[field] ?? "")).filter(Boolean));
    return Array.from(values).sort();
  }

  const hasActiveFilters = filters.owner || filters.status || filters.team;

  // --- Rendering helpers ---

  function toggleGroupCollapse(groupId: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "Done": return "bg-primary-container text-on-primary-container";
      case "Working on it": return "bg-tertiary-container text-on-tertiary-container";
      case "Stuck": return "bg-error-container text-on-error-container";
      case "Waiting for review": return "bg-secondary-container text-on-secondary-container";
      default: return "bg-surface-container text-on-surface-variant";
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "Critical": return "bg-error-container text-on-error-container";
      case "High": return "bg-tertiary-container text-on-tertiary-container";
      case "Medium": return "bg-secondary-container text-on-secondary-container";
      default: return "bg-surface-container text-on-surface-variant";
    }
  }

  function renderEditableCell(item: BoardItemRecord, field: string, displayValue: string, colorClass?: string) {
    const isEditing = editingCell?.itemId === item.id && editingCell?.field === field;

    // Dropdown fields
    const dropdownOptions: Record<string, readonly string[] | number[]> = {
      status: STATUS_OPTIONS,
      priority: PRIORITY_OPTIONS,
      type: TYPE_OPTIONS,
      team: TEAM_OPTIONS,
      estimate: ESTIMATE_OPTIONS,
    };

    if (isEditing && dropdownOptions[field]) {
      return (
        <select
          ref={editInputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            handleUpdateItem(item.id, { [field]: field === "estimate" ? (e.target.value ? parseInt(e.target.value, 10) : null) : e.target.value });
          }}
          onBlur={() => setEditingCell(null)}
          className="w-full px-1 py-0.5 border-2 border-primary font-label text-xs bg-white focus:outline-none"
        >
          {field === "estimate" && <option value="">—</option>}
          {field === "team" && <option value="">—</option>}
          {(dropdownOptions[field] as any[]).map((opt: any) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    // Text/date fields
    if (isEditing) {
      return (
        <input
          ref={editInputRef as React.RefObject<HTMLInputElement>}
          type={field === "due_date" ? "date" : "text"}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => commitEdit(item.id, field)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit(item.id, field);
            if (e.key === "Escape") setEditingCell(null);
          }}
          className="w-full px-1 py-0.5 border-2 border-primary font-body text-sm bg-white focus:outline-none"
        />
      );
    }

    return (
      <button
        onClick={() => startEditing(item.id, field, (item as any)[field])}
        className={`w-full text-left px-2 py-1 font-label text-xs hover:ring-2 hover:ring-primary transition-all cursor-pointer truncate ${colorClass ?? "text-on-surface-variant"}`}
        title={`Click to edit ${field}`}
      >
        {displayValue}
      </button>
    );
  }

  // --- Loading / Auth states ---

  if (isCheckingAnalyst || isLoading) {
    return (
      <AuthGate>
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter animate-pulse">LOADING...</p>
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
          <div className="max-w-7xl mx-auto">
            <div className="border-4 border-black bg-error-container neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter">ANALYST_ACCESS_ONLY</p>
            </div>
          </div>
        </section>
      </AuthGate>
    );
  }

  if (!board) {
    return (
      <AuthGate>
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="border-4 border-black bg-error-container neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter">BOARD_NOT_FOUND</p>
            </div>
          </div>
        </section>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/mission-control/boards"
              className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary mb-2 inline-block"
            >
              &larr; BOARDS
            </Link>
            <h1 className="font-headline font-black text-4xl uppercase tracking-tighter">
              {board.name}
            </h1>
          </div>

          {/* Filters (#49) */}
          <div className="border-4 border-black bg-surface-container-lowest p-4 mb-6 flex flex-wrap gap-4 items-center">
            <span className="font-label text-xs font-black uppercase tracking-widest">FILTERS:</span>

            <select
              value={filters.owner}
              onChange={(e) => setFilters((f) => ({ ...f, owner: e.target.value }))}
              className="px-3 py-1.5 border-2 border-black font-label text-xs bg-white focus:outline-none focus:border-primary"
            >
              <option value="">All Owners</option>
              {getUniqueValues("owner").map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="px-3 py-1.5 border-2 border-black font-label text-xs bg-white focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <select
              value={filters.team}
              onChange={(e) => setFilters((f) => ({ ...f, team: e.target.value }))}
              className="px-3 py-1.5 border-2 border-black font-label text-xs bg-white focus:outline-none focus:border-primary"
            >
              <option value="">All Teams</option>
              {getUniqueValues("team").map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ owner: "", status: "", team: "" })}
                className="px-3 py-1.5 border-2 border-black font-label text-xs font-bold uppercase tracking-widest hover:bg-error-container transition-colors"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Add Group */}
          <form onSubmit={handleCreateGroup} className="flex gap-4 mb-8">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New group name..."
              className="flex-1 px-4 py-2 border-4 border-black font-body bg-white focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!newGroupName.trim()}
              className="px-6 py-2 bg-primary-container text-on-primary-container border-4 border-black font-headline font-bold uppercase tracking-widest text-xs hover:bg-[#cffc00] transition-colors disabled:opacity-50"
            >
              ADD_GROUP
            </button>
          </form>

          {/* Groups */}
          {groups.length === 0 ? (
            <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
              <p className="font-headline font-bold text-xl uppercase tracking-tighter text-on-surface-variant">NO_GROUPS_YET</p>
              <p className="font-body text-sm text-on-surface-variant mt-2">Add a group above to start organising items.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group, groupIdx) => {
                const allGroupItems = items.filter((i) => i.group_id === group.id);
                const filteredItems = getFilteredItems(group.id);
                const isCollapsed = collapsedGroups.has(group.id);
                const isDragOver = dragOverGroupId === group.id;

                return (
                  <div
                    key={group.id}
                    className={`border-4 border-black bg-surface-container-lowest neo-brutalist-shadow transition-all ${
                      isDragOver ? "ring-4 ring-primary" : ""
                    }`}
                    onDragOver={(e) => handleDragOver(e, group.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, group.id)}
                  >
                    {/* Group Header */}
                    <div className="px-6 py-4 flex items-center justify-between bg-black text-white">
                      <div className="flex items-center gap-3 flex-1">
                        <button onClick={() => toggleGroupCollapse(group.id)} className="font-headline font-bold text-lg hover:text-primary-container">
                          {isCollapsed ? "▶" : "▼"}
                        </button>

                        {editingGroupId === group.id ? (
                          <input
                            type="text"
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                            onBlur={() => handleRenameGroup(group.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameGroup(group.id);
                              if (e.key === "Escape") setEditingGroupId(null);
                            }}
                            className="px-2 py-0.5 bg-white text-black font-headline font-bold text-lg uppercase tracking-tighter border-2 border-primary focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setEditingGroupId(group.id);
                              setEditGroupName(group.name);
                            }}
                            className="font-headline font-bold text-lg uppercase tracking-tighter hover:text-primary-container"
                            title="Click to rename"
                          >
                            {group.name}
                          </button>
                        )}

                        <span className="font-label text-xs font-bold px-2 py-0.5 bg-white/20">
                          {hasActiveFilters ? `${filteredItems.length}/${allGroupItems.length}` : allGroupItems.length}
                        </span>
                      </div>

                      {/* Group controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveGroup(group.id, "up")}
                          disabled={groupIdx === 0}
                          className="px-2 py-1 text-xs hover:bg-white/20 disabled:opacity-30 transition-colors"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveGroup(group.id, "down")}
                          disabled={groupIdx === groups.length - 1}
                          className="px-2 py-1 text-xs hover:bg-white/20 disabled:opacity-30 transition-colors"
                          title="Move down"
                        >
                          ▼
                        </button>
                        {confirmDeleteGroup === group.id ? (
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs">Delete?</span>
                            <button
                              onClick={() => handleDeleteGroup(group.id)}
                              className="px-2 py-1 text-xs bg-error-container text-on-error-container hover:opacity-80"
                            >
                              YES
                            </button>
                            <button
                              onClick={() => setConfirmDeleteGroup(null)}
                              className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30"
                            >
                              NO
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteGroup(group.id)}
                            className="px-2 py-1 text-xs hover:bg-error-container hover:text-on-error-container transition-colors ml-2"
                            title="Delete group"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Group Content */}
                    {!isCollapsed && (
                      <div>
                        {/* Column Headers */}
                        <div className="grid grid-cols-[24px_1fr_130px_90px_80px_70px_70px_100px_24px] gap-0 px-4 py-2 border-b-2 border-black bg-surface-container">
                          <span></span>
                          <span className="font-label text-xs font-black uppercase tracking-widest">Name</span>
                          <span className="font-label text-xs font-black uppercase tracking-widest">Status</span>
                          <span className="font-label text-xs font-black uppercase tracking-widest">Priority</span>
                          <span className="font-label text-xs font-black uppercase tracking-widest">Type</span>
                          <span className="font-label text-xs font-black uppercase tracking-widest">Est.</span>
                          <span className="font-label text-xs font-black uppercase tracking-widest">Owner</span>
                          <span className="font-label text-xs font-black uppercase tracking-widest">Due</span>
                          <span></span>
                        </div>

                        {/* Items */}
                        {filteredItems.length === 0 && allGroupItems.length > 0 && hasActiveFilters ? (
                          <div className="px-6 py-4 text-center">
                            <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest">No matching items</span>
                          </div>
                        ) : (
                          filteredItems.map((item) => (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.id)}
                              onDragEnd={handleDragEnd}
                              className={`grid grid-cols-[24px_1fr_130px_90px_80px_70px_70px_100px_24px] gap-0 px-4 py-2 border-b border-black/10 hover:bg-surface-container transition-colors items-center ${
                                draggedItemId === item.id ? "opacity-40" : ""
                              }`}
                            >
                              {/* Drag handle */}
                              <span className="cursor-grab active:cursor-grabbing text-on-surface-variant text-xs select-none" title="Drag to move">
                                ⠿
                              </span>

                              {/* Name */}
                              {renderEditableCell(item, "name", item.name, "font-body font-medium text-sm")}

                              {/* Status */}
                              {renderEditableCell(item, "status", item.status, `font-bold ${getStatusColor(item.status)}`)}

                              {/* Priority */}
                              {renderEditableCell(item, "priority", item.priority, `font-bold ${getPriorityColor(item.priority)}`)}

                              {/* Type */}
                              {renderEditableCell(item, "type", item.type)}

                              {/* Estimate */}
                              {renderEditableCell(item, "estimate", item.estimate != null ? String(item.estimate) : "—")}

                              {/* Owner */}
                              {renderEditableCell(item, "owner", item.owner || "—")}

                              {/* Due date */}
                              {renderEditableCell(item, "due_date", item.due_date ? new Date(item.due_date).toLocaleDateString() : "—")}

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-xs text-on-surface-variant hover:text-error-container transition-colors"
                                title="Delete item"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}

                        {/* Add Item */}
                        {addingItemToGroup === group.id ? (
                          <div className="px-4 py-3 flex gap-2 border-t-2 border-black/20">
                            <input
                              type="text"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreateItem(group.id);
                                if (e.key === "Escape") {
                                  setAddingItemToGroup(null);
                                  setNewItemName("");
                                }
                              }}
                              placeholder="Item name..."
                              className="flex-1 px-3 py-2 border-2 border-black font-body text-sm bg-white focus:outline-none focus:border-primary"
                              autoFocus
                            />
                            <button
                              onClick={() => handleCreateItem(group.id)}
                              disabled={!newItemName.trim()}
                              className="px-4 py-2 bg-primary-container border-2 border-black font-headline font-bold uppercase text-xs tracking-widest hover:bg-[#cffc00] disabled:opacity-50"
                            >
                              ADD
                            </button>
                            <button
                              onClick={() => { setAddingItemToGroup(null); setNewItemName(""); }}
                              className="px-4 py-2 border-2 border-black font-headline font-bold uppercase text-xs tracking-widest hover:bg-surface-container"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingItemToGroup(group.id)}
                            className="w-full px-6 py-3 text-left font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          >
                            + ADD_ITEM
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}
