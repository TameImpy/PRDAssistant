"use client";

import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TeamSelector } from "@/components/TeamSelector";
import { Chat } from "@/components/Chat";

export default function CreateTicketPage() {
  const [team, setTeam] = useState<string | null>(null);

  return (
    <AuthGate>
      {team ? (
        <Chat pathway="analyst" team={team} />
      ) : (
        <TeamSelector pathway="analyst" onSelect={setTeam} />
      )}
    </AuthGate>
  );
}
