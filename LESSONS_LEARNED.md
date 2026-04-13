# Lessons Learned

A living document of noteworthy discoveries, tricky bugs, and solutions found while building DATA_WORKSHOP. Updated automatically as we work together.

---

### 2026-04-13 — Tailwind v4 uses @theme, not tailwind.config.ts

**What happened:** Next.js 16 + Tailwind v4 no longer uses a `tailwind.config.ts` file. Design tokens go in `globals.css` inside a `@theme inline { }` block using CSS custom property syntax (`--color-primary: #cffc00`). The old `theme.extend.colors` JavaScript config is dead.

**Why it matters:** If you try to create a `tailwind.config.ts` with Tailwind v4, it will be silently ignored. All the Stitch design tokens had to be translated from the JavaScript config format (`"primary-container": "#cffc00"`) to CSS custom property format (`--color-primary-container: #cffc00`).

**How we fixed it:** Extracted all tokens from the Stitch HTML's inline `<script>` tag and mapped them into the `@theme` block in `globals.css`. Tailwind v4 auto-generates utility classes from these (e.g. `--color-primary-container` → `bg-primary-container`, `text-primary-container`).

---

### 2026-04-13 — Port conflicts with dev server

**What happened:** `npm run dev` defaulted to port 3001 because port 3000 was already in use by another process.

**Why it matters:** If you're expecting the app at localhost:3000 and it's silently on 3001, OAuth redirect URIs and API calls will fail. Always check the terminal output for the actual port.

**How to fix:** Either kill the process on 3000 (`lsof -ti:3000 | xargs kill`) or update your `.env.local` and Google OAuth redirect URIs to match the actual port.

---

### 2026-04-13 — NextAuth v5 beta: separate auth config from provider imports for testability

**What happened:** Jest couldn't parse `next-auth/providers/google` because it uses ESM `export *` syntax which Jest (with ts-jest) doesn't handle out of the box.

**Why it matters:** If your auth config and provider imports live in the same file, you can't unit test the callbacks (signIn, session) without Jest choking on the provider ESM imports.

**How we fixed it:** Split into two files:
- `lib/auth.ts` — pure config with callbacks and `isAllowedDomain()` (testable, no ESM deps)
- `lib/auth-provider.ts` — imports NextAuth + Google provider, spreads in the config, exports `handlers/signIn/signOut/auth`

This is a good pattern for any NextAuth project: keep the testable logic separate from the framework wiring.

---

### 2026-04-13 — NextAuth v5: OAuth signin requires POST with CSRF cookie

**What happened:** Testing the OAuth redirect by hitting `GET /api/auth/signin/google` returned a 400 or a configuration error. NextAuth v5 requires a POST request with a CSRF token from a cookie, not a simple GET redirect.

**Why it matters:** Integration tests for OAuth need to first GET `/api/auth/csrf` to get the token and cookie, then POST to `/api/auth/signin/google` with both. Without this two-step flow, the redirect to Google's consent screen never happens.

**How we fixed it:** Updated the test to fetch the CSRF token first, capture the `Set-Cookie` header, then POST with both the token in the body and the cookie in the headers. The response is a 302 redirect to `accounts.google.com`.

---

### 2026-04-13 — Separate integration tests from unit tests

**What happened:** Running `npx jest __tests__/` failed because the OAuth redirect tests tried to hit `localhost:3001` which wasn't running.

**Why it matters:** Unit tests should always pass regardless of external state. Integration tests that need a live server should be opt-in so they don't break CI or local test runs.

**How we fixed it:** Wrapped integration tests in a `describe.skip` that only runs when `TEST_INTEGRATION=true` is set. Run integration tests explicitly with `TEST_INTEGRATION=true npx jest __tests__/auth/oauth-redirect.test.ts`.

---

### 2026-04-13 — Field extraction for conversations: start simple, let Claude do the heavy lifting

**What happened:** Building the conversation engine, we initially considered using regex or NLP to extract structured fields from user messages. This would have been fragile and complex.

**Why it matters:** The conversation engine's `extractFields()` function does simple extraction locally (first user message = what they need), but the real intelligence comes from Claude itself via the system prompt. The system prompt tells Claude which fields are still missing, and Claude asks the right follow-up questions. This keeps our code simple and testable while leveraging the LLM for the hard part (understanding natural language).
