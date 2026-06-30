import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import SubmitForm from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "ارسال اثر / Submit",
  // Submission page should not be indexed — it has no content value for search
  robots: { index: false, follow: false },
};

export default async function SubmitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Submit");

  const guide = [
    { label: t("g1l"), value: t("g1v") },
    { label: t("g2l"), value: t("g2v") },
    { label: t("g3l"), value: t("g3v") },
  ];

  return (
    <main>
      <div className="max-w-[680px] mx-auto px-6 md:px-12 pt-14">
        <h1 className="text-[34px] font-bold tracking-tight text-ink mb-4">{t("title")}</h1>
        <p className="text-[16px] text-smoke leading-[1.8] mb-8">{t("intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 bg-surf p-7 mb-12">
          {guide.map((g) => (
            <div key={g.label}>
              <div className="font-en text-[10px] tracking-[0.14em] uppercase text-silver mb-2">{g.label}</div>
              <div className="text-[14px] font-semibold text-ink leading-snug">{g.value}</div>
            </div>
          ))}
        </div>
        <SubmitForm locale={locale} />
      </div>
    </main>
  );
}
