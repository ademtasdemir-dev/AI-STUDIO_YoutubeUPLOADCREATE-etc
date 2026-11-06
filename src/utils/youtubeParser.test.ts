import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeVideoId,
  formatSecondsToTimestamp,
  parseTimestampToSeconds,
  generateYouTubeDescription,
  calculatePacingMetrics,
  validateUploadMetadata,
  buildMarkdownReport,
} from './youtubeParser';
import {
  formatSrtTimestamp,
  formatVttTimestamp,
  exportTranscriptAsTxt,
  exportTranscriptAsSrt,
  exportTranscriptAsVtt,
  computeSpeakerStats,
  generateSeparatedAudioStems,
} from './transcriptAndAudio';
import { SAMPLE_VIDEOS } from '../constants';

test('extractYouTubeVideoId handles various URL formats', () => {
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&feature=shared'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?si=abcdef12345'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );
  assert.equal(extractYouTubeVideoId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeVideoId(''), null);
  assert.equal(extractYouTubeVideoId('not-a-youtube-url'), null);
});

test('formatSecondsToTimestamp formats correctly', () => {
  assert.equal(formatSecondsToTimestamp(0), '0:00');
  assert.equal(formatSecondsToTimestamp(38), '0:38');
  assert.equal(formatSecondsToTimestamp(73), '1:13');
  assert.equal(formatSecondsToTimestamp(3665), '1:01:05');
});

test('parseTimestampToSeconds parses MM:SS and H:MM:SS', () => {
  assert.equal(parseTimestampToSeconds('0:00'), 0);
  assert.equal(parseTimestampToSeconds('0:38'), 38);
  assert.equal(parseTimestampToSeconds('1:13'), 73);
  assert.equal(parseTimestampToSeconds('1:01:05'), 3665);
  assert.equal(parseTimestampToSeconds('invalid'), 0);
});

test('generateYouTubeDescription produces properly structured chapter text', () => {
  const intro = 'IT-Infrastruktur für ein Architekturbüro.';
  const chapters = [
    { timestamp: '0:00', seconds: 0, phase: 'Hook', title: 'Port- und Bandbreitenplanung' },
    { timestamp: '0:38', seconds: 38, phase: 'VLAN', title: 'IP-Konzept und VLANs' },
  ];
  const desc = generateYouTubeDescription(intro, chapters, ['PDF-Netzplan herunterladen']);

  assert.ok(desc.includes('Kapitel:'));
  assert.ok(desc.includes('0:00 Port- und Bandbreitenplanung'));
  assert.ok(desc.includes('0:38 IP-Konzept und VLANs'));
  assert.ok(desc.includes('PDF-Netzplan herunterladen'));
});

test('calculatePacingMetrics returns correct metrics', () => {
  const chapters = [
    { timestamp: '0:00', seconds: 0, phase: 'Hook', title: 'Intro' },
    { timestamp: '0:40', seconds: 40, phase: 'Point 1', title: 'Step 1' },
    { timestamp: '1:20', seconds: 80, phase: 'Point 2', title: 'Step 2' },
  ];
  const pacing = calculatePacingMetrics(chapters);
  assert.equal(pacing.chapterCount, 3);
  assert.ok(pacing.avgChapterSeconds > 0);
  assert.ok(typeof pacing.pacingRating === 'string');
});

test('validateUploadMetadata validates valid and invalid inputs accurately', () => {
  const validRes = validateUploadMetadata({
    title: 'Netzwerk & Backup im Architekturbüro',
    description: 'Intro\n\nKapitel:\n0:00 Start\n0:38 Teil 2\n1:13 Teil 3',
    tags: 'Netzwerk, VLAN, Backup',
  });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.errors.length, 0);
  assert.equal(validRes.warnings.length, 0);

  const invalidRes = validateUploadMetadata({
    title: '',
    description: 'Keine Zeitstempel',
    tags: 'a'.repeat(505),
  });
  assert.equal(invalidRes.valid, false);
  assert.equal(invalidRes.errors.length, 2);
  assert.ok(invalidRes.warnings.length >= 1);
});

test('buildMarkdownReport contains all sections and chapters', () => {
  const md = buildMarkdownReport(SAMPLE_VIDEOS[0].data);
  assert.ok(md.includes('# YouTube Video-Strukturplan & Analyse:'));
  assert.ok(md.includes('## 1. Inhaltliche Zusammenfassung'));
  assert.ok(md.includes('## 2. Detaillierter Strukturplan'));
  assert.ok(md.includes('0:00 | Hook & Problemstellung | Port- und Bandbreitenplanung'));
  assert.ok(md.includes('## 3. Darstellungs- & Regie-Analyse'));
  assert.ok(md.includes('## 4. Dramaturgie & Hook'));
  assert.ok(md.includes('## 5. YouTube-Upload-Beschreibung'));
});

test('subtitle and transcript exporters produce valid TXT, SRT, and VTT with speakers', () => {
  const segments = SAMPLE_VIDEOS[0].data.transcript || [];
  assert.ok(segments.length >= 3);

  assert.equal(formatSrtTimestamp(0), '00:00:00,000');
  assert.equal(formatSrtTimestamp(73.5), '00:01:13,500');
  assert.equal(formatVttTimestamp(73.5), '00:01:13.500');

  const txt = exportTranscriptAsTxt(segments, true);
  assert.ok(txt.includes('[0:00 - 0:19] Thomas Weber (Host & IT-Architekt):'));
  assert.ok(txt.includes('Julia Albrecht (Büroleitung Architektur):'));

  const srt = exportTranscriptAsSrt(segments, true);
  assert.ok(srt.includes('1\n00:00:00,000 --> 00:00:19,000\n[Thomas Weber (Host & IT-Architekt)]'));

  const vtt = exportTranscriptAsVtt(segments, true);
  assert.ok(vtt.startsWith('WEBVTT'));
  assert.ok(vtt.includes('00:00:00.000 --> 00:00:19.000'));
  assert.ok(vtt.includes('<v Thomas Weber (Host & IT-Architekt)>'));
});

test('computeSpeakerStats and generateSeparatedAudioStems produce valid speaker counts and RIFF WAVE files', () => {
  const segments = SAMPLE_VIDEOS[0].data.transcript || [];
  const stats = computeSpeakerStats(segments);
  assert.equal(stats.length, 3);
  assert.ok(stats[0].wordCount > 10);

  const stems = generateSeparatedAudioStems(segments, 2);
  // Check 44-byte RIFF WAVE header ('RIFF' at 0..3 and 'WAVE' at 8..11)
  const checkRiffHeader = (wav: Uint8Array) => {
    const riff = String.fromCharCode(wav[0], wav[1], wav[2], wav[3]);
    const wave = String.fromCharCode(wav[8], wav[9], wav[10], wav[11]);
    assert.equal(riff, 'RIFF');
    assert.equal(wave, 'WAVE');
    assert.equal(wav.byteLength, 44 + 24000 * 2 * 2);
  };

  checkRiffHeader(stems.fullMixWav);
  checkRiffHeader(stems.vocalsOnlyWav);
  checkRiffHeader(stems.musicOnlyWav);
  assert.equal(Object.keys(stems.speakerWavs).length, 3);
});
