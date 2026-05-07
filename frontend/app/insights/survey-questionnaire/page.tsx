import { AuthGate } from "@/components/AuthGate";
import Link from "next/link";

export default function SurveyQuestionnairePage() {
  return (
    <AuthGate>
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/insights"
              className="font-label text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-black mb-4 inline-block"
            >
              ← INSIGHTS_TOOLS
            </Link>
            <h1 className="font-headline font-black text-4xl uppercase tracking-tighter mt-4">
              SURVEY_QUESTIONNAIRE
            </h1>
            <p className="font-body text-on-surface-variant mt-2">
              Generate a structured survey questionnaire from your brief and research inputs.
            </p>
          </div>

          <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
            <p className="font-headline font-bold text-xl uppercase tracking-tighter text-on-surface-variant">
              COMING SOON — INTAKE FORM BUILDING NOW
            </p>
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
