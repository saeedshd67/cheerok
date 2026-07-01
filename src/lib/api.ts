import type {
  Author,
  ContentPiece,
  Interview,
  PaginatedResult,
  PodcastEpisode,
  StoryOrEssay,
} from "@/types/content";

const CMS_URL = process.env.CMS_URL ?? "http://localhost:1337";
const CMS_TOKEN = process.env.CMS_API_TOKEN;

/**
 * Strapi v5 returns entries as { id, attributes: {...}, relations nested
 * the same way }. The normalize* helpers below flatten that into the
 * plain objects defined in src/types/content.ts so components never have
 * to know they're talking to Strapi specifically — swapping to Directus
 * later means rewriting this file, not every component that reads content.
 */

interface StrapiEntry<T> {
  id: number;
  attributes: T;
}
interface StrapiCollectionResponse<T> {
  data: StrapiEntry<T>[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}
// Not used by any function below yet -- reserved for Strapi "single type"
// endpoints (e.g. site-wide settings, the /darbare page's team roster) if
// those get modeled as Strapi singletons rather than hardcoded content.
interface StrapiSingleResponse<T> {
  data: StrapiEntry<T> | null;
}

async function strapiFetch<T>(path: string, revalidateTags: string[] = []): Promise<T> {
  const res = await fetch(`${CMS_URL}/api${path}`, {
    headers: CMS_TOKEN ? { Authorization: `Bearer ${CMS_TOKEN}` } : undefined,
    // Tag-based revalidation: /api/revalidate calls revalidateTag() with
    // these same tags when Strapi's publish webhook fires. See
    // src/app/api/revalidate/route.ts.
    next: { tags: revalidateTags },
  });

  if (!res.ok) {
    throw new Error(`CMS request failed: ${path} -> ${res.status}`);
  }
  return res.json();
}

function normalizeAuthor(raw: any): Author {
  return {
    slug: raw.slug,
    nameFa: raw.name_fa,
    nameEn: raw.name_en,
    taglineFa: raw.tagline_fa,
    taglineEn: raw.tagline_en,
    bioFa: raw.bio_fa,
    bioEn: raw.bio_en,
    photoUrl: raw.photo?.data?.attributes?.url,
    socialLinks: raw.social_links ?? {},
  };
}

function normalizeStoryOrEssay(entry: StrapiEntry<any>, type: "fiction" | "essay"): StoryOrEssay {
  const a = entry.attributes;
  return {
    id: String(entry.id),
    type,
    slug: a.slug,
    titleFa: a.title_fa,
    titleEn: a.title_en,
    dekFa: a.dek_fa,
    dekEn: a.dek_en,
    excerptFa: a.excerpt_fa,
    excerptEn: a.excerpt_en,
    bodyFa: a.body_fa,
    bodyEn: a.body_en,
    coverImageUrl: a.cover_image?.data?.attributes?.url,
    readingTimeMinutes: a.reading_time_minutes,
    status: a.status,
    publishedAt: a.published_at,
    author: normalizeAuthor(a.author.data.attributes),
    tags: (a.tags?.data ?? []).map((t: any) => ({
      slug: t.attributes.slug,
      labelFa: t.attributes.label_fa,
      labelEn: t.attributes.label_en,
      kind: t.attributes.kind,
    })),
  };
}

function normalizePodcastEpisode(entry: StrapiEntry<any>): PodcastEpisode {
  const a = entry.attributes;
  const d = a.podcast_detail ?? {};
  return {
    id: String(entry.id),
    type: "podcast",
    slug: a.slug,
    titleFa: a.title_fa,
    titleEn: a.title_en,
    dekFa: a.dek_fa,
    dekEn: a.dek_en,
    excerptFa: a.excerpt_fa,
    excerptEn: a.excerpt_en,
    coverImageUrl: a.cover_image?.data?.attributes?.url,
    readingTimeMinutes: a.reading_time_minutes,
    status: a.status,
    publishedAt: a.published_at,
    author: normalizeAuthor(a.author.data.attributes),
    tags: (a.tags?.data ?? []).map((t: any) => ({
      slug: t.attributes.slug,
      labelFa: t.attributes.label_fa,
      labelEn: t.attributes.label_en,
      kind: t.attributes.kind,
    })),
    episodeNumber: d.episode_number,
    audioUrl: d.audio_url,
    durationSeconds: d.duration_seconds,
    spotifyUrl: d.spotify_url,
    applePodcastsUrl: d.apple_podcasts_url,
    transcriptFa: d.transcript_fa,
    transcriptEn: d.transcript_en,
    showNotesFa: d.show_notes_fa,
    showNotesEn: d.show_notes_en,
  };
}

function normalizeInterview(entry: StrapiEntry<any>): Interview {
  const a = entry.attributes;
  const d = a.interview_detail ?? {};
  return {
    id: String(entry.id),
    type: "interview",
    slug: a.slug,
    titleFa: a.title_fa,
    titleEn: a.title_en,
    dekFa: a.dek_fa,
    dekEn: a.dek_en,
    excerptFa: a.excerpt_fa,
    excerptEn: a.excerpt_en,
    coverImageUrl: a.cover_image?.data?.attributes?.url,
    readingTimeMinutes: a.reading_time_minutes,
    status: a.status,
    publishedAt: a.published_at,
    author: normalizeAuthor(a.author.data.attributes),
    tags: (a.tags?.data ?? []).map((t: any) => ({
      slug: t.attributes.slug,
      labelFa: t.attributes.label_fa,
      labelEn: t.attributes.label_en,
      kind: t.attributes.kind,
    })),
    intervieweeNameFa: d.interviewee_name_fa,
    intervieweeNameEn: d.interviewee_name_en,
    intervieweeBioFa: d.interviewee_bio_fa,
    intervieweeBioEn: d.interviewee_bio_en,
    intervieweePhotoUrl: d.interviewee_photo?.data?.attributes?.url,
    audioUrl: d.audio_url,
    qaItems: (a.qa_items ?? []).map((q: any) => ({
      questionFa: q.question_fa,
      questionEn: q.question_en,
      answerFa: q.answer_fa,
      answerEn: q.answer_en,
    })),
  };
}

/** Homepage + listing pages: latest N published stories. */
export async function getLatestStories(limit = 3): Promise<StoryOrEssay[]> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/stories?filters[status][$eq]=published&sort=published_at:desc&pagination[limit]=${limit}&populate=author,tags,cover_image`,
    ["stories"]
  );
  return res.data.map((e) => normalizeStoryOrEssay(e, "fiction"));
}

export async function getLatestEssays(limit = 3): Promise<StoryOrEssay[]> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/essays?filters[status][$eq]=published&sort=published_at:desc&pagination[limit]=${limit}&populate=author,tags,cover_image`,
    ["essays"]
  );
  return res.data.map((e) => normalizeStoryOrEssay(e, "essay"));
}

