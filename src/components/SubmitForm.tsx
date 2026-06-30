"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { createSubmission } from "@/lib/api";

type FieldId = "name" | "email" | "bio" | "genre" | "title" | "file";

export default function SubmitForm({ locale }: { locale: string }) {
  const t = useTranslations("Submit");

  const [values, setValues] = useState({ name: "", email: "", bio: "", genre: "", title: "", cover: "" });
  const [errors, setErrors] = useState<Partial<Record<FieldId, string>>>({});
  const [file, setFile] = useState<File | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [refNum, setRefNum] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (field === "bio") {
        const words = e.target.value.trim() === "" ? 0 : e.target.value.trim().split(/\s+/).length;
        setWordCount(words);
      }
      setErrors((er) => ({ ...er, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const e: Partial<Record<FieldId, string>> = {};
    if (!values.name.trim()) e.name = t("required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = t("errEmail");
    if (!values.bio.trim()) e.bio = t("required");
    if (!values.genre) e.genre = t("errGenre");
    if (!values.title.trim()) e.title = t("required");
    if (!file) e.file = t("errFile");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      const firstErr = (["name", "email", "bio", "genre", "title", "file"] as FieldId[]).find(
        (f) => errors[f]
      );
      if (firstErr) {
        document.getElementById(`field-${firstErr}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setState("loading");
    try {
      // In production: upload the file to Strapi's media library first,
      // then pass the resulting URL here. For now we pass a placeholder
      // so the form flow is demonstrable without a real Strapi instance.
      const { referenceNumber } = await createSubmission({
        name: values.name,
        email: values.email,
        bio: values.bio,
        genre: values.genre,
        title: values.title,
        coverLetter: values.cover,
        fileUrl: `pending-upload/${file!.name}`,
      });
      setRefNum(referenceNumber);
      setState("done");
    } catch {
      setState("error");
    }
  }

  function reset() {
    setValues({ name: "", email: "", bio: "", genre: "", title: "", cover: "" });
    setErrors({});
    setFile(null);
    setWordCount(0);
    setState("idle");
    setRefNum("");
  }

  if (state === "done") {
    return (
      <div className="text-center pb-20">
        <div className="w-14 h-14 rounded-full border-[1.5px] border-ink flex items-center justify-center mx-auto mb-7">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="text-[22px] font-bold text-ink mb-3">{t("successTitle")}</h2>
        <p className="text-[14px] text-smoke mb-8 max-w-[380px] mx-auto leading-[1.7]">{t("successSub")}</p>
        <div className="border border-line p-6 text-start mb-7 max-w-[380px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="font-en text-[10px] tracking-[0.1em] uppercase text-silver">{t("refLabel")}</span>
            <span className="font-en text-[14px] font-semibold text-ink">{refNum}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-en text-[10px] tracking-[0.1em] uppercase text-silver">{t("statusLabel")}</span>
            <span className="border border-ink px-3 py-1 text-xs font-semibold text-ink">{t("statusPending")}</span>
          </div>
        </div>
        <p className="text-[13px] text-smoke mb-8 max-w-[380px] mx-auto">{t("successNote")}</p>
        <button onClick={reset} className="text-[13px] font-semibold text-ink border-b border-ink pb-0.5">
          {t("again")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="pb-20 space-y-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="field-name">
        <Field id="field-name" label={t("name")} required error={errors.name}>
          <input type="text" value={values.name} onChange={set("name")}
            className={input(!!errors.name)} />
        </Field>
        <Field id="field-email" label={t("email")} required error={errors.email}>
          <input type="email" value={values.email} onChange={set("email")}
            className={input(!!errors.email)} />
        </Field>
      </div>

      <Field id="field-bio" label={t("bio")} required error={errors.bio}>
        <textarea value={values.bio} onChange={set("bio")} rows={3}
          className={`${input(!!errors.bio)} resize-y min-h-[80px]`} />
        <div className="flex justify-between mt-1.5">
          <ErrorMsg msg={errors.bio} />
          <span className="font-en text-[11px] text-silver">{wordCount}{t("wordsOf")}</span>
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field id="field-genre" label={t("genre")} required error={errors.genre}>
          <select value={values.genre} onChange={set("genre")} className={`${input(!!errors.genre)} cursor-pointer`}>
            <option value="">{t("genreDefault")}</option>
            <option value="fiction">{t("genreFiction")}</option>
            <option value="essay">{t("genreEssay")}</option>
            <option value="other">{t("genreOther")}</option>
          </select>
        </Field>
        <Field id="field-title" label={t("workTitle")} required error={errors.title}>
          <input type="text" value={values.title} onChange={set("title")}
            className={input(!!errors.title)} />
        </Field>
      </div>

      <Field id="field-file" label={t("file")} required error={errors.file}>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx"
          className="sr-only" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setErrors((er) => ({ ...er, file: undefined })); }} />
        {file ? (
          <div className="flex items-center justify-between border border-line p-4">
            <div className="flex items-center gap-2.5 text-[13px] text-ink-2 min-w-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span className="truncate">{file.name} · {(file.size / 1024).toFixed(0)} KB</span>
            </div>
            <button type="button" onClick={() => setFile(null)}
              className="text-silver hover:text-ink text-xl leading-none px-1">×</button>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full border-[1.5px] border-dashed border-line hover:border-silver hover:bg-surf transition-colors py-8 text-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-silver"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span className="text-[14px] text-ink-2">{t("fileDrop")}</span>
            <span className="block text-xs text-silver mt-1">{t("fileHint")}</span>
          </button>
        )}
        <ErrorMsg msg={errors.file} />
      </Field>

      <Field id="field-cover" label={t("coverLetter")}>
        <textarea value={values.cover} onChange={set("cover")} rows={4}
          className={input(false)} />
        <p className="text-xs text-silver mt-1.5">{t("coverHint")}</p>
      </Field>

      {state === "error" && (
        <p className="text-sm text-ink font-semibold">
          {locale === "fa" ? "مشکلی پیش آمد. دوباره تلاش کنید." : "Something went wrong. Please try again."}
        </p>
      )}

      <button type="submit" disabled={state === "loading"}
        className="w-full py-4 bg-ink text-white text-[14px] font-semibold tracking-wide hover:bg-ink-2 transition-colors disabled:opacity-60">
        {state === "loading"
          ? (locale === "fa" ? "در حال ارسال…" : "Submitting…")
          : t("submit")}
      </button>
    </form>
  );
}

function Field({ id, label, required, error, children }: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div id={id} className="flex flex-col gap-2.5">
      <label className="text-[13px] font-semibold text-ink">
        {label}
        {required && <span className="text-silver font-normal"> *</span>}
      </label>
      {children}
      {error && <ErrorMsg msg={error} />}
    </div>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16.5" r="0.5" fill="currentColor"/></svg>
      {msg}
    </p>
  );
}

function input(hasError: boolean) {
  return [
    "w-full border px-3.5 py-3 text-[14px] text-ink outline-none bg-white transition-colors",
    hasError ? "border-ink border-[1.5px]" : "border-line focus:border-silver",
  ].join(" ");
}
