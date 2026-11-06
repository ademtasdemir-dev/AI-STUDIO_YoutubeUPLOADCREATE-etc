import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeVideoId,
  formatSecondsToTimestamp,
  parseTimestampToSeconds,
  generateYouTubeDescription,
  calculatePacingMetrics,
} from './youtubeParser';

test('extractYouTubeVideoId handles various URL formats', () => {
  // Standard watch URL
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );

  // Watch URL with extra query params
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&feature=shared'),
    'dQw4w9WgXcQ'
  );

  // Short URL youtu.be
  assert.equal(
    extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?si=abcdef12345'),
    'dQw4w9WgXcQ'
  );

  // Shorts URL
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );

  // Embed URL
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );

  // Raw 11-char ID
  assert.equal(extractYouTubeVideoId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');

  // Invalid input
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
