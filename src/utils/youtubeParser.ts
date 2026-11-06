/**
 * YouTube URL & Timestamp Parsing Utilities
 */

export interface ChapterItem {
  timestamp: string;
  seconds: number;
  phase: string;
  title: string;
  duration?: string;
  purpose?: string;
  retentionImpact?: string;
  visualElement?: string;
}

/**
 * Extracts the 11-character YouTube video ID from various link formats or raw ID.
 */
export function extractYouTubeVideoId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Handle youtube.com/watch?v=<id>
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Handle youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // Handle youtube.com/embed/<id>
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Handle youtube.com/live/<id>
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  return null;
}

/**
 * Formats seconds into MM:SS or H:MM:SS format.
 */
export function formatSecondsToTimestamp(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}

/**
 * Parses timestamp string (MM:SS or H:MM:SS) into total seconds.
 */
export function parseTimestampToSeconds(timestamp: string): number {
  if (!timestamp || typeof timestamp !== 'string') return 0;
  const parts = timestamp.trim().split(':').map((p) => parseInt(p, 10));

  if (parts.some((n) => isNaN(n))) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return 0;
}

/**
 * Builds formatted YouTube-ready video description matching the user's reference format.
 */
export function generateYouTubeDescription(
  introText: string,
  chapters: ChapterItem[],
  resources?: string[]
): string {
  const chapterLines = chapters
    .map((ch) => `${ch.timestamp} ${ch.title}`)
    .join('\n');

  let text = `${introText.trim()}\n\nKapitel:\n${chapterLines}`;

  if (resources && resources.length > 0) {
    text += `\n\nQuellen & Downloads:\n${resources.map((r) => `• ${r}`).join('\n')}`;
  }

  return text;
}

/**
 * Calculates pacing metrics for a set of video chapters.
 */
export function calculatePacingMetrics(chapters: ChapterItem[]) {
  if (!chapters || chapters.length === 0) {
    return {
      avgChapterSeconds: 0,
      chapterCount: 0,
      pacingRating: 'Keine Kapitel',
    };
  }

  let totalSeconds = 0;
  for (let i = 0; i < chapters.length; i++) {
    const current = chapters[i].seconds;
    const next = i + 1 < chapters.length ? chapters[i + 1].seconds : current + 60;
    totalSeconds += Math.max(10, next - current);
  }

  const avgChapterSeconds = Math.round(totalSeconds / chapters.length);
  let pacingRating = 'Optimal (Sehr kurzweilig)';
  if (avgChapterSeconds > 180) {
    pacingRating = 'Ausführlich / Tiefgründig';
  } else if (avgChapterSeconds < 30) {
    pacingRating = 'Ultra-Schnell (Shorts-Stil)';
  }

  return {
    avgChapterSeconds,
    chapterCount: chapters.length,
    pacingRating,
  };
}