export async function getEssayBySlug(slug: string): Promise<StoryOrEssay | null> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/essays?filters[slug][$eq]=${slug}&populate=author,tags,cover_image`,
    [`essay:${slug}`]
  );
  const entry = res.data[0];
  return entry ? normalizeStoryOrEssay(entry, "essay") : null;
}

export async function getAllEssaySlugs(): Promise<string[]> {
  try {
    const res = await strapiFetch<StrapiCollectionResponse<any>>(
      `/essays?filters[status][$eq]=published&fields[0]=slug&pagination[limit]=-1`
    );
    return res.data.map((e) => e.attributes.slug);
  } catch {
    return [];
  }
}

/** Podcast episodes. */
export async function getLatestPodcasts(limit = 4): Promise<PodcastEpisode[]> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/podcast-episodes?filters[status][$eq]=published&sort=published_at:desc&pagination[limit]=${limit}&populate=author,tags,cover_image,podcast_detail`,
    ["podcasts"]
  );
  return res.data.map(normalizePodcastEpisode);
}

export async function getPodcastBySlug(slug: string): Promise<PodcastEpisode | null> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/podcast-episodes?filters[slug][$eq]=${slug}&populate=author,tags,cover_image,podcast_detail`,
    [`podcast:${slug}`]
  );
  const entry = res.data[0];
  return entry ? normalizePodcastEpisode(entry) : null;
}

export async function getAllPodcastSlugs(): Promise<string[]> {
  try {
    const res = await strapiFetch<StrapiCollectionResponse<any>>(
      `/podcast-episodes?filters[status][$eq]=published&fields[0]=slug&pagination[limit]=-1`
    );
    return res.data.map((e) => e.attributes.slug);
  } catch {
    return [];
  }
}

/** Interviews. */
export async function getLatestInterviews(limit = 3): Promise<Interview[]> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/interviews?filters[status][$eq]=published&sort=published_at:desc&pagination[limit]=${limit}&populate=author,tags,cover_image,interview_detail,qa_items`,
    ["interviews"]
  );
  return res.data.map(normalizeInterview);
}

