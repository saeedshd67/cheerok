"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_ITEMS = [
  { href: "/dastan", key: "fiction" },
  { href: "/jostar", key: "essays" },
  { href: "/podcast", key: "podcast" },
  { href: "/goftogoo", key: "interviews" },
  { href: "/arshiv", key: "archive" },
  { href: "/darbare", key: "about" },
  { href: "/ersal", key: "submit" },
] as const;

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="h-[62px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label={t("Brand.name")}>
            <CheerokMark />
            <span className="font-fa text-[22px] font-bold tracking-tight rtl:font-fa ltr:font-en ltr:text-[17px] ltr:tracking-[0.12em] ltr:font-semibold">
              {t("Brand.name")}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              aria-label="جستجو"
              className="w-9 h-9 flex items-center justify-center text-silver hover:text-ink transition-colors"
            >
              <SearchIcon />
            </button>
          </div>
        </div>

        <nav aria-label="Main" className="border-t border-line-2">
          <ul className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={[
                      "block px-[18px] py-[13px] text-sm whitespace-nowrap border-b-2 transition-colors",
                      isActive
                        ? "text-ink font-semibold border-ink"
                        : "text-smoke border-transparent hover:text-ink",
                    ].join(" ")}
                  >
                    {t(`Nav.${item.key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function CheerokMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="16" height="26" fill="#0F0F0F" />
      <rect x="14" y="2" width="14" height="12" fill="#0F0F0F" />
      <rect x="20" y="17" width="8" height="11" fill="#0F0F0F" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
