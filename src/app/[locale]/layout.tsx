import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { canonical, ogWebsite, jsonLdWebSite } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import "../globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://cheerok.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("Brand");
  const og = ogWebsite(locale);

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t("name"),
      template: `%s — ${t("name")}`,
    },
    description: t("tagline"),

    // Canonical & hreflang — individual pages override these via their own
    // generateMetadata using buildAlternates() from lib/seo.ts
    alternates: {
      canonical: canonical(locale, "/"),
      languages: {
        fa: canonical("fa", "/"),
        en: canonical("en", "/"),
        "x-default": canonical("fa", "/"),
      },
    },

    // Open Graph
    openGraph: {
      ...og,
      title: t("name"),
      description: t("tagline"),
      url: canonical(locale, "/"),
    },

    // Twitter / X card
    twitter: {
      card: "summary_large_image",
      site: "@cheerok",
      title: t("name"),
      description: t("tagline"),
    },

    // Robots — all pages are indexable by default; individual pages
    // (e.g. /ersal, /admin) can override with { robots: "noindex" }
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },

    // Verification tokens go here once the site is live
    // verification: { google: "...", yandex: "..." },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <head>
        {/* Global WebSite schema — sitelinks search box in Google */}
        <JsonLd data={jsonLdWebSite()} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={dir === "rtl" ? "font-fa" : "font-en"}>
        <NextIntlClientProvider>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
