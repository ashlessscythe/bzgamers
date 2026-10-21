# npm audit notes

Last security sweep: 2026-10-21 (branch `cursor/security-npm-audit-1246`).

## Policy

- Keep **Next.js 16** line; bump `next` and `eslint-config-next` together.
  Do **not** follow npm’s suggestion to downgrade `eslint-config-next` to 14.x.
- Stay on **Tailwind CSS 3**. Do **not** migrate to Tailwind 4 solely to clear
  audit noise from the Tailwind 3 dependency chain.
- Prefer direct bumps and `package.json` `overrides` for patched transitive
  versions. Use `npm audit fix` without `--force`.

## Deferred / known open

### `braces` (high) — no patched release

- Latest published `braces` is still **3.0.3**, which npm audit flags
  (stack-exhaustion DoS via deeply nested patterns).
- Pulls in the Tailwind 3 toolchain: `chokidar` → `micromatch` → `braces`,
  plus related `fast-glob` / `tailwindcss` advisories.
- The same `fast-glob` → `micromatch` → `braces` path also flags
  `@next/eslint-plugin-next` / `eslint-config-next`. npm suggests
  downgrading `eslint-config-next` to 14.x — **do not**; stay aligned with
  Next 16. Clearing this chain otherwise requires Tailwind **4** (deferred).
- Mitigations: build-time / CLI / lint usage only (not runtime request path);
  untrusted glob input is not accepted from end users.
- Revisit when `braces` ships a patched release, or when intentionally
  migrating to Tailwind 4.

## Overrides used with Tailwind 3

Compatible override used in this and sibling repos:

- `postcss-selector-parser@7.1.7` — clears the moderate PostCSS selector
  parsing advisory without leaving Tailwind 3.
