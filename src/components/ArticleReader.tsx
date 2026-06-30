import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppPathnames } from "@/i18n/routing";
import type { StoryOrEssay } from "@/types/content";

/**
 * Shared by /dastan/[slug] and /jostar/[slug] -- the brief specifies
 * essays use the same structure as fiction (title, author, date, reading
 * time, body, author bio, related works), plus footnote/pull-quote
 * support. That shared structure lives here once instead of being copied
 * across two page files.
 */
export default async function ArticleReader({
  piece,
  sectionPathname,
}: {
  piece: StoryOrEssay;
  sectionPathname: Extract<AppPathnames, "/dastan" | "/jostar">;
}) {
  const locale = await getLocale();
  const t = await getTranslations("Story");

  const title = locale === "en" ? piece.titleEn ?? piece.titleFa : piece.titleFa;
  const body = locale === "en" ? piece.bodyEn ?? piece.bodyFa : piece.bodyFa;
  const authorName = locale === "en" ? piece.author.nameEn : piece.author.nameFa;
  const authorBio = locale === "en" ? piece.author.bioEn : piece.author.bioFa;

  return (
    <article>
      <div className="max-w-[700px] mx-auto px-6 md:px-12 pt-[22px]">
        <nav className="flex items-center gap-2 font-en text-xs text-silver mb-8">
          <Link href="/" className="hover:text-smoke">
            ←
          </Link>
          <span>/</span>
          <Link href={sectionPathname} className="hover:text-smoke">
            {t("byAuthor")}
          </Link>
        </nav>

        <header className="pb-9 border-b border-line-2 mb-11">
          <h1 className="text-[28px] md:text-[38px] font-bold leading-[1.3] tracking-tight text-ink mb-[18px]">
            {title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link
              href={{ pathname: "/authors/[slug]", params: { slug: piece.author.slug } }}
              className="text-sm font-semibold text-ink hover:underline underline-offset-[3px]"
            >
              {authorName}
            </Link>
            {piece.readingTimeMinutes && (
              <span className="text-xs text-silver font-en">
                {t("readingTime", { minutes: piece.readingTimeMinutes })}
              </span>
            )}
          </div>
        </header>

        {/*
          body is editor-authored rich text from Strapi (markdown or a
          structured rich-text format depending on which Strapi field type
          the team picks) -- rendering it requires a sanitizing markdown/
          rich-text renderer (e.g. react-markdown, or Strapi's blocks
          renderer), not raw dangerouslySetInnerHTML. Essays additionally
          need footnote and pull-quote support per the brief; both are a
          property of whichever renderer gets chosen here, not something
          to fake with placeholder markup. That render step is
          intentionally left as a TODO rather than faked.
        */}
        <div className="prose-story text-[18px] leading-[1.95] text-ink-2">
          {body ? (
            <ArticleBodyPlaceholder text={body} />
          ) : (
            <p className="text-silver text-sm">
              {locale === "fa" ? "متن در دسترس نیست." : "Body unavailable."}
            </p>
          )}
        </div>

        {authorBio && (
          <div className="flex gap-5 p-7 bg-surf mt-14">
            <div className="w-14 h-14 rounded-full bg-white border border-line shrink-0" aria-hidden />
            <div>
              <div className="font-en text-[10px] tracking-[0.2em] uppercase text-silver mb-2.5">
                {t("aboutAuthor")}
              </div>
              <div className="text-[17px] font-bold text-ink mb-2">{authorName}</div>
              <p className="text-sm text-smoke leading-[1.8]">{authorBio}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Stand-in for the real rich-text renderer mentioned above. Splits on
 * double newlines so the scaffold is runnable against plain-text seed
 * content without pulling in a markdown dependency just for this file.
 */
function ArticleBodyPlaceholder({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((para, i) => (
        <p key={i} className="mb-[1.6em]">
          {para}
        </p>
      ))}
    </>
  );
}
