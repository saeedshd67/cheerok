import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_CMS_MEDIA_HOST ?? "cms.cheerok.com",
      },
    ],
  },
  // Strapi entries publish/update -> webhook hits /api/revalidate -> on-demand ISR.
  // No fixed revalidate window needed at the page level because of that webhook,
  // but a long fallback is kept here in case a webhook delivery is ever missed.
  experimental: {
    staleTimes: { static: 3600 },
  },
};

export default withNextIntl(nextConfig);
