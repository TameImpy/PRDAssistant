const ALLOWED_DOMAIN = "immediatemedia.com";

export function isAllowedDomain(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  return domain === ALLOWED_DOMAIN;
}

export const authConfig = {
  callbacks: {
    signIn({ user }: { user: { email?: string | null } }) {
      if (!user.email) return false;
      // Domain restriction - set ALLOWED_EMAIL_DOMAIN=none in .env.local to disable for testing
      const envDomain = process.env.ALLOWED_EMAIL_DOMAIN;
      if (envDomain === "none" || envDomain === "") return true;
      return isAllowedDomain(user.email);
    },
    session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  // Using NextAuth's built-in pages for now
  // Custom branded pages can be added later
};
