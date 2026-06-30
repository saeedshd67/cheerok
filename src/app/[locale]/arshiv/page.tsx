import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { searchArchive } from "@/lib/api";
import ArchiveClient from "@/components/ArchiveClient";

export const metadata: Metadata = { title: "آرشیو / Archive" };

export default async function ArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; year?: string }>;
}) {
  const { locale } = await params;
  const { type, year } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Archive");

  const result = await searchArchive({
    type: (type as any) ?? undefined,
    year: year ? Number(year) : undefined,
    pageSize: 50,
  });

  return (
    <main>
      <header className="px-6 md:px-12 pt-12 pb-8 border-b border-line">
        <h1 className="text-[32px] font-bold tracking-tight text-ink mb-2">{t("title")}</h1>
        <p className="text-[15px] text-smoke max-w-xl leading-[1.7]">{t("sub")}</p>
      </header>

      <ArchiveClient initialItems={result.data} locale={locale} />
    </main>
  );
}
