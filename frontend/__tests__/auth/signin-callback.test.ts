import { authConfig } from "@/lib/auth";

describe("Sign-in callback", () => {
  const signIn = authConfig.callbacks!.signIn!;

  test("allows immediate.co.uk users to sign in", async () => {
    const result = await signIn({
      user: { email: "matt@immediate.co.uk", name: "Matt" },
      account: null,
      profile: undefined,
    } as any);

    expect(result).toBe(true);
  });

  test("blocks non-immediate.co.uk users", async () => {
    const result = await signIn({
      user: { email: "hacker@gmail.com", name: "Hacker" },
      account: null,
      profile: undefined,
    } as any);

    expect(result).toBe(false);
  });

  test("blocks users with no email", async () => {
    const result = await signIn({
      user: { name: "No Email" },
      account: null,
      profile: undefined,
    } as any);

    expect(result).toBe(false);
  });
});
