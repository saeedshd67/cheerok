/**
 * SEO utilities for Cheerok.
 *
 * Three concerns live here:
 * 1. Canonical + hreflang URL building — consistent across all pages
 * 2. Open Graph metadata builders — per-content-type
 * 3. JSON-LD structured data — Article, BreadcrumbList, WebSite
 *
 * All helpers return plain objects; nothing here renders JSX.
 * Components consume these via Next.js `generateMetadata` and the
 * `<script type="application/ld+json">` tag in the locale layout.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cheerok.com";

// ---------------------------------------------------------------------------
// 1. URL helpers
// ---------------------------------------------------------------------------

/**
 * Builds the canonical URL for a given locale and path.
 * Persian (default) is unprefixed; English is under /en.
 *
 * Examples:
 *   canonical("fa", "/dastan/some-slug")  → "https://cheerok.com/dastan/some-slug"
 *   canonical("en", "/fiction/some-slug") → "https://cheerok.com/en/fiction/some-slug"
 */
export function canonical(locale: string, path: string): string {
  const prefix = locale === "fa" ? "" : `/${locale}`;
  return `${BASE_URL}${prefix}${path}`;
}

/**
 * Returns the hreflang alternates object for Next.js `generateMetadata`.
 * Pass the internal (Persian) path and the English-translated path separately
 * because section names differ (/dastan vs /fiction etc.).
 *
 * Usage in generateMetadata:
 *   alternates: buildAlternates(locale, "/dastan/slug", "/fiction/slug")
 */
export function buildAlternates(
  currentLocale: string,
  faPath: string,
  enPath: string
): {
  canonical: string;
  languages: Record<string, string>;
} {
  return {
    canonical: canonical(currentLocale, currentLocale === "fa" ? faPath : enPath),
    languages: {
      fa: canonical("fa", faPath),
      en: canonical("en", enPath),
      "x-default": canonical("fa", faPath), // default to Persian per the brief
    },
  };
}

// ---------------------------------------------------------------------------
// 2. Open Graph helpers
// ---------------------------------------------------------------------------

interface OgArticleOptions {
  title: string;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
  authorName?: string;
  locale: string;
}

export function ogArticle(opts: OgArticleOptions) {
  return {
    title: opts.title,
    description: opts.description,
    type: "article" as const,
    locale: opts.locale === "fa" ? "fa_IR" : "en_US",
    siteName: "چیروک / Cheerok",
    images: opts.imageUrl
      ? [{ url: opts.imageUrl, width: 1200, height: 630, alt: opts.title }]
      : [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630, alt: "Cheerok" }],
    publishedTime: opts.publishedAt,
    authors: opts.authorName ? [opts.authorName] : undefined,
  };
}

export function ogWebsite(locale: string) {
  return {
    type: "website" as const,
    locale: locale === "fa" ? "fa_IR" : "en_US",
    siteName: "چیروک / Cheerok",
    images: [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630 }],
  };
}

// ---------------------------------------------------------------------------
// 3. JSON-LD structured data
// ---------------------------------------------------------------------------

/**
 * Article (or BlogPosting) schema for story/essay/interview pages.
 * Returns a plain object ready for JSON.stringify — the layout's
 * <JsonLd> component wraps it in the script tag.
 */
export function jsonLdArticle(opts: {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  authorName: string;
  authorUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: opts.imageUrl ?? `${BASE_URL}/og-default.jpg`,
    datePublished: opts.publishedAt,
    author: {
      "@type": "Person",
      name: opts.authorName,
      url: opts.authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Cheerok",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    inLanguage: "fa",
    isPartOf: { "@type": "WebSite", name: "Cheerok", url: BASE_URL },
  };
}

/** WebSite schema with SearchAction — enables Google's sitelinks search box. */
export function jsonLdWebSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cheerok",
    alternateName: "چیروک",
    url: BASE_URL,
    description: "مجله ادبی داستان، جستار و پادکست",
    inLanguage: ["fa", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList for section and detail pages. */
export function jsonLdBreadcrumb(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Podcast (PodcastSeries → PodcastEpisode) schema. */
export function jsonLdPodcastEpisode(opts: {
  title: string;
  description?: string;
  url: string;
  audioUrl: string;
  durationSeconds?: number;
  publishedAt?: string;
  episodeNumber?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: opts.title,
    description: opts.description,
    url: opts.url,
    associatedMedia: {
      "@type": "AudioObject",
      contentUrl: opts.audioUrl,
      duration: opts.durationSeconds ? `PT${Math.round(opts.durationSeconds / 60)}M` : undefined,
    },
    datePublished: opts.publishedAt,
    episodeNumber: opts.episodeNumber,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: "Cheerok Podcast",
      url: `${BASE_URL}/podcast`,
    },
  };
}
