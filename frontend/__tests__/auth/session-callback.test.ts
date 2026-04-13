import { authConfig } from "@/lib/auth";

describe("Session callback", () => {
  const sessionCallback = authConfig.callbacks.session;

  test("populates session with user email and name from token", () => {
    const session = {
      user: { email: "", name: "", image: "" },
      expires: "",
    };
    const token = {
      email: "matt@immediatemedia.com",
      name: "Matt Rance",
      picture: "https://example.com/avatar.jpg",
    };

    const result = sessionCallback({ session, token } as any);

    expect(result.user.email).toBe("matt@immediatemedia.com");
    expect(result.user.name).toBe("Matt Rance");
    expect(result.user.image).toBe("https://example.com/avatar.jpg");
  });

  test("returns session unchanged if no token data", () => {
    const session = {
      user: { email: "original@test.com", name: "Original" },
      expires: "",
    };
    const token = {};

    const result = sessionCallback({ session, token } as any);

    expect(result.user.email).toBeUndefined();
    expect(result.user.name).toBeUndefined();
  });
});
