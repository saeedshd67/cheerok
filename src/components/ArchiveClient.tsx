"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ContentPiece } from "@/types/content";

type FilterType = "all" | "fiction" | "essay" | "podcast" | "interview";

const TYPE_PATHNAME: Record<string, string> = {
  fiction: "/dastan/[slug]",
  essay: "/jostar/[slug]",
  podcast: "/podcast/[slug]",
  interview: "/goftogoo/[slug]",
};

export default function ArchiveClient({
  initialItems,
  locale,
}: {
  initialItems: ContentPiece[];
  locale: string;
}) {
  const t = useTranslations("Section");
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<FilterType>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialItems.filter((item) => {
      if (activeType !== "all" && item.type !== activeType) return false;
      if (!q) return true;
      const hay = [
        item.titleFa, item.titleEn,
        item.author.nameFa, item.author.nameEn,
        item.excerptFa, item.excerptEn,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [initialItems, query, activeType]);

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "fiction", label: t("filterFiction") },
    { key: "essay", label: t("filterEssay") },
    { key: "podcast", label: t("filterPodcast") },
    { key: "interview", label: t("filterInterview") },
  ];

  return (
    <div className="px-6 md:px-12 py-8">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center border border-line bg-white h-[38px] px-3 flex-1 min-w-[200px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-silver shrink-0">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 border-none outline-none bg-transparent text-sm px-2 text-ink placeholder:text-silver"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveType(f.key)}
              className={[
                "px-4 py-2 text-[12.5px] border transition-colors",
                activeType === f.key
                  ? "bg-ink border-ink text-white"
                  : "bg-white border-line text-smoke hover:border-silver",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-[13px] text-silver mb-4">
        {t("results", { count: filtered.length })}
      </div>

      {/* Results list */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-silver text-sm">{t("noResults")}</div>
      ) : (
        <div className="divide-y divide-line-2">
          {filtered.map((item) => {
            const title = locale === "en" ? item.titleEn ?? item.titleFa : item.titleFa;
            const author = locale === "en" ? item.author.nameEn : item.author.nameFa;
            const excerpt = locale === "en" ? item.excerptEn ?? item.excerptFa : item.excerptFa;
            const year = item.publishedAt
              ? new Date(item.publishedAt).getFullYear()
              : null;
            const yearDisplay = year
              ? locale === "fa"
                ? toFarsiYear(year)
                : String(year)
              : null;

            return (
              <Link
                key={item.id}
                href={{ pathname: TYPE_PATHNAME[item.type] as any, params: { slug: item.slug } }}
                className="flex items-start gap-6 py-6 hover:bg-[#fafaf9] group"
              >
                <span className="font-en text-[13px] text-silver w-12 shrink-0 pt-1">
                  {yearDisplay}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-en text-[10px] tracking-[0.2em] uppercase text-silver block mb-2">
                    {item.type}
                  </span>
                  <span className="text-[17px] font-bold text-ink group-hover:underline underline-offset-[3px] block mb-1.5">
                    {title}
                  </span>
                  <span className="text-[13px] text-smoke block mb-1.5">{author}</span>
                  {excerpt && (
                    <span className="text-[13px] text-ink-2 leading-[1.65] line-clamp-2 block">
                      {excerpt}
                    </span>
                  )}
                </div>
                <span className="text-silver opacity-0 group-hover:opacity-100 transition-opacity pt-1 shrink-0" aria-hidden>
                  ←
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Rough Hijri-Shamsi year offset for display — accurate enough for recent years. */
function toFarsiYear(gregorianYear: number): string {
  const shamsi = gregorianYear - 621;
  return shamsi.toLocaleString("fa-IR", { useGrouping: false });
}
