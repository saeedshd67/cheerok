import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { title: "درباره ما / About" };

const TEAM = [
  { initial: "آ.م", nameFa: "آیدا مرادی", nameEn: "Aida Moradi", roleKey: "r1" },
  { initial: "ک.ن", nameFa: "کاوه نجفی", nameEn: "Kaveh Najafi", roleKey: "r2" },
  { initial: "ه.ا", nameFa: "هانیه اسدی", nameEn: "Hanieh Asadi", roleKey: "r3" },
  { initial: "ر.ف", nameFa: "رامین فتحی", nameEn: "Ramin Fathi", roleKey: "r4" },
] as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const PILLARS = [
    { num: "01", titleKey: "p1t", descKey: "p1d" },
    { num: "02", titleKey: "p2t", descKey: "p2d" },
    { num: "03", titleKey: "p3t", descKey: "p3d" },
    { num: "04", titleKey: "p4t", descKey: "p4d" },
  ] as const;

  return (
    <main>
      {/* Page hero */}
      <section className="px-6 md:px-12 pt-16 pb-14 border-b border-line text-center">
        <div className="max-w-[640px] mx-auto">
          <p className="text-xs tracking-[0.12em] uppercase text-silver mb-6">{t("tag")}</p>
          <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-ink mb-3">
            {t("title")}
          </h1>
          <p className="font-en text-xs text-silver tracking-[0.04em] mb-7">{t("founded")}</p>
          <p className="text-[16px] text-smoke leading-[1.8]">{t("intro")}</p>
        </div>
      </section>

      {/* Mission — dark band */}
      <section className="bg-ink text-white px-6 md:px-12 py-[72px]">
        <div className="max-w-[760px] mx-auto text-center">
          <p className="text-[24px] md:text-[28px] font-light leading-[1.65] text-[#EDEDEB]">
            {t("mission")}
          </p>
        </div>
      </section>

      {/* Pillars grid */}
      <section className="px-6 md:px-12 py-16 border-b border-line">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[19px] font-bold text-ink mb-10">{t("pillarsTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0">
            {PILLARS.map((p, i) => (
              <div
                key={p.num}
                className={[
                  "px-7 py-2",
                  i === 0 ? "" : "border-inline-start border-line-2",
                ].join(" ")}
              >
                <div className="font-en text-[11px] text-silver mb-4">{p.num}</div>
                <div className="text-[17px] font-bold text-ink mb-3">{t(p.titleKey)}</div>
                <p className="text-[13px] text-smoke leading-[1.75]">{t(p.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 md:px-12 py-16 border-b border-line">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[19px] font-bold text-ink mb-8">{t("teamTitle")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TEAM.map((m) => (
              <div key={m.initial} className="text-center">
                <div className="w-16 h-16 rounded-full bg-surf border border-line flex items-center justify-center text-[18px] font-semibold text-silver mx-auto mb-4">
                  {m.initial}
                </div>
                <div className="text-[15px] font-bold text-ink mb-1">
                  {locale === "en" ? m.nameEn : m.nameFa}
                </div>
                <div className="text-xs text-silver">{t(m.roleKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-16 bg-surf text-center">
        <h2 className="text-[22px] font-bold text-ink mb-3">{t("ctaTitle")}</h2>
        <p className="text-[14px] text-smoke leading-[1.7] mb-7 max-w-[420px] mx-auto">
          {t("ctaSub")}
        </p>
        <Link
          href="/ersal"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-ink text-white text-[13px] font-semibold tracking-wide hover:bg-ink-2 transition-colors"
        >
          {t("ctaBtn")}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="icon-flip" aria-hidden>
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
      </section>
    </main>
  );
}
