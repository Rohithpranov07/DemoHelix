# ShopLite

A small, deliberately flawed full-stack e-commerce Next.js application designed to demonstrate an autonomous code-healing system (HELIX). This app contains exactly 8 planted issues across 4 categories (Security Vulnerabilities, Intent Drift, Deployment Errors, Code Entropy).

**⚠️ WARNING: Do not use this code in production. It contains intentional critical security flaws.**

## Stack
- Next.js 15 (App Router) + TypeScript
- SQLite (Local zero-setup database)
- Tailwind CSS

## Setup & Running

This demo has been configured to run entirely locally without needing Supabase or Postgres! 

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Seed Local Database**
   This script creates the `sqlite.db` file and populates it.
   ```bash
   npx tsx scripts/seed.ts
   ```

3. **Run the App**
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:3001`.

## Feature Flags (Testing Deployment Errors)
You can toggle the following environment variables in `.env.local` to trigger deployment errors:
- `BUGGY_MODE=true` -> Triggers silent logic failure in checkout API (0% tax rate).
- `CRASH_MODE=true` -> Triggers unhandled server crash in orders API if order has zero items.

## Planted Issues

### Category A: Security Vulnerabilities
1. **SQL Injection (`VULN-1`)**: `/api/products/search/route.ts` directly concatenates the user search string into a SQLite query.
   - *Fix*: Use parameterized queries like `db.prepare('SELECT * FROM products WHERE name LIKE ?').all('%'+q+'%')`.
2. **Reflected XSS (`VULN-2`)**: `/app/page.tsx` renders the unescaped search parameter back to the user via `dangerouslySetInnerHTML`.
   - *Fix*: Remove `dangerouslySetInnerHTML` and render it safely as React text: `<p>Showing search results for: {q}</p>`.
3. **Missing RLS (`VULN-3`)**: The API fetches data blindly using a client-provided `userId`.
   - *Fix*: Update the API to use the authenticated session `userId` securely stored in a token instead of a URL param.
4. **Secret Leak (`VULN-4`)**: The `/admin/page.tsx` client component has a hardcoded string `LEAKED_ADMIN_API_KEY` exposing an admin-level secret API token.
   - *Fix*: Move the admin logic to a server component or server action and remove the hardcoded key from client files.

### Category B: Intent Drift
5. **Intent Drift (`VULN-5`)**: The refund function has a clear intent contract ("Orders over ₹5000 require manager approval"), but a duplicated `quickRefund` function in `lib/utils/refund.ts` bypasses this rule. The admin panel calls `quickRefund`.
   - *Fix*: Delete `quickRefund` and update the admin panel to call `processRefund` passing manager approval state appropriately.

### Category C: Deployment / Production Errors
6. **Silent Behavioral Failure (`VULN-6`)**: When `BUGGY_MODE=true`, `/api/checkout/route.ts` silently applies a 0% tax rate instead of 18%, returning a 200 OK with the wrong total.
   - *Fix*: Remove the buggy logic branch and ensure tests validate the expected tax calculation.
7. **Crash on Deploy (`VULN-7`)**: When `CRASH_MODE=true`, `/api/orders/route.ts` throws an unhandled server exception for any order with zero items.
   - *Fix*: Handle the edge case gracefully (e.g., skip the order or return an empty array) instead of throwing an unhandled Error.

### Category D: Code Entropy
8. **Duplicated Logic (`VULN-8`)**: The formula to calculate order totals is repeated in three places (`lib/utils/checkout.ts`, `/app/api/checkout/route.ts`, and `/app/admin/page.tsx`).
   - *Fix*: Import and use a single shared utility function `calculateOrderTotal` from `lib/utils/checkout.ts` in all locations.
