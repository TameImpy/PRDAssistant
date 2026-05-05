import Link from "next/link";
import { AuthGate } from "@/components/AuthGate";

export default function InsightsPage() {
  return (
    <AuthGate>
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <span className="font-label text-xs font-black px-2 py-1 bg-black text-white mb-4 inline-block">
              INSIGHTS_TOOLS
            </span>
            <p className="font-body text-on-surface-variant mt-4">
              AI-powered tools for the Insights team. Select a tool to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 neo-brutalist-shadow-lg max-w-3xl">
            <Link
              href="/insights/survey-questionnaire"
              className="p-8 border-4 border-black bg-surface-container-lowest font-headline hover:bg-primary-container hover:text-on-primary-container transition-colors flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
                <span className="font-label text-xs font-black px-2 py-1 bg-black text-white">
                  UC-005
                </span>
              </div>
              <h3 className="font-headline font-bold text-2xl uppercase tracking-tighter">
                SURVEY_QUESTIONNAIRE
              </h3>
              <p className="font-body text-sm font-normal normal-case tracking-normal text-on-surface-variant">
                Generate a complete, structured survey questionnaire from a brief. Includes inline editor and Word download.
              </p>
              <div className="mt-auto border-t-2 border-black pt-4">
                <span className="font-label font-black text-sm uppercase flex items-center gap-2">
                  START_DRAFTING →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </AuthGate>
  );
}
