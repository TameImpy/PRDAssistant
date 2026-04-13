export default function MissionControlPage() {
  return (
    <section className="px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-tertiary-container text-on-tertiary-container font-headline font-black text-xs uppercase tracking-widest px-4 py-2 border-l-4 border-b-4 border-black">
            COMING_SOON
          </div>
          <span className="font-label text-xs font-black px-2 py-1 bg-black text-white mb-6 inline-block">
            V2_FEATURE
          </span>
          <h1 className="font-headline font-black text-5xl uppercase tracking-tighter mb-4">
            MISSION_CONTROL
          </h1>
          <p className="font-body text-on-surface-variant text-lg mb-8">
            A live dashboard showing what the team has shipped, what&apos;s in
            progress, and what&apos;s coming up — powered by AI summaries from
            Monday.com. No Monday.com account needed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 opacity-40">
            <div className="border-2 border-black p-6 bg-surface-container">
              <p className="font-headline font-bold text-sm uppercase tracking-tighter mb-2">
                RECENTLY_SHIPPED
              </p>
              <div className="h-20 bg-surface-container-high border border-dashed border-outline" />
            </div>
            <div className="border-2 border-black p-6 bg-surface-container">
              <p className="font-headline font-bold text-sm uppercase tracking-tighter mb-2">
                IN_PROGRESS
              </p>
              <div className="h-20 bg-surface-container-high border border-dashed border-outline" />
            </div>
            <div className="border-2 border-black p-6 bg-surface-container">
              <p className="font-headline font-bold text-sm uppercase tracking-tighter mb-2">
                UPCOMING
              </p>
              <div className="h-20 bg-surface-container-high border border-dashed border-outline" />
            </div>
          </div>

          <div className="border-t-2 border-black pt-6">
            <p className="font-label text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              [ FEATURE_INCOMING // SPRINT_VISIBILITY_FOR_MANAGEMENT ]
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