export async function getInterviewBySlug(slug: string): Promise<Interview | null> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/interviews?filters[slug][$eq]=${slug}&populate=author,tags,cover_image,interview_detail,qa_items`,
    [`interview:${slug}`]
  );
  const entry = res.data[0];
  return entry ? normalizeInterview(entry) : null;
}

export async function getAllInterviewSlugs(): Promise<string[]> {
  try {
    const res = await strapiFetch<StrapiCollectionResponse<any>>(
      `/interviews?filters[status][$eq]=published&fields[0]=slug&pagination[limit]=-1`
    );
    return res.data.map((e) => e.attributes.slug);
  } catch {
    return [];
  }
}

/** Story detail page. Returns null on 404 so the page can call notFound(). */
export async function getStoryBySlug(slug: string): Promise<StoryOrEssay | null> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/stories?filters[slug][$eq]=${slug}&populate=author,tags,cover_image`,
    [`story:${slug}`]
  );
  const entry = res.data[0];
  return entry ? normalizeStoryOrEssay(entry, "fiction") : null;
}

/** generateStaticParams source for /dastan/[slug] at build time. */
export async function getAllStorySlugs(): Promise<string[]> {
  try {
    const res = await strapiFetch<StrapiCollectionResponse<any>>(
      `/stories?filters[status][$eq]=published&fields[0]=slug&pagination[limit]=-1`
    );
    return res.data.map((e) => e.attributes.slug);
  } catch {
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const res = await strapiFetch<StrapiCollectionResponse<any>>(
    `/authors?filters[slug][$eq]=${slug}`,
    [`author:${slug}`]
  );
  const entry = res.data[0];
  return entry ? normalizeAuthor(entry.attributes) : null;
}

export async function getAllAuthorSlugs(): Promise<string[]> {
  try {
    const res = await strapiFetch<StrapiCollectionResponse<any>>(
      `/authors?filters[status][$eq]=active&fields[0]=slug&pagination[limit]=-1`
    );
    return res.data.map((e) => e.attributes.slug);
  } catch {
    return [];
  }
}

/**
 * All published work by one author across every content type, newest
 * first. Strapi doesn't have a single cross-collection "content_pieces"
 * endpoint unless the project models it that way (see the
 * class-table-inheritance note in cheerok-architecture.md §2) — until then
 * this fans out across the four collections and merges client-side.
 */
export async function getWorksByAuthor(authorSlug: string): Promise<ContentPiece[]> {
  const filter = `filters[author][slug][$eq]=${authorSlug}&filters[status][$eq]=published&populate=author,tags,cover_image`;
  const [stories, essays, podcasts, interviews] = await Promise.all([
    strapiFetch<StrapiCollectionResponse<any>>(`/stories?${filter}`, [`author:${authorSlug}`]),
    strapiFetch<StrapiCollectionResponse<any>>(`/essays?${filter}`, [`author:${authorSlug}`]),
    strapiFetch<StrapiCollectionResponse<any>>(`/podcast-episodes?${filter},podcast_detail`, [`author:${authorSlug}`]),
    strapiFetch<StrapiCollectionResponse<any>>(`/interviews?${filter},interview_detail,qa_items`, [`author:${authorSlug}`]),
  ]);

  const all: ContentPiece[] = [
    ...stories.data.map((e) => normalizeStoryOrEssay(e, "fiction")),
    ...essays.data.map((e) => normalizeStoryOrEssay(e, "essay")),
    ...podcasts.data.map(normalizePodcastEpisode),
    ...interviews.data.map(normalizeInterview),
  ];

  return all.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

/**
 * Archive page filters (year/genre/author/keyword). Maps straight onto
 * Strapi's query-param filtering — left thin here since the real
 * relevance-ranked text search runs through the dedicated search layer
 * described in cheerok-architecture.md §2, not this endpoint.
 */
/**
 * Archive page filters (year/genre/author/keyword).
 *
 * Strapi has no single cross-collection endpoint — Story, Essay,
 * PodcastEpisode, and Interview are separate collection types (see
 * cheerok-architecture.md §3 on why: per-collection role permissions for
 * the Fiction/Essays editors). So this fans out across whichever
 * collections match `params.type` (or all four, if unset), merges, sorts
 * by date, and paginates client-side in this function.
 *
 * That's fine for the filter-by-year/genre/author browsing this function
 * is for. It is NOT what should power free-text keyword search at scale —
 * for that, cheerok-architecture.md §2 calls for a dedicated layer
 * (Meilisearch/Typesense) with real relevance ranking and Persian
 * tokenization, which `q` here deliberately does not attempt to replicate
 * with a naive substring filter.
 */
export async function searchArchive(params: {
  type?: "fiction" | "essay" | "podcast" | "interview";
  year?: number;
  authorSlug?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<ContentPiece>> {
  const ALL_COLLECTIONS: { type: ContentPiece["type"]; path: string; normalize: (e: StrapiEntry<any>) => ContentPiece }[] = [
    { type: "fiction", path: "stories", normalize: (e) => normalizeStoryOrEssay(e, "fiction") },
    { type: "essay", path: "essays", normalize: (e) => normalizeStoryOrEssay(e, "essay") },
    { type: "podcast", path: "podcast-episodes", normalize: normalizePodcastEpisode },
    { type: "interview", path: "interviews", normalize: normalizeInterview },
  ];
  const collectionsToQuery = ALL_COLLECTIONS.filter((c) => !params.type || c.type === params.type);

  const qs = new URLSearchParams();
  qs.set("filters[status][$eq]", "published");
  if (params.year) qs.set("filters[published_at][$year]", String(params.year));
  if (params.authorSlug) qs.set("filters[author][slug][$eq]", params.authorSlug);
  qs.set("populate", "author,tags,cover_image");

  const results = await Promise.all(
    collectionsToQuery.map((c) =>
      strapiFetch<StrapiCollectionResponse<any>>(`/${c.path}?${qs}`, ["archive"]).then((res) =>
        res.data.map(c.normalize)
      )
    )
  );

  const merged = results
    .flat()
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const pageItems = merged.slice(start, start + pageSize);

  return {
    data: pageItems,
    meta: {
      page,
      pageSize,
      pageCount: Math.ceil(merged.length / pageSize),
      total: merged.length,
    },
  };
}

/** Public submission form POST. No auth — see roles table in architecture doc §3. */
export async function createSubmission(payload: {
  name: string;
  email: string;
  genre: string;
  title: string;
  bio?: string;
  coverLetter?: string;
  fileUrl: string;
}): Promise<{ referenceNumber: string }> {
  const res = await fetch(`${CMS_URL}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) throw new Error("Submission failed");
  const json = await res.json();
  return { referenceNumber: json.data.attributes.reference_number };
}