import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const SECTION_LINKS = [
  { href: "/dastan", key: "fiction" },
  { href: "/jostar", key: "essays" },
  { href: "/podcast", key: "podcast" },
  { href: "/goftogoo", key: "interviews" },
  { href: "/arshiv", key: "archive" },
] as const;

const MAGAZINE_LINKS = [
  { href: "/darbare", key: "about" },
  { href: "/ersal", key: "submit" },
] as const;

type FooterLink = (typeof SECTION_LINKS)[number] | (typeof MAGAZINE_LINKS)[number];

const SOCIAL_LINKS = [
  { label: "اینستاگرام", labelEn: "Instagram", href: "#" },
  { label: "توییتر / X", labelEn: "X", href: "#" },
  { label: "تلگرام", labelEn: "Telegram", href: "#" },
  { label: "اسپاتیفای", labelEn: "Spotify", href: "#" },
];

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-ink text-white px-6 md:px-12 pt-[60px] pb-9">
      <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
        <div className="col-span-2 md:col-span-1">
          <span className="text-lg font-bold block mb-3.5">{t("Brand.name")}</span>
          <p className="text-[13px] text-[#666] leading-[1.8] max-w-[230px]">
            {t("Brand.tagline")}
          </p>
        </div>

        <FooterColumn titleKey="Footer.sections" items={SECTION_LINKS} />
        <FooterColumn titleKey="Footer.magazine" items={MAGAZINE_LINKS} />

        <div>
          <div className="font-en text-[10px] tracking-[0.2em] uppercase text-[#444] mb-[18px]">
            {t("Footer.follow")}
          </div>
          <ul className="list-none">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.labelEn} className="mb-[11px]">
                <a href={s.href} className="text-[13px] text-[#777] hover:text-white transition-colors">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto flex items-center justify-between pt-[22px] border-t border-[#1e1e1e] font-en text-[11px] text-[#444] tracking-[0.04em]">
        <span>
          © {new Date().getFullYear()} {t("Brand.name")}. {t("Footer.rights")}
        </span>
        <span>CHEEROK Literary Magazine</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  titleKey,
  items,
}: {
  titleKey: string;
  items: readonly FooterLink[];
}) {
  const t = useTranslations();
  return (
    <div>
      <div className="font-en text-[10px] tracking-[0.2em] uppercase text-[#444] mb-[18px]">
        {t(titleKey)}
      </div>
      <ul className="list-none">
        {items.map((item) => (
          <li key={item.key} className="mb-[11px]">
            <Link
              href={item.href}
              className="text-[13px] text-[#777] hover:text-white transition-colors"
            >
              {t(`Nav.${item.key}`)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
