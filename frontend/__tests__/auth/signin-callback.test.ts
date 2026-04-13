import { authConfig } from "@/lib/auth";

describe("Sign-in callback", () => {
  const signIn = authConfig.callbacks!.signIn!;

  test("allows immediatemedia.com users to sign in", async () => {
    const result = await signIn({
      user: { email: "matt@immediatemedia.com", name: "Matt" },
      account: null,
      profile: undefined,
    } as any);

    expect(result).toBe(true);
  });

  test("blocks non-immediatemedia.com users", async () => {
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
