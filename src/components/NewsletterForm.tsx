"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function NewsletterForm() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="px-6 md:px-12 py-[72px] text-center border-t border-b border-line">
      <h2 className="text-2xl font-bold text-ink mb-[11px]">{t("newsletterTitle")}</h2>
      <p className="text-[15px] text-smoke leading-[1.7] mb-[34px] max-w-[360px] mx-auto">
        {t("newsletterSub")}
      </p>

      {state === "done" ? (
        <p className="text-sm text-ink-2 max-w-[400px] mx-auto">
          {locale === "fa"
            ? "ایمیلی برای تأیید برایتان ارسال شد."
            : "Check your inbox to confirm your subscription."}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-[400px] mx-auto">
          <button
            type="submit"
            disabled={state === "loading"}
            className="px-[22px] py-[13px] bg-ink text-white text-[13px] font-semibold tracking-wide hover:bg-ink-2 transition-colors disabled:opacity-60"
          >
            {t("newsletterCta")}
          </button>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletterPlaceholder")}
            className="flex-1 px-4 py-[13px] border border-line rtl:border-l-0 ltr:border-r-0 text-sm text-ink outline-none focus:border-silver placeholder:text-silver"
          />
        </form>
      )}
      {state === "error" && (
        <p className="text-xs text-ink mt-3">
          {locale === "fa" ? "مشکلی پیش آمد، دوباره تلاش کنید." : "Something went wrong — try again."}
        </p>
      )}
    </section>
  );
}
