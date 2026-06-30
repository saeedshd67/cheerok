import type { MetadataRoute } from "next";
import {
  getAllStorySlugs,
  getAllEssaySlugs,
  getAllPodcastSlugs,
  getAllInterviewSlugs,
  getAllAuthorSlugs,
} from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cheerok.com";

/**
 * Next.js sitemap convention: this file exports a function that returns
 * the sitemap as a typed array, which Next converts to XML at /sitemap.xml.
 *
 * Locale strategy (matches cheerok-architecture.md §1 and routing.ts):
 *   fa (default): /dastan/slug, /jostar/slug …  (no prefix)
 *   en:           /en/fiction/slug, /en/essays/slug …
 *
 * alternates.languages per entry tells Google these are the same content
 * in different languages — this is what prevents duplicate-content penalties
 * for the bilingual site.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages — both locales
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },

    ...staticEntry("/dastan", "/en/fiction", "weekly", 0.9),
    ...staticEntry("/jostar", "/en/essays", "weekly", 0.9),
    ...staticEntry("/podcast", "/en/podcast", "weekly", 0.9),
    ...staticEntry("/goftogoo", "/en/interviews", "weekly", 0.9),
    ...staticEntry("/arshiv", "/en/archive", "weekly", 0.8),
    ...staticEntry("/darbare", "/en/about", "monthly", 0.6),
    // /ersal is noindexed in its generateMetadata — excluded from sitemap
  ];

  // Dynamic content — fan out over all slugs
  const [storySlugs, essaySlugs, podcastSlugs, interviewSlugs, authorSlugs] =
    await Promise.all([
      getAllStorySlugs().catch(() => [] as string[]),
      getAllEssaySlugs().catch(() => [] as string[]),
      getAllPodcastSlugs().catch(() => [] as string[]),
      getAllInterviewSlugs().catch(() => [] as string[]),
      getAllAuthorSlugs().catch(() => [] as string[]),
    ]);

  const storyEntries = storySlugs.flatMap((slug) =>
    bilingualEntry(`/dastan/${slug}`, `/en/fiction/${slug}`, "monthly", 0.8)
  );
  const essayEntries = essaySlugs.flatMap((slug) =>
    bilingualEntry(`/jostar/${slug}`, `/en/essays/${slug}`, "monthly", 0.8)
  );
  const podcastEntries = podcastSlugs.flatMap((slug) =>
    bilingualEntry(`/podcast/${slug}`, `/en/podcast/${slug}`, "monthly", 0.7)
  );
  const interviewEntries = interviewSlugs.flatMap((slug) =>
    bilingualEntry(`/goftogoo/${slug}`, `/en/interviews/${slug}`, "monthly", 0.7)
  );
  const authorEntries = authorSlugs.flatMap((slug) =>
    bilingualEntry(`/authors/${slug}`, `/en/authors/${slug}`, "monthly", 0.6)
  );

  return [
    ...staticPages,
    ...storyEntries,
    ...essayEntries,
    ...podcastEntries,
    ...interviewEntries,
    ...authorEntries,
  ];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

/**
 * One entry with hreflang alternates for both locales.
 * Returns two items: the fa (default) URL and the en URL, each with the
 * other listed as an alternate — this is the correct pattern for Google's
 * bilingual sitemap guidance.
 */
function bilingualEntry(
  faPath: string,
  enPath: string,
  changeFrequency: ChangeFreq,
  priority: number
): MetadataRoute.Sitemap {
  const faUrl = `${BASE_URL}${faPath}`;
  const enUrl = `${BASE_URL}/en${enPath.replace(/^\/en/, "")}`;

  return [
    {
      url: faUrl,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: { languages: { fa: faUrl, en: enUrl } },
    },
    {
      url: enUrl,
      lastModified: new Date(),
      changeFrequency,
      priority: priority - 0.05,
      alternates: { languages: { fa: faUrl, en: enUrl } },
    },
  ];
}

/**
 * Two static sitemap entries (fa + en) for fixed pages.
 */
function staticEntry(
  faPath: string,
  enPath: string,
  changeFrequency: ChangeFreq,
  priority: number
): MetadataRoute.Sitemap {
  return bilingualEntry(faPath, enPath, changeFrequency, priority);
}
