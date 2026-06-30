import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { StoryOrEssay } from "@/types/content";

export default async function FeaturedStory({ piece }: { piece: StoryOrEssay }) {
  const locale = await getLocale();
  const t = await getTranslations();

  const title = locale === "en" ? piece.titleEn ?? piece.titleFa : piece.titleFa;
  const excerpt = locale === "en" ? piece.excerptEn ?? piece.excerptFa : piece.excerptFa;
  const authorName = locale === "en" ? piece.author.nameEn : piece.author.nameFa;
  const initials = authorName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <section className="px-6 md:px-12 border-b border-line">
      <div className="grid md:grid-cols-[55fr_45fr] gap-10 md:gap-16 items-center py-16">
        <div className="aspect-[5/4] bg-surf overflow-hidden relative">
          {piece.coverImageUrl ? (
            // Using next/image in the real implementation; the prototype
            // placeholder icon is kept here only as a visual fallback.
            <img
              src={piece.coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-line" aria-hidden>
              <PhotoIcon />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3 font-en text-[10px] tracking-[0.25em] uppercase text-silver mb-[26px]">
            <span className="w-[18px] h-px bg-line-2" />
            {t("Home.featuredLabel")}
          </div>
          <h1 className="text-[28px] md:text-[34px] font-bold leading-[1.25] tracking-tight text-ink mb-[22px]">
            {title}
          </h1>
          {excerpt && (
            <p className="text-base leading-[1.9] text-ink-2 mb-[34px]">{excerpt}</p>
          )}

          <div className="flex items-center gap-3.5 pt-6 border-t border-line-2 mb-[30px]">
            <div className="w-[38px] h-[38px] rounded-full bg-surf border border-line flex items-center justify-center text-[13px] font-semibold text-silver shrink-0">
              {initials}
            </div>
            <div>
              <Link
                href={{ pathname: "/authors/[slug]", params: { slug: piece.author.slug } }}
                className="text-sm font-semibold text-ink hover:underline underline-offset-[3px]"
              >
                {authorName}
              </Link>
              {piece.readingTimeMinutes && (
                <div className="text-xs text-silver mt-0.5">
                  {t("Story.byAuthor")} · {t("Story.readingTime", { minutes: piece.readingTimeMinutes })}
                </div>
              )}
            </div>
          </div>

          <Link
            href={{ pathname: "/dastan/[slug]", params: { slug: piece.slug } }}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-ink text-white text-[13px] font-semibold tracking-wide hover:bg-ink-2 transition-colors"
          >
            <span>{t("Nav.fiction")}</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PhotoIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6">
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="8.5" cy="8.5" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="icon-flip"
      aria-hidden
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}
