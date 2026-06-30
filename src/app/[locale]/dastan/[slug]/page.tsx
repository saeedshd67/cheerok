import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getStoryBySlug, getAllStorySlugs } from "@/lib/api";
import { buildAlternates, ogArticle, jsonLdArticle, jsonLdBreadcrumb, canonical } from "@/lib/seo";
import ArticleReader from "@/components/ArticleReader";
import JsonLd from "@/components/JsonLd";

interface PageProps { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllStorySlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return {};

  const title = locale === "en" ? story.titleEn ?? story.titleFa : story.titleFa;
  const description = locale === "en" ? story.excerptEn ?? story.excerptFa : story.excerptFa;
  const authorName = locale === "en" ? story.author.nameEn : story.author.nameFa;

  return {
    title,
    description,
    alternates: buildAlternates(locale, `/dastan/${slug}`, `/fiction/${slug}`),
    openGraph: ogArticle({
      title, description, locale,
      imageUrl: story.coverImageUrl,
      publishedAt: story.publishedAt,
      authorName,
    }),
    // /ersal gets noindex; story pages are always indexable (default from layout)
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  const title = locale === "en" ? story.titleEn ?? story.titleFa : story.titleFa;
  const authorName = locale === "en" ? story.author.nameEn : story.author.nameFa;
  const faPath = `/dastan/${slug}`;

  return (
    <>
      {/* Article JSON-LD */}
      <JsonLd data={jsonLdArticle({
        title,
        description: locale === "en" ? story.excerptEn ?? story.excerptFa : story.excerptFa,
        url: canonical(locale, locale === "en" ? `/fiction/${slug}` : faPath),
        imageUrl: story.coverImageUrl,
        publishedAt: story.publishedAt,
        authorName,
        authorUrl: canonical(locale, `/authors/${story.author.slug}`),
      })} />
      {/* Breadcrumb JSON-LD */}
      <JsonLd data={jsonLdBreadcrumb([
        { name: "چیروک", url: canonical("fa", "/") },
        { name: locale === "fa" ? "داستان" : "Fiction", url: canonical(locale, locale === "fa" ? "/dastan" : "/fiction") },
        { name: title, url: canonical(locale, locale === "fa" ? faPath : `/fiction/${slug}`) },
      ])} />
      <ArticleReader piece={story} sectionPathname="/dastan" />
    </>
  );
}
