import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getPodcastBySlug, getAllPodcastSlugs } from "@/lib/api";
import { buildAlternates, ogArticle, jsonLdPodcastEpisode, jsonLdBreadcrumb, canonical } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import AudioStrip from "@/components/AudioStrip";
import NewsletterForm from "@/components/NewsletterForm";
import JsonLd from "@/components/JsonLd";

interface PageProps { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllPodcastSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const ep = await getPodcastBySlug(slug);
  if (!ep) return {};
  const title = locale === "en" ? ep.titleEn ?? ep.titleFa : ep.titleFa;
  return {
    title,
    alternates: buildAlternates(locale, `/podcast/${slug}`, `/podcast/${slug}`),
    openGraph: ogArticle({ title, locale, publishedAt: ep.publishedAt }),
  };
}

export default async function PodcastEpisodePage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Section");
  const ep = await getPodcastBySlug(slug);
  if (!ep) notFound();

  const title = locale === "en" ? ep.titleEn ?? ep.titleFa : ep.titleFa;
  const showNotes = locale === "en" ? ep.showNotesEn ?? ep.showNotesFa : ep.showNotesFa;
  const transcript = locale === "en" ? ep.transcriptEn ?? ep.transcriptFa : ep.transcriptFa;
  const minutes = ep.durationSeconds ? Math.round(ep.durationSeconds / 60) : null;
  const epUrl = canonical(locale, `/podcast/${slug}`);

  return (
    <article>
      {ep.audioUrl && (
        <JsonLd data={jsonLdPodcastEpisode({
          title, url: epUrl, audioUrl: ep.audioUrl,
          durationSeconds: ep.durationSeconds, publishedAt: ep.publishedAt,
          episodeNumber: ep.episodeNumber,
          description: locale === "en" ? ep.excerptEn ?? ep.excerptFa : ep.excerptFa,
        })} />
      )}
      <JsonLd data={jsonLdBreadcrumb([
        { name: "چیروک", url: canonical("fa", "/") },
        { name: "پادکست", url: canonical(locale, "/podcast") },
        { name: title, url: epUrl },
      ])} />

      <div className="max-w-[700px] mx-auto px-6 md:px-12 pt-[22px] pb-16">
        <nav className="flex items-center gap-2 font-en text-xs text-silver mb-8">
          <Link href="/" className="hover:text-smoke">←</Link>
          <span>/</span>
          <Link href="/podcast" className="hover:text-smoke">Podcast</Link>
        </nav>
        <header className="pb-8 border-b border-line-2 mb-8">
          {ep.episodeNumber && (
            <div className="font-en text-[10px] tracking-[0.25em] uppercase text-silver mb-4 flex items-center gap-3">
              <span className="w-[18px] h-px bg-line-2" />
              {t("episode", { n: ep.episodeNumber })}
            </div>
          )}
          <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.3] tracking-tight text-ink mb-4">{title}</h1>
          {minutes && <span className="text-xs text-silver font-en">{t("duration", { min: minutes })}</span>}
        </header>
        {ep.audioUrl && <AudioStrip audioUrl={ep.audioUrl} spotifyUrl={ep.spotifyUrl} applePodcastsUrl={ep.applePodcastsUrl} />}
        {showNotes && (
          <section className="mb-10">
            <div className="font-en text-[10px] tracking-[0.2em] uppercase text-silver mb-4">Show Notes</div>
            <div className="text-[15px] text-ink-2 leading-[1.85] whitespace-pre-line">{showNotes}</div>
          </section>
        )}
        {transcript && (
          <section>
            <div className="font-en text-[10px] tracking-[0.2em] uppercase text-silver mb-4">{t("transcript")}</div>
            <div className="text-[15px] text-ink-2 leading-[1.85] whitespace-pre-line border-t border-line-2 pt-6">{transcript}</div>
          </section>
        )}
      </div>
      <NewsletterForm />
    </article>
  );
}
