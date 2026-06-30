import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getLatestPodcasts } from "@/lib/api";
import PodcastCard from "@/components/PodcastCard";
import SectionListing from "@/components/SectionListing";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = { title: "پادکست / Podcast" };

export default async function PodcastListingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const episodes = await getLatestPodcasts(20);

  return (
    <>
      <SectionListing titleKey="podcast" count={episodes.length} href="/podcast">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line">
          {episodes.map((ep) => <PodcastCard key={ep.id} episode={ep} />)}
        </div>
      </SectionListing>
      <NewsletterForm />
    </>
  );
}
