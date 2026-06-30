"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const otherLocale: Locale = locale === "fa" ? "en" : "fa";

  function handleClick() {
    // usePathname() here returns the *internal* (untranslated) pathname
    // (e.g. "/dastan/[slug]" pattern resolved with real params), so
    // next-intl's router re-resolves it to the other locale's translated
    // path automatically -- this is what makes the switch instant instead
    // of a full navigation/reload.
    router.replace(
      // @ts-expect-error -- params shape varies per route, intentionally untyped here
      { pathname, params },
      { locale: otherLocale }
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="border border-line px-3.5 py-1 font-en text-[11px] font-medium tracking-[0.1em] text-smoke hover:border-silver hover:text-ink transition-colors"
      aria-label="Change language"
    >
      {otherLocale === "en" ? "EN" : "FA"}
    </button>
  );
}
