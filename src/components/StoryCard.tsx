import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { StoryOrEssay } from "@/types/content";

/**
 * Renders one fiction/essay card as used on the homepage grids and the
 * archive listing. Picks the Persian or English field based on the active
 * locale -- falls back to the Persian field if an English translation
 * hasn't been filled in yet in Strapi, rather than rendering blank.
 */
export default function StoryCard({ piece }: { piece: StoryOrEssay }) {
  const locale = useLocale();
  const t = useTranslations("Story");

  const title = locale === "en" ? piece.titleEn ?? piece.titleFa : piece.titleFa;
  const excerpt = locale === "en" ? piece.excerptEn ?? piece.excerptFa : piece.excerptFa;
  const authorName = locale === "en" ? piece.author.nameEn : piece.author.nameFa;
  const genreLabel = piece.type === "fiction" ? "Short Story" : "Essay";

  const detailHref = piece.type === "fiction" ? "/dastan/[slug]" : "/jostar/[slug]";

  return (
    <Link
      href={{ pathname: detailHref, params: { slug: piece.slug } }}
      className="block bg-white hover:bg-[#fafaf9] px-[30px] py-7 transition-colors"
    >
      <div className="font-en text-[10px] tracking-[0.25em] uppercase text-silver mb-[13px]">
        {genreLabel}
      </div>
      <div className="text-[19px] font-bold text-ink leading-[1.35] mb-[9px] hover:underline underline-offset-[3px]">
        {title}
      </div>
      <div className="text-[13px] text-smoke mb-[13px]">{authorName}</div>
      {excerpt && (
        <p className="text-sm text-ink-2 leading-[1.75] mb-[18px] line-clamp-3">{excerpt}</p>
      )}
      <div className="flex items-center gap-2 font-en text-[11px] text-silver">
        {piece.readingTimeMinutes && (
          <>
            <span>{t("readingTime", { minutes: piece.readingTimeMinutes })}</span>
            <span className="w-[3px] h-[3px] rounded-full bg-line" aria-hidden />
          </>
        )}
        {piece.publishedAt && (
          <span>{new Date(piece.publishedAt).toLocaleDateString(locale === "fa" ? "fa-IR" : "en-US")}</span>
        )}
      </div>
    </Link>
  );
}
