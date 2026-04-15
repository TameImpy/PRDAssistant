"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";


const navItems = [
  { href: "/submit-request", label: "SUBMIT_REQUEST" },
  { href: "/create-ticket", label: "CREATE_TICKET" },
  { href: "/mission-control", label: "MISSION_CONTROL" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();


  return (
    <header className="bg-[#f6f6f6] fixed top-0 w-full z-50 border-b-4 border-black shadow-[4px_4px_0px_0px_#000000]">
      <nav className="flex justify-between items-center px-6 h-20 max-w-full">
        <Link href="/" className="flex items-center gap-2">
          <svg
            className="w-6 h-6 text-[#cffc00]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <span className="text-2xl font-black tracking-tighter text-black font-headline uppercase">
            DATA_WORKSHOP
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-headline uppercase tracking-tighter font-bold text-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "underline decoration-4 underline-offset-4 text-black transform hover:-translate-x-1 hover:-translate-y-1 transition-all"
                    : "text-black/60 hover:bg-[#cffc00] hover:text-black transition-transform active:translate-x-1 active:translate-y-1 p-1"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="hidden md:inline font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-black text-white px-4 py-2 border-2 border-black font-headline font-bold uppercase tracking-widest text-xs hover:bg-surface-container-highest hover:text-black transition-colors"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-primary-container text-on-primary-container px-6 py-2 border-2 border-black font-headline font-bold uppercase tracking-widest text-xs hover:bg-[#cffc00] hover:text-black transition-transform active:translate-x-1 active:translate-y-1 transform hover:-translate-x-1 hover:-translate-y-1"
            >
              LOGIN
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
