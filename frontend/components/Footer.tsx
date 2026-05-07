import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black w-full border-t-4 border-black">
      <div className="flex flex-col md:flex-row justify-between items-start p-12 gap-8">
        <div className="flex flex-col gap-4">
          <p className="font-headline text-xs font-bold uppercase tracking-widest text-[#cffc00]">
            DATA_WORKSHOP // IMMEDIATE MEDIA
          </p>
          <div className="flex flex-wrap gap-6 font-headline text-xs font-bold uppercase tracking-widest text-white">
            <Link href="/submit-request" className="hover:italic">
              SUBMIT_REQUEST
            </Link>
            <Link href="/create-ticket" className="hover:italic">
              CREATE_TICKET
            </Link>
            <Link href="/mission-control" className="hover:italic">
              MISSION_CONTROL
            </Link>
            <Link href="/insights" className="hover:italic">
              INSIGHTS_TOOLS
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-8 font-headline text-xs font-bold uppercase tracking-widest text-white">
          <div className="flex flex-col gap-2">
            <span className="text-white/40">TEAM</span>
            <span>COMMERCIAL_ANALYSTS</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white/40">STATUS</span>
            <span className="text-[#cffc00] underline">OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
