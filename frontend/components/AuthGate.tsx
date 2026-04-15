"use client";

import { useSession, signIn } from "next-auth/react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
            <p className="font-headline font-bold text-xl uppercase tracking-tighter">
              AUTHENTICATING...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="border-4 border-black bg-surface-container-lowest neo-brutalist-shadow p-12 text-center">
            <h2 className="font-headline font-black text-4xl uppercase tracking-tighter mb-4">
              ACCESS_REQUIRED
            </h2>
            <p className="font-body text-on-surface-variant mb-8">
              Sign in with your Immediate Media Google account to continue.
            </p>
            <button
              onClick={() => signIn("google")}
              className="bg-primary-container text-on-primary-container px-10 py-4 border-4 border-black font-headline font-black uppercase tracking-widest text-lg hover:bg-[#cffc00] transition-colors transform hover:-translate-x-1 hover:-translate-y-1 neo-brutalist-shadow"
            >
              LOGIN_WITH_GOOGLE
            </button>
            <p className="font-label text-xs font-bold uppercase tracking-widest text-outline mt-6">
              [ RESTRICTED TO @IMMEDIATE.CO.UK ]
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
