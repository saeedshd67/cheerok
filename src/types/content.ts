/**
 * Mirrors the schema in cheerok-architecture.md §2/§3.
 * Field pairs (titleFa/titleEn) reflect how data looks once pulled out of
 * Strapi's i18n-linked locale entries and normalized into one object —
 * see lib/api.ts for that normalization step.
 */

export type ContentType = "fiction" | "essay" | "podcast" | "interview";
export type ContentStatus =
  | "draft"
  | "in_review"
  | "scheduled"
  | "published"
  | "archived";

export interface Author {
  slug: string;
  nameFa: string;
  nameEn: string;
  taglineFa?: string;
  taglineEn?: string;
  bioFa?: string;
  bioEn?: string;
  photoUrl?: string;
  socialLinks: Record<string, string>;
}

export interface Tag {
  slug: string;
  labelFa: string;
  labelEn?: string;
  kind: "genre" | "theme" | "keyword";
}

export interface ContentPieceBase {
  id: string;
  type: ContentType;
  slug: string;
  titleFa: string;
  titleEn?: string;
  dekFa?: string;
  dekEn?: string;
  excerptFa?: string;
  excerptEn?: string;
  coverImageUrl?: string;
  readingTimeMinutes?: number;
  status: ContentStatus;
  author: Author;
  publishedAt?: string;
  tags: Tag[];
}

export interface StoryOrEssay extends ContentPieceBase {
  type: "fiction" | "essay";
  bodyFa: string;
  bodyEn?: string;
}

export interface PodcastEpisode extends ContentPieceBase {
  type: "podcast";
  episodeNumber?: number;
  audioUrl: string;
  durationSeconds?: number;
  spotifyUrl?: string;
  applePodcastsUrl?: string;
  transcriptFa?: string;
  transcriptEn?: string;
  showNotesFa?: string;
  showNotesEn?: string;
}

export interface InterviewQaItem {
  questionFa: string;
  questionEn?: string;
  answerFa: string;
  answerEn?: string;
}

export interface Interview extends ContentPieceBase {
  type: "interview";
  intervieweeNameFa: string;
  intervieweeNameEn?: string;
  intervieweeBioFa?: string;
  intervieweeBioEn?: string;
  intervieweePhotoUrl?: string;
  audioUrl?: string;
  qaItems: InterviewQaItem[];
}

export type ContentPiece = StoryOrEssay | PodcastEpisode | Interview;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}
