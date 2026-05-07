import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden border-b-4 border-black">
        <div className="max-w-6xl w-full">
          <h1 className="font-headline font-black text-6xl md:text-[8rem] leading-[0.9] tracking-tighter uppercase mb-12 text-black text-left md:text-center">
            REQUEST. STRUCTURE.{" "}
            <span className="bg-primary-container px-4">SHIP.</span>
          </h1>

          {/* Pathway selector */}
          <p className="font-label text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">
            [ NOT SURE WHICH TO PICK? IF YOU&apos;RE NOT ON THE ANALYTICS TEAM, CHOOSE SUBMIT_REQUEST ]
          </p>
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-0 w-full max-w-3xl mx-auto neo-brutalist-shadow-lg">
            <Link
              href="/submit-request"
              className="flex-1 p-8 border-4 border-black bg-surface-container-lowest font-headline text-center hover:bg-primary-container hover:text-on-primary-container transition-colors flex flex-col items-center justify-center gap-3"
            >
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
              <span className="font-black uppercase tracking-widest text-xl">SUBMIT_REQUEST</span>
              <span className="font-body text-sm font-normal normal-case tracking-normal text-on-surface-variant">
                For Sales, Editorial, Product, and anyone outside the analytics team.
                Describe what you need in plain English — no technical knowledge required.
              </span>
              <span className="mt-2 font-label text-xs font-bold uppercase tracking-widest text-primary border-t border-black/20 pt-3 w-full">
                Best for: stakeholders, commercial teams, anyone with a data request
              </span>
            </Link>
            <Link
              href="/create-ticket"
              className="flex-1 p-8 border-4 border-black md:border-l-0 bg-primary-container text-on-primary-container font-headline text-center hover:bg-[#cffc00] transition-colors flex flex-col items-center justify-center gap-3"
            >
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <span className="font-black uppercase tracking-widest text-xl">CREATE_TICKET</span>
              <span className="font-body text-sm font-normal normal-case tracking-normal">
                For the Commercial Analysts team only.
                Create structured tickets with user stories, acceptance criteria, and story points.
              </span>
              <span className="mt-2 font-label text-xs font-bold uppercase tracking-widest border-t border-black/20 pt-3 w-full">
                Best for: analysts logging work from meetings or their own backlog
              </span>
            </Link>
          </div>

          <Link
            href="/insights"
            className="block w-full max-w-3xl mx-auto mt-4 p-6 border-4 border-black bg-surface-container-lowest font-headline text-center hover:bg-[#00E0FF] hover:text-black transition-colors neo-brutalist-shadow flex items-center justify-center gap-4"
          >
            <svg
              className="w-8 h-8 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.309 48.309 0 01-8.135-1.587c-1.717-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
            <div className="text-left">
              <span className="font-black uppercase tracking-widest text-lg block">INSIGHTS_TOOLS</span>
              <span className="font-body text-sm font-normal normal-case tracking-normal text-on-surface-variant">
                A suite of AI-powered tools for research and insight work. From proposal writing to survey drafting.
              </span>
              <span className="mt-3 font-label text-xs font-bold uppercase tracking-widest text-primary border-t border-black/20 pt-3 block">
                Best for: Insights Team, anyone doing market research
              </span>
            </div>
          </Link>

          <div className="mt-12 flex items-center justify-center gap-4">
            <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              POWERED BY AI // STRUCTURED FOR AGILE
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-24 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest border-4 border-black neo-brutalist-shadow flex flex-col p-8 transform hover:-translate-x-1 hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-12">
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
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
                <span className="font-label text-xs font-black px-2 py-1 bg-black text-white">
                  INTAKE
                </span>
              </div>
              <h3 className="font-headline font-bold text-3xl mb-4 uppercase tracking-tighter">
                CONVERSATIONAL
              </h3>
              <p className="font-body text-on-surface-variant mb-8">
                Talk to an AI agent that understands your request. No forms. No
                jargon. Just describe what you need.
              </p>
              <div className="mt-auto border-t-2 border-black pt-4">
                <Link
                  href="/submit-request"
                  className="font-label font-black text-sm uppercase flex items-center gap-2 hover:text-primary"
                >
                  START_TALKING →
                </Link>
              </div>
            </div>

            <div className="bg-primary-container border-4 border-black neo-brutalist-shadow flex flex-col p-8 transform hover:-translate-x-1 hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-12">
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
                  STRUCTURE
                </span>
              </div>
              <h3 className="font-headline font-bold text-3xl mb-4 uppercase tracking-tighter">
                AUTOMATED
              </h3>
              <p className="font-body text-on-primary-container mb-8">
                AI generates user stories, acceptance criteria, and story point
                estimates. Review, edit, confirm.
              </p>
              <div className="mt-auto border-t-2 border-black pt-4">
                <Link
                  href="/create-ticket"
                  className="font-label font-black text-sm uppercase flex items-center gap-2 hover:bg-black hover:text-white inline-block"
                >
                  CREATE_TICKET →
                </Link>
              </div>
            </div>

            <div className="bg-surface-container-lowest border-4 border-black neo-brutalist-shadow flex flex-col p-8 transform hover:-translate-x-1 hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-12">
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
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-1.5-3-1.5"
                  />
                </svg>
                <span className="font-label text-xs font-black px-2 py-1 bg-black text-white">
                  DELIVER
                </span>
              </div>
              <h3 className="font-headline font-bold text-3xl mb-4 uppercase tracking-tighter">
                CONNECTED
              </h3>
              <p className="font-body text-on-surface-variant mb-8">
                Tickets land directly in Monday.com backlog. Ready for
                refinement. Zero manual data entry.
              </p>
              <div className="mt-auto border-t-2 border-black pt-4">
                <Link
                  href="/mission-control"
                  className="font-label font-black text-sm uppercase flex items-center gap-2 hover:text-primary"
                >
                  MISSION_CONTROL →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 border-y-4 border-black bg-surface-container">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-headline font-black text-5xl mb-16 uppercase tracking-tighter">
            HOW_IT_WORKS
          </h2>
          <div className="space-y-0">
            <div className="flex items-start gap-8 py-12 border-b-2 border-black group">
              <span className="font-headline font-black text-7xl md:text-9xl text-black/10 group-hover:text-primary transition-colors">
                01
              </span>
              <div>
                <h4 className="font-headline font-bold text-2xl mb-2 uppercase tracking-tighter">
                  DESCRIBE_YOUR_REQUEST
                </h4>
                <p className="font-body text-on-surface-variant">
                  Tell the AI agent what you need in your own words. No
                  technical knowledge required. It asks the right questions to
                  understand your request.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-8 py-12 border-b-2 border-black group">
              <span className="font-headline font-black text-7xl md:text-9xl text-black/10 group-hover:text-primary transition-colors">
                02
              </span>
              <div>
                <h4 className="font-headline font-bold text-2xl mb-2 uppercase tracking-tighter">
                  REVIEW_AND_CONFIRM
                </h4>
                <p className="font-body text-on-surface-variant">
                  The agent structures your request into clear, actionable
                  tickets. Review the summary, make adjustments, and confirm
                  when you&apos;re happy.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-8 py-12 group">
              <span className="font-headline font-black text-7xl md:text-9xl text-black/10 group-hover:text-primary transition-colors">
                03
              </span>
              <div>
                <h4 className="font-headline font-bold text-2xl mb-2 uppercase tracking-tighter">
                  DELIVERED_TO_BACKLOG
                </h4>
                <p className="font-body text-on-surface-variant">
                  Tickets land directly in the team&apos;s Monday.com backlog,
                  fully structured with acceptance criteria and estimates. Ready
                  for the next refinement session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline font-black text-4xl md:text-7xl uppercase mb-8 leading-none tracking-tighter">
            READY TO SUBMIT A REQUEST?
          </h2>
          <Link
            href="/submit-request"
            className="inline-block bg-primary-container text-on-primary-container px-12 py-6 border-4 border-[#cffc00] font-headline font-black uppercase tracking-[0.2em] text-xl hover:bg-white hover:text-black transition-colors transform hover:-translate-x-2 hover:-translate-y-2 neo-brutalist-shadow"
          >
            GET_STARTED
          </Link>
        </div>
      </section>
    </>
  );
}
