import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getLatestInterviews } from "@/lib/api";
import StoryCard from "@/components/StoryCard";
import SectionListing from "@/components/SectionListing";
import NewsletterForm from "@/components/NewsletterForm";

export const metadata: Metadata = { title: "گفت‌وگو / Interviews" };

export default async function InterviewListingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const interviews = await getLatestInterviews(12);

  return (
    <>
      <SectionListing titleKey="interviews" count={interviews.length} href="/goftogoo">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line border border-line">
          {interviews.map((iv) => (
            // Interviews share the same card shape as stories/essays;
            // interviewee name is stored in a different field but the
            // StoryCard's author display still picks up the primary author.
            <StoryCard key={iv.id} piece={{ ...iv, type: "fiction" } as any} />
          ))}
        </div>
      </SectionListing>
      <NewsletterForm />
    </>
  );
}
