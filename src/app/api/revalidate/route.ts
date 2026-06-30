import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Strapi webhook target. Configure in Strapi admin under
 * Settings -> Webhooks, firing on entry.publish / entry.update for the
 * collection types listed below, POSTing here with a shared secret.
 *
 * Strapi's webhook payload shape: { event, model, entry: { id, slug, ... } }
 * We map `model` to the same cache tags used in lib/api.ts's strapiFetch
 * calls, so only the affected page(s) get revalidated -- not the whole site.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.CMS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { model, entry } = body as { model: string; entry: { slug?: string } };

  const tagsByModel: Record<string, (entry: { slug?: string }) => string[]> = {
    story: (e) => ["stories", "archive", ...(e.slug ? [`story:${e.slug}`] : [])],
    essay: (e) => ["essays", "archive", ...(e.slug ? [`essay:${e.slug}`] : [])],
    "podcast-episode": (e) => ["podcasts", "archive", ...(e.slug ? [`podcast:${e.slug}`] : [])],
    interview: (e) => ["interviews", "archive", ...(e.slug ? [`interview:${e.slug}`] : [])],
    author: (e) => [...(e.slug ? [`author:${e.slug}`] : [])],
  };

  const tags = tagsByModel[model]?.(entry) ?? [];
  tags.forEach((tag) => revalidateTag(tag));

  return NextResponse.json({ revalidated: tags });
}
