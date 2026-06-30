import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getLatestStories } from "@/lib/api";
import StoryCard from "@/components/StoryCard";
import SectionListing, { Pagination } from "@/components/SectionListing";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = { title: "داستان / Fiction" };

export default async function FictionListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageStr } = await searchParams;
  setRequestLocale(locale);

  const page = Math.max(1, Number(pageStr ?? "1"));
  const pageSize = 12;
  const stories = await getLatestStories(pageSize);

  return (
    <>
      <SectionListing titleKey="fiction" count={stories.length} href="/dastan">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
          {stories.map((s) => (
            <StoryCard key={s.id} piece={s} />
          ))}
        </div>
        <Pagination page={page} pageCount={1} basePath="/dastan" />
      </SectionListing>
      <NewsletterForm />
    </>
  );
}
