import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PodcastEpisode } from "@/types/content";

export default function PodcastCard({ episode }: { episode: PodcastEpisode }) {
  const locale = useLocale();
  const t = useTranslations("Section");

  const title = locale === "en" ? episode.titleEn ?? episode.titleFa : episode.titleFa;
  const excerpt = locale === "en" ? episode.excerptEn ?? episode.excerptFa : episode.excerptFa;
  const minutes = episode.durationSeconds ? Math.round(episode.durationSeconds / 60) : null;
  const epNum = episode.episodeNumber
    ? String(episode.episodeNumber).padStart(2, "0")
    : null;

  return (
    <div className="flex items-start gap-5 bg-white p-7 border border-line hover:border-silver transition-colors">
      {epNum && (
        <span className="font-en text-[30px] font-extralight text-line leading-none shrink-0 w-11 text-center select-none">
          {epNum}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <Link
          href={{ pathname: "/podcast/[slug]", params: { slug: episode.slug } }}
          className="text-[16px] font-bold text-ink leading-[1.4] hover:underline underline-offset-[3px] block mb-2"
        >
          {title}
        </Link>
        {excerpt && (
          <p className="text-[13px] text-smoke leading-[1.65] mb-3 line-clamp-2">{excerpt}</p>
        )}
        <div className="flex items-center gap-2 font-en text-[11px] text-silver">
          {minutes && <span>{t("duration", { min: minutes })}</span>}
          {minutes && episode.publishedAt && <span>·</span>}
          {episode.publishedAt && (
            <span>
              {new Date(episode.publishedAt).toLocaleDateString(
                locale === "fa" ? "fa-IR" : "en-US"
              )}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label="پخش"
        className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-smoke hover:bg-ink hover:text-white hover:border-ink transition-all shrink-0"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
      </button>
    </div>
  );
}
