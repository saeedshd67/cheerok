# Cheerok — Next.js Scaffold

This is a working **scaffold**, not a finished application. It implements the
routing, data-layer contract, and a handful of representative pages/components
in the visual language already built out in the static HTML prototypes
(`cheerok-homepage.html` etc.). It is meant as the concrete starting point a
dev team would branch from — not a drop-in finished product.

## What's real here

- **Locale routing** (`src/i18n/`, `src/middleware.ts`): Persian unprefixed,
  English under `/en`, with *translated path segments*
  (`/dastan` ↔ `/en/fiction`) via `next-intl`'s `pathnames` config — not just
  a `[locale]` wrapper around identical English-only paths.
- **Data layer** (`src/lib/api.ts`, `src/types/content.ts`): a typed client
  against the Strapi REST shape described in `cheerok-architecture.md`,
  normalizing Strapi's nested `{ data: { attributes } }` responses into flat
  domain objects so components don't need to know Strapi specifically.
- **SSG + on-demand ISR**: `generateStaticParams` pre-renders every story at
  build time; `src/app/api/revalidate/route.ts` is the webhook target Strapi
  hits on publish so a single new story doesn't require a full rebuild.
- **Homepage and story detail page** are fully wired against that data layer,
  not hardcoded — `src/app/[locale]/page.tsx` and
  `src/app/[locale]/dastan/[slug]/page.tsx`.
- **Header / Footer / StoryCard / LanguageSwitcher / NewsletterForm**:
  reusable components matching the prototypes pixel-for-pixel in spacing and
  type scale, built with Tailwind v4's CSS-first `@theme` tokens
  (`src/app/globals.css`) rather than ad hoc utility classes.

## What's intentionally stubbed

- **Every other route from the sitemap** (`/jostar`, `/podcast`, `/goftogoo`,
  `/arshiv`, `/authors/[slug]`, `/darbare`, `/ersal`, `/admin/*`) is *not*
  built out as a page file yet. They follow the exact same pattern as
  `/dastan` and `/dastan/[slug]` — same `lib/api.ts` conventions, same
  component composition — so the fastest path to finishing the site is
  copying that pair of files per section, not inventing a new pattern.
- **Story body rendering** (`StoryBodyPlaceholder` in the story detail page)
  is a paragraph-split placeholder, explicitly flagged in a comment. Real
  rich text out of Strapi needs a proper renderer (`react-markdown`, or
  Strapi's own blocks renderer, depending on which field type the CMS side
  ends up using) plus HTML sanitization — that's a real decision for
  whoever wires up the CMS, not something to fake here.
- **Auth for `/admin/*`**: the editorial dashboard prototype
  (`cheerok-dashboard.html`) exists as static HTML only. Wiring it to Strapi's
  JWT auth and the `/api/submissions/:id/status` endpoint from the
  architecture doc is unbuilt.
- **Search** (`/search`, `/arshiv` filters): `lib/api.ts` has a
  `searchArchive()` stub using Strapi's query filters directly. The
  architecture doc recommends a dedicated search layer (Meilisearch/Typesense)
  for real Persian-aware relevance ranking — that integration isn't here.
- **next/image**: `FeaturedStory.tsx` uses a plain `<img>` with a comment
  explaining why, to keep the scaffold runnable without a configured image
  loader. Swap to `next/image` once `NEXT_PUBLIC_CMS_MEDIA_HOST` points at a
  real CMS.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in CMS_URL etc. once Strapi is running
npm run dev
```

Without a real Strapi instance behind `CMS_URL`, the homepage and story page
will throw on fetch — there's no mock data layer. Pointing `CMS_URL` at a
Strapi instance with the collection types from `cheerok-architecture.md` §3
populated is the fastest way to see it render.

## Deploying

Standard Vercel deployment (`vercel deploy`), with the four environment
variables in `.env.example` set in the Vercel project settings. Strapi itself
is deployed separately (Strapi Cloud, Railway, or a small VPS with managed
Postgres) — this repo is the Next.js frontend only.
