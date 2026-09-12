# Frontend Audit — `e-comerce-frontend`

**Audited commit:** `7f68caf` · **Size:** 109 source files, **66 of them (61%) are `"use client"`**
**Stack:** Next.js 16.3.4 (App Router) · React 19.2 · Tailwind 4 · axios · zod 4

---

## 1. CRITICAL
## 2. HIGH

### H7. Auth errors use `alert()`; there is no toast system

[`login/page.tsx:52`](src/app/auth/login/page.tsx#L52) and `register/page.tsx:43` both do `alert(message)`, plus 13 more `alert()`/`window.confirm()` across admin and `address/page.tsx`.

Native dialogs are unstyled, block the main thread, can't be themed, and on mobile look like a browser malfunction. There is **no notification system in the codebase at all** — successful actions (address saved, coupon applied, item removed) give no confirmation anywhere.

**Fix:** inline field-level errors (the pattern already used correctly in `verify-otp/page.tsx:366-376`) plus a small toast provider.

### H8. Registration token travels in the URL, unencoded

[`register/page.tsx:34`](src/app/auth/register/page.tsx#L34):

```ts
router.push(`/auth/verify-otp?token=${registrationToken}`);
```

Two problems: the token lands in browser history, the `Referer` header on any outbound link, and any intermediary access log — a pre-verification account-takeover primitive. And with **no `encodeURIComponent`**, a token containing `&`, `#`, or `+` silently truncates, failing verification with a confusing "Registration session is missing or invalid".

**Fix:** at minimum `encodeURIComponent`; properly, have the backend set a short-lived httpOnly registration cookie and keep the token out of the URL.

---

## 3. MEDIUM

### M1. 61% client components — SSR and streaming are effectively off

66 of 109 files are `"use client"`, including **every page** except five. Every data-bearing page is a client `useEffect` waterfall:

- `customer/products/[slug]/page.tsx` → mount, render skeleton, fetch product, then `RelatedProducts` mounts and fetches **again** — a genuine two-hop waterfall.
- `admin/products/page.tsx` → fetch products; then `ProductForm` fetches categories/colors/sizes; then fetches the product.

Users see spinner-then-content on every navigation instead of streamed HTML.

**Credit:** `Promise.all` **is** used correctly where it matters (`checkout/page.tsx:143-147`, `ProductForm.tsx:155-159`, `Navbar.tsx:28-32`). No sequential-await bugs found.

**Fix (incremental):** start with product detail and listing — make the page a server component that fetches, push `"use client"` down to `ProductGallery`/`ProductOptions`.

### M2. No `loading.tsx`, `error.tsx`, or `not-found.tsx` in the entire app

`find src -name "loading.tsx" -o -name "error.tsx" -o -name "not-found.tsx"` → **empty**.

No Suspense boundaries, no route-level streaming, and — most importantly — **no error boundary**: a render-time throw anywhere unmounts to a blank white screen with no recovery UI. Per-page skeletons exist and are decent, but they can't cover render errors.

### M3. Navbar cart/wishlist badges go stale after every mutation

[`Navbar.tsx:17-57`](src/app/(customer)/customer/components/layout/Navbar.tsx#L17-L57) fetches counts in a `useEffect` keyed **only on `[user]`**. Nothing re-triggers it. After adding to cart, changing quantity, or toggling the wishlist, the header badge shows the old number until a **full page reload** — `router.push("/cart")` is a client nav and won't refresh it.

Broader pattern: there is no cache/revalidation layer (no React Query/SWR, no `router.refresh()`), so every mutation hand-patches local state and cross-component data drifts.

### M4. "Try again" on the orders list does nothing

[`OrderList.tsx:211`](src/app/(customer)/accounts/orders/components/OrderList.tsx#L211):

```tsx
<button onClick={() => setPage(page)}>Try again</button>
```

Setting state to its current value — React bails out, no re-render, the `useEffect` never re-runs. **The button is inert.** A user hitting a transient network error must reload the page.

### M5. Razorpay script failure is cached permanently

[`loadRazorpayScript.tsx:16-29`](src/app/lib/payments/loadRazorpayScript.tsx#L16-L29). The single-flight cache is right, but on failure the **rejected promise stays in `razorpayScriptPromise` forever**. One flaky network blip and **every subsequent online-payment attempt fails instantly for the rest of the session**, with no hint that reloading helps.

**Fix:** `razorpayScriptPromise = null` in `onerror` before rejecting.

### M6. `getApiErrorMessage` bypassed in the admin product form

[`ProductForm.tsx:324-328`](src/app/admin/components/ProductForm.tsx#L324-L328) discards the real server message (duplicate slug, invalid category, image too large) and substitutes a generic string telling the admin to check fields that show **no errors**. This is the largest form in the app; `getApiErrorMessage` is used correctly in 34 other places.

### M7. Object URLs are never revoked

`ProductForm.tsx:551` calls `URL.createObjectURL(file)`; `grep` confirms **zero `revokeObjectURL`** calls anywhere. Every image an admin selects leaks its blob for the document's lifetime, and removing an image doesn't revoke either. Bulk-uploading product photos accumulates tens of MB.

### M8. Accessibility — 30 of 47 labels not tied to their inputs

Only 17 of 47 `<label>` elements have `htmlFor`, and the unassociated ones don't wrap their input either — so screen readers announce an unlabelled edit field and clicking the label doesn't focus it. Affected: the entire register form, login, verify-otp, checkout contact, and every admin form.

Other gaps: `OrderList.tsx:127` search input has no label or `aria-label`; colour swatch buttons in `ProductOptions.tsx:127-151` are empty `<button>`s whose only accessible name is a `title`; the admin sidebar drawer has no focus trap, no `Escape` handler, no `aria-modal`; `HeroCarousel` auto-advances every 4s with no pause control and no `prefers-reduced-motion` check.

**Credit:** `aria-label` is used well on icon-only buttons (49 `aria-` attributes total), `ProductCard.tsx:264-269` does `aria-label` + `aria-pressed` correctly, and every `next/image` has a real `alt` with a sensible fallback.

### M9. Unoptimized hero images

`public/photos/` holds 38 WhatsApp exports totalling ~13MB (largest 632KB). `HeroCarousel.tsx:6-10` loads **three** and renders all three simultaneously (opacity-toggled) — so all three download immediately, not just the visible one. Filenames contain spaces, which is fragile in URLs.

---

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
