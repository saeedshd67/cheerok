/**
 * Renders a <script type="application/ld+json"> tag.
 * Must be a server component (no "use client") so the tag appears in
 * the initial HTML and is crawlable without JavaScript.
 *
 * Usage (in a server page or layout):
 *   import JsonLd from "@/components/JsonLd";
 *   import { jsonLdArticle } from "@/lib/seo";
 *
 *   <JsonLd data={jsonLdArticle({ ... })} />
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Next.js serializes this safely — no dangerouslySetInnerHTML needed
      // when the content is a plain object literal, but we use it here
      // explicitly so the intent is obvious to future maintainers.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
