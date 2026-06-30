import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getInterviewBySlug, getAllInterviewSlugs } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import AudioStrip from "@/components/AudioStrip";
import NewsletterForm from "@/components/NewsletterForm";

interface PageProps { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllInterviewSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const iv = await getInterviewBySlug(slug);
  if (!iv) return {};
  const title = locale === "en" ? iv.titleEn ?? iv.titleFa : iv.titleFa;
  return { title };
}

export default async function InterviewPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Story");
  const iv = await getInterviewBySlug(slug);
  if (!iv) notFound();

  const title = locale === "en" ? iv.titleEn ?? iv.titleFa : iv.titleFa;
  const guestName = locale === "en" ? iv.intervieweeNameEn ?? iv.intervieweeNameFa : iv.intervieweeNameFa;
  const guestBio = locale === "en" ? iv.intervieweeBioEn ?? iv.intervieweeBioFa : iv.intervieweeBioFa;
  const editorName = locale === "en" ? iv.author.nameEn : iv.author.nameFa;

  // Pick the first answer that's long enough to work as a pull-quote
  const pullQuoteItem = iv.qaItems.find((q) => {
    const ans = locale === "en" ? q.answerEn ?? q.answerFa : q.answerFa;
    return ans && ans.length > 80;
  });
  const pullQuote = pullQuoteItem
    ? `"${locale === "en" ? pullQuoteItem.answerEn ?? pullQuoteItem.answerFa : pullQuoteItem.answerFa}"`
    : null;

  // Split Q&A around the pull-quote position (before last third)
  const splitAt = Math.floor(iv.qaItems.length * 0.6);
  const qaFirst = iv.qaItems.slice(0, splitAt);
  const qaSecond = iv.qaItems.slice(splitAt);

  return (
    <article>
      <div className="max-w-[700px] mx-auto px-6 md:px-12 pt-[22px]">
        <nav className="flex items-center gap-2 font-en text-xs text-silver mb-8">
          <Link href="/" className="hover:text-smoke">←</Link>
          <span>/</span>
          <Link href="/goftogoo" className="hover:text-smoke">گفت‌وگو</Link>
        </nav>

        <header className="pb-8 border-b border-line-2 mb-8">
          <div className="flex items-center gap-3 font-en text-[10px] tracking-[0.25em] uppercase text-silver mb-5">
            <span className="w-[18px] h-px bg-line-2" />
            گفت‌وگو
          </div>
          <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.3] tracking-tight text-ink mb-4">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-smoke">{editorName}</span>
            {iv.readingTimeMinutes && (
              <span className="text-silver font-en text-xs">
                {t("readingTime", { minutes: iv.readingTimeMinutes })}
              </span>
            )}
          </div>
        </header>

        {/* Guest card */}
        <div className="flex items-center gap-5 p-6 border border-line mb-8">
          <div className="w-[68px] h-[68px] rounded-full bg-surf border border-line flex items-center justify-center text-xl font-semibold text-silver shrink-0">
            {guestName?.charAt(0)}
          </div>
          <div>
            <div className="font-en text-[10px] tracking-[0.2em] uppercase text-silver mb-2">
              میهمان این گفت‌وگو
            </div>
            <div className="text-[18px] font-bold text-ink mb-1">{guestName}</div>
            {guestBio && <p className="text-[13px] text-smoke leading-[1.6]">{guestBio}</p>}
          </div>
        </div>

        {/* Audio strip */}
        {iv.audioUrl && <AudioStrip audioUrl={iv.audioUrl} />}

        {/* Q&A first half */}
        <QASection items={qaFirst} locale={locale} />
      </div>

      {/* Pull-quote band */}
      {pullQuote && (
        <div className="bg-ink text-white py-16 px-6 md:px-12 my-0">
          <div className="max-w-[740px] mx-auto text-center">
            <p className="text-[22px] md:text-[28px] font-light leading-[1.6] italic text-[#EDEDEB]">
              {pullQuote}
            </p>
            <div className="font-en text-[11px] tracking-[0.18em] uppercase text-[#666] mt-5">
              — {guestName}
            </div>
          </div>
        </div>
      )}

      {/* Q&A second half + bio */}
      <div className="max-w-[700px] mx-auto px-6 md:px-12 pb-16">
        <QASection items={qaSecond} locale={locale} />

        {guestBio && (
          <div className="flex gap-5 p-7 bg-surf mt-12">
            <div className="w-14 h-14 rounded-full bg-white border border-line shrink-0" aria-hidden />
            <div>
              <div className="font-en text-[10px] tracking-[0.2em] uppercase text-silver mb-2.5">
                {t("aboutAuthor")}
              </div>
              <div className="text-[17px] font-bold text-ink mb-2">{guestName}</div>
              <p className="text-sm text-smoke leading-[1.8]">{guestBio}</p>
            </div>
          </div>
        )}
      </div>

      <NewsletterForm />
    </article>
  );
}

function QASection({
  items,
  locale,
}: {
  items: Array<{ questionFa: string; questionEn?: string; answerFa: string; answerEn?: string }>;
  locale: string;
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-8 py-6 text-[17px] leading-[1.75]">
      {items.map((item, i) => {
        const q = locale === "en" ? item.questionEn ?? item.questionFa : item.questionFa;
        const a = locale === "en" ? item.answerEn ?? item.answerFa : item.answerFa;
        return (
          <div key={i} className="qa-pair">
            <p className="text-smoke mb-3">
              <span className="font-en text-[11px] tracking-[0.14em] uppercase text-silver ml-2">
                چیروک
              </span>
              {q}
            </p>
            <p className="text-ink-2">
              <span className="font-en text-[11px] tracking-[0.14em] uppercase text-ink ml-2">
                —
              </span>
              {a}
            </p>
          </div>
        );
      })}
    </div>
  );
}
