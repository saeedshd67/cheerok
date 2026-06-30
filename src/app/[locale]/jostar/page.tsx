import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getLatestEssays } from "@/lib/api";
import StoryCard from "@/components/StoryCard";
import SectionListing, { Pagination } from "@/components/SectionListing";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = { title: "جستار / Essays" };

export default async function EssayListingPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageStr } = await searchParams;
  setRequestLocale(locale);
  const page = Math.max(1, Number(pageStr ?? "1"));
  const essays = await getLatestEssays(12);

  return (
    <>
      <SectionListing titleKey="essays" count={essays.length} href="/jostar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e2e1df] border border-line bg-surf">
          {essays.map((e) => (
            <StoryCard key={e.id} piece={e} />
          ))}
        </div>
        <Pagination page={page} pageCount={1} basePath="/jostar" />
      </SectionListing>
      <NewsletterForm />
    </>
  );
}
