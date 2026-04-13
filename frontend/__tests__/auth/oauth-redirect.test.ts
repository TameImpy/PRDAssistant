// Integration tests — require dev server running on port 3001
// Run with: npm run dev -- -p 3001 && npx jest __tests__/auth/oauth-redirect.test.ts
const skipIfNoServer =
  process.env.TEST_INTEGRATION === "true" ? describe : describe.skip;

skipIfNoServer("OAuth redirect flow", () => {
  const BASE_URL = "http://localhost:3001";

  test("GET /api/auth/providers returns google as a provider", async () => {
    const response = await fetch(`${BASE_URL}/api/auth/providers`);
    expect(response.status).toBe(200);

    const providers = await response.json();
    expect(providers).toHaveProperty("google");
    expect(providers.google.name).toBe("Google");
    expect(providers.google.type).toBe("oidc");
    expect(providers.google.signinUrl).toContain("/api/auth/signin/google");
    expect(providers.google.callbackUrl).toContain("/api/auth/callback/google");
  });

  test("POST /api/auth/signin/google with valid CSRF redirects to Google", async () => {
    // Step 1: Get CSRF token and session cookie
    const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
    const cookies = csrfResponse.headers.getSetCookie();
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    // Step 2: POST to signin with CSRF token and cookie
    const signinResponse = await fetch(
      `${BASE_URL}/api/auth/signin/google`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: cookies.join("; "),
        },
        body: `csrfToken=${csrfToken}`,
        redirect: "manual",
      }
    );

    // Should redirect (302) to Google's OAuth consent screen
    expect(signinResponse.status).toBe(302);

    const location = signinResponse.headers.get("location");
    expect(location).toBeTruthy();
    expect(location).toContain("accounts.google.com");
  });
});
