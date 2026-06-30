import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getAuthorBySlug, getAllAuthorSlugs, getWorksByAuthor } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import type { ContentPiece } from "@/types/content";

interface PageProps { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllAuthorSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};
  const name = locale === "en" ? author.nameEn : author.nameFa;
  return { title: name };
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const [author, works] = await Promise.all([
    getAuthorBySlug(slug),
    getWorksByAuthor(slug),
  ]);
  if (!author) notFound();

  const t = await getTranslations("Author");
  const st = await getTranslations("Section");

  const name = locale === "en" ? author.nameEn : author.nameFa;
  const tagline = locale === "en" ? author.taglineEn : author.taglineFa;
  const bio = locale === "en" ? author.bioEn : author.bioFa;

  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  const firstYear = works.length
    ? new Date(works[works.length - 1]?.publishedAt ?? "").getFullYear()
    : null;

  const DETAIL_PATH: Record<string, string> = {
    fiction: "/dastan/[slug]",
    essay: "/jostar/[slug]",
    podcast: "/podcast/[slug]",
    interview: "/goftogoo/[slug]",
  };

  return (
    <main>
      {/* Author hero */}
      <section className="px-6 md:px-12 pt-10 pb-12 border-b border-line">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-[160px_1fr] gap-10 items-start">
          {author.photoUrl ? (
            <img
              src={author.photoUrl}
              alt={name}
              className="w-[160px] h-[160px] object-cover border border-line"
            />
          ) : (
            <div className="w-[160px] h-[160px] bg-surf border border-line flex items-center justify-center text-[40px] font-semibold text-silver">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-ink mb-2">{name}</h1>
            {tagline && (
              <p className="text-[13px] text-silver mb-5">{tagline}</p>
            )}
            {bio && (
              <p className="text-[15px] text-ink-2 leading-[1.85] max-w-[600px] mb-6">{bio}</p>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(author.socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-line px-4 py-1.5 text-xs text-smoke hover:border-ink hover:text-ink transition-colors capitalize"
                >
                  {platform}
                </a>
              ))}
              <span className="text-xs text-silver">
                {works.length} {t("publishedIn")}
                {firstYear && ` · ${t("since", { year: firstYear })}`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Works list */}
      <section className="px-6 md:px-12 py-10">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[19px] font-bold text-ink mb-6">{t("worksBy")}</h2>

          {works.length === 0 ? (
            <p className="text-sm text-silver">{st("noResults")}</p>
          ) : (
            <div className="divide-y divide-line-2">
              {works.map((item: ContentPiece) => {
                const title = locale === "en" ? item.titleEn ?? item.titleFa : item.titleFa;
                const excerpt = locale === "en" ? item.excerptEn ?? item.excerptFa : item.excerptFa;
                const year = item.publishedAt
                  ? new Date(item.publishedAt).toLocaleDateString(
                      locale === "fa" ? "fa-IR" : "en-US",
                      { year: "numeric", month: "long" }
                    )
                  : null;

                return (
                  <Link
                    key={item.id}
                    href={{ pathname: DETAIL_PATH[item.type] as any, params: { slug: item.slug } }}
                    className="flex items-start gap-6 py-6 group hover:bg-[#fafaf9]"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-en text-[10px] tracking-[0.2em] uppercase text-silver block mb-2">
                        {item.type}
                      </span>
                      <span className="text-[17px] font-bold text-ink group-hover:underline underline-offset-[3px] block mb-2">
                        {title}
                      </span>
                      {excerpt && (
                        <span className="text-[13px] text-ink-2 leading-[1.65] line-clamp-2 block">
                          {excerpt}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-silver shrink-0 pt-1 whitespace-nowrap">{year}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
