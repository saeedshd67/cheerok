import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getEssayBySlug, getAllEssaySlugs } from "@/lib/api";
import { buildAlternates, ogArticle, jsonLdArticle, jsonLdBreadcrumb, canonical } from "@/lib/seo";
import ArticleReader from "@/components/ArticleReader";
import JsonLd from "@/components/JsonLd";

interface PageProps { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllEssaySlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const essay = await getEssayBySlug(slug);
  if (!essay) return {};
  const title = locale === "en" ? essay.titleEn ?? essay.titleFa : essay.titleFa;
  const description = locale === "en" ? essay.excerptEn ?? essay.excerptFa : essay.excerptFa;
  const authorName = locale === "en" ? essay.author.nameEn : essay.author.nameFa;
  return {
    title, description,
    alternates: buildAlternates(locale, `/jostar/${slug}`, `/essays/${slug}`),
    openGraph: ogArticle({ title, description, locale, imageUrl: essay.coverImageUrl, publishedAt: essay.publishedAt, authorName }),
  };
}

export default async function EssayPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const essay = await getEssayBySlug(slug);
  if (!essay) notFound();
  const title = locale === "en" ? essay.titleEn ?? essay.titleFa : essay.titleFa;
  const authorName = locale === "en" ? essay.author.nameEn : essay.author.nameFa;
  return (
    <>
      <JsonLd data={jsonLdArticle({ title, url: canonical(locale, locale === "fa" ? `/jostar/${slug}` : `/essays/${slug}`), imageUrl: essay.coverImageUrl, publishedAt: essay.publishedAt, authorName })} />
      <JsonLd data={jsonLdBreadcrumb([
        { name: "چیروک", url: canonical("fa", "/") },
        { name: locale === "fa" ? "جستار" : "Essays", url: canonical(locale, locale === "fa" ? "/jostar" : "/essays") },
        { name: title, url: canonical(locale, locale === "fa" ? `/jostar/${slug}` : `/essays/${slug}`) },
      ])} />
      <ArticleReader piece={essay} sectionPathname="/jostar" />
    </>
  );
}
