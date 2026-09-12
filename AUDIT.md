# Frontend Audit — `e-comerce-frontend`

**Audited commit:** `7f68caf` · **Size:** 109 source files, **66 of them (61%) are `"use client"`**
**Stack:** Next.js 16.3.4 (App Router) · React 19.2 · Tailwind 4 · axios · zod 4

---

## 1. CRITICAL
## 2. HIGH
## 3. MEDIUM

## 4. LOW

- **33 `console.*` statements ship to production**, several logging PII — `useCurrentUser.ts:24` logs the full user object on every page load, `login/page.tsx:35` logs the user on success, `cart.service.ts` logs full cart payloads. Fix with `compiler.removeConsole` in `next.config.ts`.
- **Dead wishlist button on product detail** — `ProductOptions.tsx:230-236` renders a heart with `aria-label="Add to wishlist"` and **no `onClick`**. The working version is in `ProductCard.tsx:260-281`.
- **Wishlist cards aren't clickable** — `WishlistItemCard.tsx` shows name, price, stock, and Remove, but no `Link` to the product. Users can't get from wishlist to product.
- **`admin/dashboard/page.tsx:9-72` is entirely hardcoded mock data** — fake revenue, orders, customers. `AdminNavbar.tsx` hardcodes "SA" / "Super Admin" regardless of who's logged in. Shipping fake financial figures to a real admin is a trust hazard.
- **`@hookform/resolvers` is installed but `react-hook-form` is not** — zero imports of either in `src/`. Dead dependency; remove it.
- **`crypto.randomUUID()` in a `useState` initializer** runs during SSR too, generating a throwaway server value. Harmless today, will break if it ever reaches the DOM.
- **Dead branch in the refresh interceptor** — `apiPrivate.ts:49-53` guards against the refresh endpoint 401ing, but the refresh call uses plain `axios` with no interceptor attached, so it's unreachable.
- **No SSR guard on `window`** — `apiPrivate.ts:50,109` assign `window.location.href` unconditionally. Safe today (all callers in `useEffect`), but any future server-side use throws.
- **Client-supplied subtotal in coupon preview** — `OrderSummaryCard.tsx:66-69` posts a client-computed `subtotal` to `/coupons/validate`. Cosmetic only; the order-time call correctly sends just `couponCode`. Worth asserting server-side that the preview ignores the client figure too.
- **Only 5 `useMemo`/`useCallback` in 109 files** — `ProductCard.tsx:104-152` recomputes price/stock/swatch reductions on every render for every card in the grid. Low impact now; watch as the catalogue grows. All 69 `.map()` sites have proper `key` props.
- **Zero tests, zero CI.**

---

## 5. Verified correct — do not "fix" these

- **Tokens are NOT in localStorage.** `grep -rn "localStorage|sessionStorage|document.cookie" src/` → **zero hits**. Auth is httpOnly-cookie based with `withCredentials: true` in both axios clients. This eliminates the single biggest XSS token-theft vector, and it's the most important thing this frontend gets right.
- **No XSS sinks** — `dangerouslySetInnerHTML`, `eval`, `innerHTML`, `new Function` → zero hits.
- **No open redirect** — the only `useSearchParams` read is the verify-otp `token`, never used as a navigation target. All `router.push`/`replace` targets are hardcoded literals.
- **`tsconfig.json` has `strict: true`**, and `next.config.ts` has **no** `ignoreBuildErrors` / `ignoreDuringBuilds` — build errors aren't being suppressed.
- **`.env` is gitignored and clean** — contains only `NEXT_PUBLIC_API_URL`. Verified never committed in any branch or history.
- **`next/font` used correctly** — no render-blocking font link.
- **`next.config.ts` image `remotePatterns` are properly scoped** to Cloudinary and Unsplash.
- **`Promise.all` used correctly** in all three places parallel fetching matters.
- **Every `.map()` has proper `key` props.**

### Already fixed by your recent commits

Worth recording so they aren't re-reported: `OrderDetails` previously passed the item id as the order id to `cancelOrderItem` (now correctly threads `orderId`); `getApiErrorMessage` was being called with the message in the `error` slot in 5 places (now zero); `Contactstep` gated only on email length, letting users past before zod rejected the phone (now validates both formats up front).

---

## 6. Suggested order of work

1. **C1** — the shop is unbrowsable for logged-out visitors. Nothing else matters until this is fixed.
2. **C3, C2** — add logout; add `middleware.ts` + `role` on `CurrentUser`.
3. **H1, H3** — checkout correctness: the wrong displayed total and the stale idempotency key.
4. **H5, M4, plus the dead wishlist button** — dead links and inert buttons. Cheap, high perceived-quality payoff.
5. **H4, M1** — convert product detail + listing to server components with `generateMetadata`. Biggest SEO and LCP win.
6. **M2, H7** — error/loading boundaries and a real toast system to replace `alert()`.
7. **H6, M9** — image optimization and CLS on the checkout path.

---

## 7. Confidence notes

- **Executed and verified:** `npm audit` (the dependency advisories), the `localStorage`/XSS/`middleware.ts` greps, the client-component count, and the `.env` git-history check.
- **Verified by reading the exact source:** C1 (I traced the full layout → Navbar → hook → interceptor chain myself), C2, C3, H1, H4, H5.
- **Read from source, not executed in a browser:** the remaining HIGH/MEDIUM/LOW items. No runtime reproduction or Lighthouse run was performed.
- **Not assessed:** actual Core Web Vitals under real network conditions, bundle sizes, cross-browser behaviour, and screen-reader testing with an actual assistive tech stack.
