import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { AppPathnames } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

/**
 * Page shell reused by every section listing page (داستان, جستار, پادکست, گفت‌وگو).
 * Children render the actual cards — each section passes its own card component.
 */
export default function SectionListing({
  titleKey,
  count,
  href,
  children,
}: {
  titleKey: string;
  count: number;
  href: AppPathnames;
  children: ReactNode;
}) {
  const t = useTranslations();

  return (
    <main>
      <header className="px-6 md:px-12 pt-12 pb-8 border-b border-line">
        <h1 className="text-[32px] font-bold tracking-tight text-ink mb-2">
          {t(`Nav.${titleKey}`)}
        </h1>
        <p className="text-sm text-silver font-en">
          {t("Section.results", { count })}
        </p>
      </header>

      <div className="px-6 md:px-12 py-10">{children}</div>
    </main>
  );
}

/** Pagination bar — used by listing pages that paginate server-side. */
export function Pagination({
  page,
  pageCount,
  basePath,
}: {
  page: number;
  pageCount: number;
  basePath: AppPathnames;
}) {
  const t = useTranslations("Section");
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-10 border-t border-line-2">
      {page > 1 ? (
        <Link
          href={{ pathname: basePath, query: { page: page - 1 } } as any}
          className="text-sm text-smoke hover:text-ink"
        >
          ← {t("prev")}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-xs text-silver font-en">
        {t("page", { page, total: pageCount })}
      </span>
      {page < pageCount ? (
        <Link
          href={{ pathname: basePath, query: { page: page + 1 } } as any}
          className="text-sm text-smoke hover:text-ink"
        >
          {t("next")} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
