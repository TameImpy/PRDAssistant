"use client";

import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TeamSelector } from "@/components/TeamSelector";
import { Chat } from "@/components/Chat";
import type { ContextItem } from "@/lib/context-upload";

export default function CreateTicketPage() {
  const [team, setTeam] = useState<string | null>(null);
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);

  function handleSelect(selectedTeam: string, items?: ContextItem[]) {
    setTeam(selectedTeam);
    setContextItems(items || []);
  }

  return (
    <AuthGate>
      {team ? (
        <Chat pathway="analyst" team={team} contextItems={contextItems} />
      ) : (
        <TeamSelector pathway="analyst" onSelect={handleSelect} />
      )}
    </AuthGate>
  );
}
