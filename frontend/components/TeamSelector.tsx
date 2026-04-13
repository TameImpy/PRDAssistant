"use client";

const TEAMS = [
  "ELG / LT",
  "Product & Optimisation",
  "Analytics Engineering",
  "Data & Analytics",
  "Audience & Insights",
  "Cross-department",
  "Ad Product/Delivery",
  "Sales",
  "Wider Revops",
  "Content",
];

type TeamSelectorProps = {
  pathway: "stakeholder" | "analyst";
  onSelect: (team: string) => void;
};

export function TeamSelector({ pathway, onSelect }: TeamSelectorProps) {
  const isStakeholder = pathway === "stakeholder";

  return (
    <section className="px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12">
          <span className="font-label text-xs font-black px-2 py-1 bg-black text-white mb-6 inline-block">
            STEP_01
          </span>
          <h2 className="font-headline font-black text-4xl uppercase tracking-tighter mb-2">
            {isStakeholder ? "TELL_US_YOUR_TEAM" : "SELECT_YOUR_TEAM"}
          </h2>
          <p className="font-body text-on-surface-variant mb-8">
            {isStakeholder
              ? "Which team do you represent?"
              : "Which team is this request coming from?"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEAMS.map((team) => (
              <button
                key={team}
                onClick={() => onSelect(team)}
                className="p-4 border-2 border-black bg-surface-container-lowest font-headline font-bold uppercase tracking-tighter text-left hover:bg-primary-container hover:text-on-primary-container transition-colors transform hover:-translate-x-1 hover:-translate-y-1"
              >
                {team}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
