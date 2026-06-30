"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";

export default function AudioStrip({
  audioUrl,
  spotifyUrl,
  applePodcastsUrl,
}: {
  audioUrl: string;
  spotifyUrl?: string;
  applePodcastsUrl?: string;
}) {
  const t = useTranslations("Section");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); } else { el.play(); }
    setPlaying(!playing);
  }

  function onTimeUpdate() {
    const el = audioRef.current;
    if (!el) return;
    setCurrentTime(fmt(el.currentTime));
    setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
  }

  function onLoadedMetadata() {
    const el = audioRef.current;
    if (el) setDuration(fmt(el.duration));
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * el.duration;
  }

  return (
    <div className="flex items-center gap-4 p-5 bg-surf mb-8 flex-wrap">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={togglePlay}
        className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center hover:bg-ink-2 transition-colors shrink-0"
        aria-label={playing ? "توقف" : "پخش"}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-[140px]">
        <div
          className="h-[3px] bg-line cursor-pointer"
          onClick={seek}
          role="slider"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-ink" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between font-en text-[11px] text-silver mt-1.5">
          <span>{currentTime}</span><span>{duration}</span>
        </div>
      </div>

      {(spotifyUrl || applePodcastsUrl) && (
        <div className="flex gap-2 shrink-0">
          {spotifyUrl && (
            <a href={spotifyUrl} target="_blank" rel="noreferrer"
               className="border border-line px-3 py-1.5 text-[11px] text-smoke hover:border-ink hover:text-ink transition-colors font-en">
              Spotify
            </a>
          )}
          {applePodcastsUrl && (
            <a href={applePodcastsUrl} target="_blank" rel="noreferrer"
               className="border border-line px-3 py-1.5 text-[11px] text-smoke hover:border-ink hover:text-ink transition-colors font-en">
              Apple
            </a>
          )}
        </div>
      )}
    </div>
  );
}
