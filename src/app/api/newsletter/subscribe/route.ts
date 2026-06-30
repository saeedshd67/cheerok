import { NextRequest, NextResponse } from "next/server";

const CMS_URL = process.env.CMS_URL ?? "http://localhost:1337";

/**
 * Thin proxy rather than calling Strapi directly from the browser, so the
 * CMS origin and any future rate-limiting/spam checks stay server-side.
 * Strapi side: creates a newsletter_subscribers row with
 * status='pending_confirmation' and emails a confirm_token link, per
 * cheerok-architecture.md §2/§4.
 */
export async function POST(req: NextRequest) {
  const { email, locale } = await req.json();

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const res = await fetch(`${CMS_URL}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { email, locale_preference: locale ?? "fa" } }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "subscribe_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
