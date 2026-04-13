"use client";

import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TeamSelector } from "@/components/TeamSelector";
import { Chat } from "@/components/Chat";

export default function SubmitRequestPage() {
  const [team, setTeam] = useState<string | null>(null);

  return (
    <AuthGate>
      {team ? (
        <Chat pathway="stakeholder" team={team} />
      ) : (
        <TeamSelector pathway="stakeholder" onSelect={setTeam} />
      )}
    </AuthGate>
  );
}
