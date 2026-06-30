import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getLatestStories, getLatestEssays } from "@/lib/api";
import { canonical, ogWebsite } from "@/lib/seo";
import StoryCard from "@/components/StoryCard";
import NewsletterForm from "@/components/NewsletterForm";
import FeaturedStory from "@/components/FeaturedStory";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("Brand");
  return {
    alternates: {
      canonical: canonical(locale, "/"),
      languages: { fa: canonical("fa", "/"), en: canonical("en", "/"), "x-default": canonical("fa", "/") },
    },
    openGraph: { ...ogWebsite(locale), title: t("name"), description: t("tagline"), url: canonical(locale, "/") },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const [stories, essays] = await Promise.all([
    getLatestStories(3),
    getLatestEssays(3),
  ]);

  const featured = stories[0];
  const restOfStories = stories.slice(1);

  return (
    <main>
      {/* Hero */}
      <section className="px-6 md:px-12 pt-[68px] pb-[60px] border-b border-line text-center relative overflow-hidden">
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-en text-[160px] md:text-[220px] font-extralight text-transparent leading-none -z-0 select-none whitespace-nowrap"
          style={{ WebkitTextStroke: "1px #E8E8E6" }}
        >
          I
        </span>
        <div className="relative z-10">
          <p className="inline-flex items-center gap-3.5 font-en text-[11px] tracking-[0.2em] uppercase text-silver mb-[18px]">
            <span className="w-9 h-px bg-line" />
            {t("Home.featuredLabel")}
            <span className="w-9 h-px bg-line" />
          </p>
          <p className="text-[15px] text-smoke font-light">{t("Brand.tagline")}</p>
        </div>
      </section>

      {/* Featured story */}
      {featured && <FeaturedStory piece={featured} />}

      {/* Latest fiction */}
      <div>
        <SectionHead title={t("Home.latestFiction")} href="/dastan" viewAllLabel={t("Home.viewAll")} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line mt-6 mx-6 md:mx-12 border-t border-line">
          {restOfStories.map((s) => (
            <StoryCard key={s.id} piece={s} />
          ))}
        </div>
        <div className="pb-[52px]" />
      </div>

      {/* Latest essays (surface background, per the brief's visual rhythm) */}
      <div className="bg-surf">
        <SectionHead title={t("Home.latestEssays")} href="/jostar" viewAllLabel={t("Home.viewAll")} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e2e1df] mt-6 mx-6 md:mx-12 border-t border-line">
          {essays.map((e) => (
            <StoryCard key={e.id} piece={e} />
          ))}
        </div>
        <div className="pb-[52px]" />
      </div>

      <NewsletterForm />
    </main>
  );
}

function SectionHead({
  title,
  href,
  viewAllLabel,
}: {
  title: string;
  href: "/dastan" | "/jostar";
  viewAllLabel: string;
}) {
  return (
    <div className="flex items-baseline justify-between px-6 md:px-12 pt-10">
      <h2 className="text-[19px] font-bold text-ink">{title}</h2>
      <Link href={href} className="text-xs text-silver hover:text-smoke tracking-[0.08em]">
        {viewAllLabel}
      </Link>
    </div>
  );
}
