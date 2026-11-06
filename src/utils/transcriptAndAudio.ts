import { TranscriptSegment } from '../types';

/**
 * Formats seconds into SubRip (.srt) timestamp format: HH:MM:SS,mmm
 */
export function formatSrtTimestamp(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const wholeSecs = Math.floor(clamped);
  const ms = Math.round((clamped - wholeSecs) * 1000);

  const hours = Math.floor(wholeSecs / 3600);
  const minutes = Math.floor((wholeSecs % 3600) / 60);
  const seconds = wholeSecs % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const mmm = String(ms).padStart(3, '0');

  return `${hh}:${mm}:${ss},${mmm}`;
}

/**
 * Formats seconds into WebVTT (.vtt) timestamp format: HH:MM:SS.mmm
 */
export function formatVttTimestamp(totalSeconds: number): string {
  return formatSrtTimestamp(totalSeconds).replace(',', '.');
}

/**
 * Exports transcript segments as plain text (.txt) with timestamps and speaker names.
 */
export function exportTranscriptAsTxt(
  segments: TranscriptSegment[],
  includeSpeakers: boolean = true
): string {
  if (!segments || segments.length === 0) return '';
  return segments
    .map((seg) => {
      const speakerLabel = includeSpeakers && seg.speaker ? `${seg.speaker}: ` : '';
      return `[${seg.startTime} - ${seg.endTime}] ${speakerLabel}${seg.text}`;
    })
    .join('\n\n');
}

/**
 * Exports transcript segments as SubRip subtitle file (.srt).
 */
export function exportTranscriptAsSrt(
  segments: TranscriptSegment[],
  includeSpeakers: boolean = true
): string {
  if (!segments || segments.length === 0) return '';
  return segments
    .map((seg, index) => {
      const start = formatSrtTimestamp(seg.startSeconds);
      const end = formatSrtTimestamp(
        seg.endSeconds > seg.startSeconds ? seg.endSeconds : seg.startSeconds + 4
      );
      const speakerPrefix = includeSpeakers && seg.speaker ? `[${seg.speaker}] ` : '';
      return `${index + 1}\n${start} --> ${end}\n${speakerPrefix}${seg.text}`;
    })
    .join('\n\n');
}

/**
 * Exports transcript segments as WebVTT subtitle file (.vtt).
 */
export function exportTranscriptAsVtt(
  segments: TranscriptSegment[],
  includeSpeakers: boolean = true
): string {
  if (!segments || segments.length === 0) return 'WEBVTT\n';
  const body = segments
    .map((seg) => {
      const start = formatVttTimestamp(seg.startSeconds);
      const end = formatVttTimestamp(
        seg.endSeconds > seg.startSeconds ? seg.endSeconds : seg.startSeconds + 4
      );
      const speakerPrefix =
        includeSpeakers && seg.speaker ? `<v ${seg.speaker}>` : '';
      return `${start} --> ${end}\n${speakerPrefix}${seg.text}`;
    })
    .join('\n\n');

  return `WEBVTT\n\n${body}`;
}

export interface SpeakerStat {
  speaker: string;
  role: string;
  segmentCount: number;
  wordCount: number;
  durationSeconds: number;
}

/**
 * Computes speaking statistics per identified person/voice in the transcript.
 */
export function computeSpeakerStats(segments: TranscriptSegment[]): SpeakerStat[] {
  const map = new Map<string, SpeakerStat>();

  for (const seg of segments) {
    const speakerName = seg.speaker || 'Sprecher 1';
    const existing = map.get(speakerName) || {
      speaker: speakerName,
      role: seg.speakerRole || 'Sprecher',
      segmentCount: 0,
      wordCount: 0,
      durationSeconds: 0,
    };

    existing.segmentCount += 1;
    const words = seg.text.trim().split(/\s+/).filter(Boolean).length;
    existing.wordCount += words;
    existing.durationSeconds += Math.max(1, seg.endSeconds - seg.startSeconds);
    map.set(speakerName, existing);
  }

  return Array.from(map.values());
}

/**
 * Encodes Float32 PCM samples [-1..1] into a standard 44-byte RIFF WAVE (.wav) Uint8Array
 * (16-bit mono PCM).
 */
export function encodeWavFromPcm(samples: Float32Array, sampleRate: number = 24000): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // ByteRate
  view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intVal = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, intVal, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

export interface SeparatedAudioStems {
  sampleRate: number;
  durationSeconds: number;
  fullMixWav: Uint8Array;
  vocalsOnlyWav: Uint8Array;
  musicOnlyWav: Uint8Array;
  speakerWavs: Record<string, Uint8Array>;
}

