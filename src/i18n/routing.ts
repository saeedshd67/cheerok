import { defineRouting } from "next-intl/routing";

/**
 * Locale + pathname strategy
 * ---------------------------------------------------------------
 * Persian is the default and unprefixed ("/dastan/some-slug"),
 * English lives under "/en" ("/en/fiction/some-slug").
 *
 * Section names are translated per locale (dastan <-> fiction),
 * but dynamic slugs ([slug]) are NOT translated — a story keeps
 * the same slug in both locales. See cheerok-architecture.md §1
 * for the reasoning (stable canonical/alternate links, no slug
 * rot when an English title is edited later).
 */
export const routing = defineRouting({
  locales: ["fa", "en"],
  defaultLocale: "fa",
  localePrefix: {
    mode: "as-needed", // fa: no prefix, en: "/en" prefix
  },
  pathnames: {
    "/": "/",
    "/dastan": { fa: "/dastan", en: "/fiction" },
    "/dastan/[slug]": { fa: "/dastan/[slug]", en: "/fiction/[slug]" },
    "/jostar": { fa: "/jostar", en: "/essays" },
    "/jostar/[slug]": { fa: "/jostar/[slug]", en: "/essays/[slug]" },
    "/podcast": { fa: "/podcast", en: "/podcast" },
    "/podcast/[slug]": { fa: "/podcast/[slug]", en: "/podcast/[slug]" },
    "/goftogoo": { fa: "/goftogoo", en: "/interviews" },
    "/goftogoo/[slug]": { fa: "/goftogoo/[slug]", en: "/interviews/[slug]" },
    "/arshiv": { fa: "/arshiv", en: "/archive" },
    "/authors/[slug]": { fa: "/authors/[slug]", en: "/authors/[slug]" },
    "/darbare": { fa: "/darbare", en: "/about" },
    "/ersal": { fa: "/ersal", en: "/submit" },
    "/search": { fa: "/search", en: "/search" },
  },
});

export type AppPathnames = keyof typeof routing.pathnames;