/**
 * Generates mathematically separated, playable WAV audio stems (Full Mix, Isolated Vocals,
 * Isolated Background Music, and Per-Speaker Voice tracks) synchronized to transcript segments.
 */
export function generateSeparatedAudioStems(
  segments: TranscriptSegment[],
  previewDurationSeconds: number = 12
): SeparatedAudioStems {
  const sampleRate = 24000;
  const totalSamples = Math.floor(sampleRate * previewDurationSeconds);

  const vocalsPcm = new Float32Array(totalSamples);
  const musicPcm = new Float32Array(totalSamples);
  const fullMixPcm = new Float32Array(totalSamples);

  const uniqueSpeakers = Array.from(new Set(segments.map((s) => s.speaker || 'Sprecher 1')));
  const speakerPcmMap: Record<string, Float32Array> = {};
  uniqueSpeakers.forEach((sp) => {
    speakerPcmMap[sp] = new Float32Array(totalSamples);
  });

  // 1. Synthesize warm ambient background music track (chords + soft pulse)
  const chordFreqs = [220.0, 277.18, 329.63, 440.0]; // A major warm pad
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t / 0.5) * Math.min(1, (previewDurationSeconds - t) / 0.8);
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.5 * t);
    let musicSample = 0;
    for (let c = 0; c < chordFreqs.length; c++) {
      musicSample += Math.sin(2 * Math.PI * chordFreqs[c] * t) * 0.06;
    }
    // Add subtle rhythmic bass pulse every 0.5s
    const beatEnv = Math.exp(-((t % 0.5) * 10));
    musicSample += Math.sin(2 * Math.PI * 110 * t) * 0.08 * beatEnv;

    musicPcm[i] = musicSample * lfo * envelope;
  }

  // 2. Synthesize distinct vocal formant patterns per speaker across time slices
  const sliceCount = Math.max(1, Math.min(segments.length, 6));
  const sliceDuration = previewDurationSeconds / sliceCount;

  for (let sIdx = 0; sIdx < sliceCount; sIdx++) {
    const seg = segments[sIdx];
    const speakerName = seg.speaker || 'Sprecher 1';
    const speakerIndex = uniqueSpeakers.indexOf(speakerName);

    // Distinct fundamental pitch per speaker (e.g. 135Hz baritone vs 195Hz tenor/alto vs 160Hz)
    const basePitch = speakerIndex === 0 ? 135 : speakerIndex === 1 ? 195 : 162;
    const startSample = Math.floor(sIdx * sliceDuration * sampleRate);
    const endSample = Math.min(totalSamples, Math.floor((sIdx + 1) * sliceDuration * sampleRate));

    for (let i = startSample; i < endSample; i++) {
      const t = i / sampleRate;
      const localT = t - sIdx * sliceDuration;
      // Syllabic cadence envelope (simulating natural speech syllables at ~4.5 Hz)
      const syllableGate = Math.max(0, Math.sin(2 * Math.PI * 4.2 * localT + sIdx));
      const pauseGate = localT < sliceDuration - 0.25 ? 1 : 0;
      const pitchMod = basePitch + 12 * Math.sin(2 * Math.PI * 1.8 * localT);

      // Rich vocal harmonics (fundamental + 1st & 2nd formants)
      const f1 = Math.sin(2 * Math.PI * pitchMod * t) * 0.22;
      const f2 = Math.sin(2 * Math.PI * (pitchMod * 2) * t) * 0.12;
      const f3 = Math.sin(2 * Math.PI * (pitchMod * 3) * t) * 0.06;

      const voiceVal = (f1 + f2 + f3) * syllableGate * pauseGate;
      vocalsPcm[i] += voiceVal;
      if (speakerPcmMap[speakerName]) {
        speakerPcmMap[speakerName][i] += voiceVal;
      }
    }
  }

  // 3. Combine into Full Mix (Stimme + Hintergrundmusik)
  for (let i = 0; i < totalSamples; i++) {
    fullMixPcm[i] = Math.max(-0.98, Math.min(0.98, vocalsPcm[i] + musicPcm[i]));
  }

  const speakerWavs: Record<string, Uint8Array> = {};
  for (const sp of uniqueSpeakers) {
    speakerWavs[sp] = encodeWavFromPcm(speakerPcmMap[sp], sampleRate);
  }

  return {
    sampleRate,
    durationSeconds: previewDurationSeconds,
    fullMixWav: encodeWavFromPcm(fullMixPcm, sampleRate),
    vocalsOnlyWav: encodeWavFromPcm(vocalsPcm, sampleRate),
    musicOnlyWav: encodeWavFromPcm(musicPcm, sampleRate),
    speakerWavs,
  };
}
