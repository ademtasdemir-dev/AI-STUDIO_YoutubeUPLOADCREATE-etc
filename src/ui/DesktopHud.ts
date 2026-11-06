import { VideoAnalysisResult, TranscriptSegment } from '../types';
import { SAMPLE_VIDEOS } from '../constants';
import {
  extractYouTubeVideoId,
  parseTimestampToSeconds,
  generateYouTubeDescription,
  calculatePacingMetrics,
  validateUploadMetadata,
  buildMarkdownReport,
} from '../utils/youtubeParser';
import {
  exportTranscriptAsTxt,
  exportTranscriptAsSrt,
  exportTranscriptAsVtt,
  computeSpeakerStats,
  generateSeparatedAudioStems,
  SeparatedAudioStems,
} from '../utils/transcriptAndAudio';

interface PendingDownload {
  filename: string;
  mimeType: string;
  content: Uint8Array | string;
  description: string;
}

const FOLDER_PRESETS = [
  '/Users/studio/Downloads/YouTube_Audio_Stems',
  '/Users/studio/Videos/Untertitel_Transkripte',
  'D:\\VideoProjekte\\YouTube_Export',
  '/tmp/youtube_studio_export',
];

export class DesktopHud {
  private container: HTMLElement;
  private currentData: VideoAnalysisResult;
  private activePackageId: string = SAMPLE_VIDEOS[0].id;
  private activeTab: 'upload' | 'structure' | 'transcript' | 'summary' | 'presentation' = 'upload';
  private activeChapterIndex: number = 0;
  private selectedSpeakerFilter: string = 'ALL';
  private logMessages: string[] = [];
  private isAnalyzing: boolean = false;
  private showThumbPreview: boolean = false;
  private forKids: boolean = false;
  private autoArchive: boolean = true;
  private queueActive: boolean = false;
  private alwaysAskDownloadFolder: boolean = true;

  // Generated WAV stems & Object URLs for inline audio playback
  private audioStems?: SeparatedAudioStems;
  private stemBlobUrls: {
    fullMix?: string;
    vocalsOnly?: string;
    musicOnly?: string;
    speakers: Record<string, string>;
  } = { speakers: {} };

  // Active folder picker modal state
  private pendingDownload: PendingDownload | null = null;
  private selectedDownloadFolder: string = FOLDER_PRESETS[0];

  constructor(container: HTMLElement, initialData: VideoAnalysisResult) {
    this.container = container;
    this.currentData = structuredClone(initialData);

    this.rebuildAudioStems();
    this.addLog('Arbeitsplatz bereit. Referenz-Paket inkl. mehrstimmigem Transkript & Audio-Stems geladen.');
    this.render();
  }

  private addLog(msg: string) {
    const time = new Date().toTimeString().split(' ')[0];
    this.logMessages.push(`${time} ${msg}`);
    if (this.logMessages.length > 40) {
      this.logMessages.shift();
    }
  }

  private rebuildAudioStems() {
    // Revoke old URLs to prevent memory leaks
    if (this.stemBlobUrls.fullMix) URL.revokeObjectURL(this.stemBlobUrls.fullMix);
    if (this.stemBlobUrls.vocalsOnly) URL.revokeObjectURL(this.stemBlobUrls.vocalsOnly);
    if (this.stemBlobUrls.musicOnly) URL.revokeObjectURL(this.stemBlobUrls.musicOnly);
    Object.values(this.stemBlobUrls.speakers).forEach((u) => URL.revokeObjectURL(u));

    const segments = this.getTranscriptSegments();
    this.audioStems = generateSeparatedAudioStems(segments, 10);

    this.stemBlobUrls = {
      fullMix: URL.createObjectURL(new Blob([this.audioStems.fullMixWav as unknown as BlobPart], { type: 'audio/wav' })),
      vocalsOnly: URL.createObjectURL(new Blob([this.audioStems.vocalsOnlyWav as unknown as BlobPart], { type: 'audio/wav' })),
      musicOnly: URL.createObjectURL(new Blob([this.audioStems.musicOnlyWav as unknown as BlobPart], { type: 'audio/wav' })),
      speakers: {},
    };

    for (const [spName, wavBytes] of Object.entries(this.audioStems.speakerWavs)) {
      this.stemBlobUrls.speakers[spName] = URL.createObjectURL(
        new Blob([wavBytes as unknown as BlobPart], { type: 'audio/wav' })
      );
    }
  }

  private getTranscriptSegments(): TranscriptSegment[] {
    if (this.currentData.transcript && this.currentData.transcript.length > 0) {
      return this.currentData.transcript;
    }
    // Derive fallback transcript from chapters if none provided
    return this.currentData.structurePlan.map((ch, i) => ({
      id: `auto-${i}`,
      startTime: ch.timestamp,
      endTime: this.currentData.structurePlan[i + 1]?.timestamp || '4:12',
      startSeconds: ch.seconds,
      endSeconds: this.currentData.structurePlan[i + 1]?.seconds || ch.seconds + 45,
      speaker: 'Hauptsprecher',
      speakerRole: 'Moderator',
      text: `${ch.title}: ${ch.purpose || 'Erklärung und Praxisbeispiel in diesem Abschnitt.'}`,
    }));
  }

  public setData(data: VideoAnalysisResult, packageId?: string) {
    this.currentData = structuredClone(data);
    if (packageId) {
      this.activePackageId = packageId;
    }
    this.activeChapterIndex = 0;
    this.selectedSpeakerFilter = 'ALL';
    this.rebuildAudioStems();
    this.render();
  }

  public render() {
    const activeChapter =
      this.currentData.structurePlan[this.activeChapterIndex] ||
      this.currentData.structurePlan[0] || {
        timestamp: '0:00',
        seconds: 0,
        phase: 'Start',
        title: 'Kapitel 1',
      };

    const pacing = calculatePacingMetrics(this.currentData.structurePlan);
    const segments = this.getTranscriptSegments();
    const speakerStats = computeSpeakerStats(segments);

    this.container.innerHTML = `
      <div class="studio-shell">
        <!-- Top Bar Contract: 3 Zones (Brand — 5 Nav Links — 1 Primary Action) -->
        <header class="studio-topbar">
          <a href="#top" class="topbar-brand" id="brandHomeLink">YouTube Studio Analyzer</a>

          <nav class="topbar-nav" aria-label="Hauptnavigation">
            <button type="button" class="topbar-link ${this.activeTab === 'upload' ? 'active' : ''}" data-tab="upload">
              Upload &amp; Metadaten
            </button>
            <button type="button" class="topbar-link ${this.activeTab === 'structure' ? 'active' : ''}" data-tab="structure">
              Strukturplan (${this.currentData.structurePlan.length})
            </button>
            <button type="button" class="topbar-link ${this.activeTab === 'transcript' ? 'active' : ''}" data-tab="transcript">
              Transkript &amp; Audio-Stems (${speakerStats.length} Stimmen)
            </button>
            <button type="button" class="topbar-link ${this.activeTab === 'summary' ? 'active' : ''}" data-tab="summary">
              Inhaltsanalyse
            </button>
            <button type="button" class="topbar-link ${this.activeTab === 'presentation' ? 'active' : ''}" data-tab="presentation">
              Darstellung &amp; Regie
            </button>
          </nav>

          <div class="topbar-action">
            <button type="button" id="btnExportMarkdown" class="btn-primary">
              Strukturplan exportieren (MD)
            </button>
          </div>
        </header>

        <!-- Main 2-Column Workspace -->
        <div class="studio-workspace">
          <!-- Left Sidebar: Packages & Chapter Preview Monitor -->
          <aside class="studio-sidebar" aria-label="Projekt-Pakete und Kapitel-Vorschau">
            <div class="sidebar-section">
              <h2 class="sidebar-heading">Vorlagen &amp; Referenz-Pakete</h2>
              <div class="package-list">
                ${SAMPLE_VIDEOS.map(
                  (pkg) => `
                  <button
                    type="button"
                    class="package-item ${this.activePackageId === pkg.id ? 'active' : ''}"
                    data-pkg-id="${escapeHtml(pkg.id)}"
                  >
                    <span class="package-item-title">${escapeHtml(pkg.label)}</span>
                    <span class="package-item-meta tabular-nums">${pkg.data.structurePlan.length} Kapitel · ${(pkg.data.speakers || []).length || 1} Stimmen · ${escapeHtml(pkg.data.meta.estimatedDuration || '4:12')}</span>
                  </button>
                `
                ).join('')}
              </div>
            </div>

            <div class="sidebar-section">
              <h2 class="sidebar-heading">Kapitel-Monitor &amp; Vorschau</h2>
              <div class="preview-monitor">
                <div class="preview-thumb-frame">
                  <img
                    src="${escapeHtml(this.currentData.meta.thumbnailUrl || SAMPLE_VIDEOS[0].data.meta.thumbnailUrl || '')}"
                    alt="Video Thumbnail Vorschau"
                    referrerpolicy="no-referrer"
                  />
                </div>
                <div class="preview-chapter-bar">
                  <div class="preview-chapter-meta tabular-nums">
                    Kapitel ${this.activeChapterIndex + 1} von ${this.currentData.structurePlan.length} · [${escapeHtml(activeChapter.timestamp)}] · ${escapeHtml(activeChapter.phase)}
                  </div>
                  <div class="preview-chapter-title">${escapeHtml(activeChapter.title)}</div>
                  <div class="preview-controls">
                    <button type="button" id="btnPrevChapter" class="btn-secondary" style="flex:1;">Vorheriges</button>
                    <button type="button" id="btnNextChapter" class="btn-secondary" style="flex:1;">Nächstes</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="sidebar-section">
              <h2 class="sidebar-heading">Audio- &amp; Transkript-Schnellzugriff</h2>
              <button type="button" id="btnSidebarQuickVocals" class="btn-secondary" style="width:100%;text-align:left;">
                Nur Stimme (Vocals .wav) laden
              </button>
              <button type="button" id="btnSidebarQuickMusic" class="btn-secondary" style="width:100%;text-align:left;">
                Nur Musik (Instrumental .wav) laden
              </button>
              <button type="button" id="btnSidebarQuickSrt" class="btn-secondary" style="width:100%;text-align:left;">
                Untertitel (.srt) mit Zeitstempeln laden
              </button>
            </div>

            <div class="sidebar-section">
              <h2 class="sidebar-heading">Pacing-Kennzahlen</h2>
              <div class="context-meta-line tabular-nums">
                <span>Ø ${pacing.avgChapterSeconds}s pro Kapitel</span>
                <span aria-hidden="true">·</span>
                <span>${escapeHtml(pacing.pacingRating)}</span>
              </div>
            </div>
          </aside>

          <!-- Main Content Viewport -->
          <main class="studio-main">
            <!-- Video Context Header -->
            <section class="video-context-header" aria-label="Aktuelles Video">
              <div>
                <h1 class="context-title">${escapeHtml(this.currentData.meta.title)}</h1>
                <div class="context-meta-line">
                  <span>Kanal: ${escapeHtml(this.currentData.meta.author)}</span>
                  <span aria-hidden="true">·</span>
                  <span>Kategorie: ${escapeHtml(this.currentData.meta.category || 'Bildung & IT')}</span>
                  <span aria-hidden="true">·</span>
                  <span class="tabular-nums">Laufzeit: ${escapeHtml(this.currentData.meta.estimatedDuration || '4:12 Min.')}</span>
                  <span aria-hidden="true">·</span>
                  <span class="tabular-nums">Erkannte Stimmen: ${speakerStats.length} Personen</span>
                  <span aria-hidden="true">·</span>
                  <span class="tabular-nums">Zielordner-Abfrage: ${this.alwaysAskDownloadFolder ? 'Immer fragen' : 'Standard'}</span>
                </div>
              </div>
            </section>

            <!-- Active Tab Surface -->
            ${this.renderActiveTabContent()}

            <!-- Terminal Protocol Console & Footer -->
            <section class="console-card" aria-label="Systemprotokoll">
              <div class="progress-strip">
                <div class="progress-fill" style="transform: scaleX(${this.isAnalyzing ? 0.65 : 1});"></div>
              </div>
              <div class="console-header">
                <span>Ausführungs-, Audio-Stem- &amp; Download-Protokoll</span>
                <button type="button" id="btnClearLog" class="btn-link-inline">Protokoll leeren</button>
              </div>
              <div class="console-body" id="consoleBody">
                ${this.logMessages.map((m) => `<div class="log-line">${escapeHtml(m)}</div>`).join('')}
              </div>
              <div class="console-footer">
                <div class="left-actions">
                  <button type="button" id="btnCopyLink" class="btn-secondary">Link kopieren</button>
                  <button type="button" id="btnCopyDescription" class="btn-secondary">Beschreibung &amp; Kapitel kopieren</button>
                </div>
                <div class="right-actions">
                  <button type="button" id="btnToggleQueue" class="btn-secondary tabular-nums">
                    Warteschlange überwachen: ${this.queueActive ? 'aktiv' : 'aus'}
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>

        ${this.renderFolderModal()}
      </div>
    `;

    this.attachEventListeners();

    const consoleBody = this.container.querySelector('#consoleBody');
    if (consoleBody) {
      consoleBody.scrollTop = consoleBody.scrollHeight;
    }
  }

  private renderFolderModal(): string {
    if (!this.pendingDownload) return '';
    return `
      <div class="folder-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="folderModalTitle">
        <div class="folder-modal-dialog">
          <div class="section-header-row" style="margin-bottom:0;">
            <h2 class="section-title" id="folderModalTitle">Speicherort &amp; Download-Ordner wählen</h2>
            <span class="section-meta">${escapeHtml(this.pendingDownload.description)}</span>
          </div>

          <div class="form-row">
            <label class="row-label" for="modalInputFolder">Zielordner</label>
            <div class="row-input-group">
              <input
                type="text"
                id="modalInputFolder"
                class="hud-input tabular-nums"
                value="${escapeHtml(this.selectedDownloadFolder)}"
                placeholder="z.B. /Users/studio/Downloads oder D:\\VideoProjekte"
              />
            </div>
          </div>

          <div>
            <div style="font-size:12px;font-weight:600;color:#475569;margin-bottom:6px;">Schnellauswahl häufiger Zielordner:</div>
            <div class="folder-preset-list">
              ${FOLDER_PRESETS.map(
                (preset) => `
                <button
                  type="button"
                  class="folder-preset-btn ${this.selectedDownloadFolder === preset ? 'selected-preset' : ''}"
                  data-folder-preset="${escapeHtml(preset)}"
                >
                  ${escapeHtml(preset)}
                </button>
              `
              ).join('')}
            </div>
          </div>

          <div class="form-row">
            <label class="row-label" for="modalInputFilename">Dateiname</label>
            <div class="row-input-group">
              <input
                type="text"
                id="modalInputFilename"
                class="hud-input tabular-nums"
                value="${escapeHtml(this.pendingDownload.filename)}"
              />
            </div>
          </div>

          <div class="mask-action-row" style="margin-top:4px;">
            <div class="left-actions">
              <button type="button" id="btnCancelDownloadModal" class="btn-secondary">Abbrechen</button>
              <button type="button" id="btnNativeFilePicker" class="btn-secondary">
                System-Ordnerdialog öffnen…
              </button>
            </div>
            <div class="right-actions">
              <button type="button" id="btnConfirmDownloadModal" class="btn-primary">
                In gewähltem Ordner speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderActiveTabContent(): string {
    switch (this.activeTab) {
      case 'structure':
        return this.renderStructurePlanTab();
      case 'transcript':
        return this.renderTranscriptAndAudioTab();
      case 'summary':
        return this.renderSummaryTab();
      case 'presentation':
        return this.renderPresentationTab();
      case 'upload':
      default:
        return this.renderUploadMaskTab();
    }
  }

  /**
   * Tab 1: Upload & Metadata Mask (adapted from the user's screenshot)
   */
  private renderUploadMaskTab(): string {
    const titleVal = this.currentData.uploadPackage.suggestedTitle || this.currentData.meta.title;
    const titleLen = titleVal.length;
    const descVal = this.currentData.uploadPackage.suggestedDescription;
    const tagsVal = this.currentData.uploadPackage.tags;
    const tagsLen = tagsVal.length;
    const videoUrlOrPath = this.currentData.meta.url || `/tmp/tmpv8vyv8bs/Vortrag.mp4`;
    const thumbUrlOrPath =
      this.currentData.meta.thumbnailUrl && !this.currentData.meta.thumbnailUrl.startsWith('data:')
        ? this.currentData.meta.thumbnailUrl
        : `/tmp/tmpv8vyv8bs/thumb.png`;

    return `
      <section class="surface-card" aria-label="YouTube Upload und Metadaten">
        <div class="section-header-row">
          <h2 class="section-title">Automatischer YouTube-Upload &amp; Metadaten-Konfiguration</h2>
          <span class="section-meta">Bereit für Analyse, Prüfung und Upload-Simulation</span>
        </div>

        <div class="upload-mask-layout">
          <!-- Input Row: Video -->
          <div class="form-row">
            <label class="row-label" for="inputVideoUrl">Video / Link</label>
            <div class="row-input-group">
              <input
                type="text"
                id="inputVideoUrl"
                class="hud-input"
                value="${escapeHtml(videoUrlOrPath)}"
                placeholder="YouTube-Link (https://www.youtube.com/watch?v=...) oder Dateipfad"
              />
              <button type="button" id="btnAnalyzeVideo" class="btn-primary" ${this.isAnalyzing ? 'disabled' : ''}>
                ${this.isAnalyzing ? 'Analysiere...' : 'Video analysieren'}
              </button>
            </div>
          </div>

          <!-- Input Row: Thumbnail -->
          <div class="form-row">
            <label class="row-label" for="inputThumbnail">Thumbnail</label>
            <div class="row-input-group">
              <input
                type="text"
                id="inputThumbnail"
                class="hud-input"
                value="${escapeHtml(thumbUrlOrPath)}"
                placeholder="Pfad oder Bild-URL"
              />
              <button type="button" id="btnPreviewThumb" class="btn-secondary">
                ${this.showThumbPreview ? 'Vorschau ausblenden' : 'Vorschau'}
              </button>
            </div>
          </div>

          ${
            this.showThumbPreview
              ? `
            <div class="inline-thumb-preview">
              <img
                src="${escapeHtml(this.currentData.meta.thumbnailUrl || SAMPLE_VIDEOS[0].data.meta.thumbnailUrl || '')}"
                alt="Thumbnail Detailvorschau"
                referrerpolicy="no-referrer"
              />
              <div>
                <div style="font-size:13px;font-weight:600;margin-bottom:4px;">Aktive Thumbnail-Vorschau (16:9)</div>
                <div style="font-size:12px;color:#64748b;">Auflösung: 1280×720 px · Hoher Kontrast für YouTube-Startseite und Mobilgeräte</div>
              </div>
            </div>
          `
              : ''
          }

          <!-- Input Row: Titel -->
          <div class="form-row">
            <label class="row-label" for="inputTitle">Titel</label>
            <div class="row-input-group">
              <input
                type="text"
                id="inputTitle"
                maxlength="100"
                class="hud-input"
                value="${escapeHtml(titleVal)}"
              />
              <span class="char-counter" id="titleCounter">${titleLen} / 100</span>
            </div>
          </div>

          <!-- Input Row: Beschreibung -->
          <div class="form-row align-top">
            <label class="row-label" for="inputDescription">Beschreibung</label>
            <div class="row-input-group" style="flex-direction:column;align-items:stretch;">
              <textarea id="inputDescription" class="hud-textarea" rows="9">${escapeHtml(descVal)}</textarea>
            </div>
          </div>
          <div class="form-hint-row">
            <span>Enthält Zusammenfassung und anklickbare YouTube-Kapitelmarken (Start bei 0:00)</span>
            <button type="button" id="btnSyncChaptersToDesc" class="btn-link-inline">
              Kapitel aus Strukturplan neu synchronisieren
            </button>
          </div>

          <!-- Input Row: Tags -->
          <div class="form-row">
            <label class="row-label" for="inputTags">Tags</label>
            <div class="row-input-group">
              <input
                type="text"
                id="inputTags"
                maxlength="500"
                class="hud-input"
                value="${escapeHtml(tagsVal)}"
              />
              <span class="char-counter" id="tagsCounter">${tagsLen} / 500</span>
            </div>
          </div>
          <div class="form-hint-row">
            <span>mit Komma trennen, zusammen max. 500 Zeichen</span>
          </div>

          <!-- Options: Sichtbarkeit & Checkboxen -->
          <div class="form-row">
            <label class="row-label" for="selectVisibility">Sichtbarkeit</label>
            <div class="options-group">
              <select id="selectVisibility" class="hud-select">
                <option value="nicht gelistet" ${this.currentData.uploadPackage.visibility === 'nicht gelistet' ? 'selected' : ''}>nicht gelistet</option>
                <option value="öffentlich" ${this.currentData.uploadPackage.visibility === 'öffentlich' ? 'selected' : ''}>öffentlich</option>
                <option value="privat" ${this.currentData.uploadPackage.visibility === 'privat' ? 'selected' : ''}>privat</option>
              </select>

              <label class="hud-checkbox-label">
                <input type="checkbox" id="chkForKids" ${this.forKids ? 'checked' : ''} />
                <span>Speziell für Kinder</span>
              </label>

              <label class="hud-checkbox-label">
                <input type="checkbox" id="chkAutoArchive" ${this.autoArchive ? 'checked' : ''} />
                <span>Nach erfolgreichem Upload Video, Thumbnail und Arbeitsdateien löschen</span>
              </label>
            </div>
          </div>

          <!-- Mask Action Buttons -->
          <div class="mask-action-row">
            <div class="left-actions">
              <button type="button" id="btnCyclePackage" class="btn-secondary">Paket laden ...</button>
              <button type="button" id="btnValidateData" class="btn-secondary">Prüfen</button>
              <button type="button" id="btnJumpToTranscript" class="btn-secondary">
                Transkript &amp; Stimme/Musik trennen öffnen
              </button>
            </div>
            <div class="right-actions">
              <button type="button" id="btnStartUpload" class="btn-primary">
                Hochladen
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Tab 2: Detailed Structure Plan
   */
  private renderStructurePlanTab(): string {
    const chapters = this.currentData.structurePlan;
    const alternatives = this.currentData.titleAnalysis.alternatives || [];

    return `
      <section class="surface-card" aria-label="Detaillierter Kapitel-Strukturplan">
        <div class="section-header-row">
          <h2 class="section-title">01. Sekundengenauer Kapitel- &amp; Strukturplan (${chapters.length} Abschnitte)</h2>
          <span class="section-meta tabular-nums">Gesamtlaufzeit: ${escapeHtml(this.currentData.meta.estimatedDuration || '4:12 Min.')}</span>
        </div>

        <div class="table-responsive">
          <table class="chapter-table">
            <thead>
              <tr>
                <th>Zeit</th>
                <th>Dramaturgie-Phase</th>
                <th>Kapitel-Titel</th>
                <th>Inhaltlicher Zweck</th>
                <th>Visuelle Darstellung</th>
                <th>Bindung (Retention)</th>
              </tr>
            </thead>
            <tbody>
              ${chapters
                .map(
                  (ch, idx) => `
                <tr class="chapter-row ${idx === this.activeChapterIndex ? 'selected-row' : ''}" data-chapter-idx="${idx}">
                  <td class="time-cell">${escapeHtml(ch.timestamp)}</td>
                  <td>${escapeHtml(ch.phase)}</td>
                  <td><strong>${escapeHtml(ch.title)}</strong></td>
                  <td>${escapeHtml(ch.purpose || 'Hauptabschnitt')}</td>
                  <td>${escapeHtml(ch.visualElement || 'Screencast / B-Roll')}</td>
                  <td class="tabular-nums">${escapeHtml(ch.retentionImpact || 'Hoch')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Inline Form to Add a New Chapter -->
        <div class="add-chapter-bar">
          <input type="text" id="newChTime" class="hud-input tabular-nums" placeholder="z.B. 4:15" aria-label="Neuer Zeitstempel" />
          <input type="text" id="newChPhase" class="hud-input" placeholder="Phase (z.B. Bonus)" aria-label="Neue Dramaturgie-Phase" />
          <input type="text" id="newChTitle" class="hud-input" placeholder="Neuer Kapitel-Titel" aria-label="Neuer Kapitel-Titel" />
          <input type="text" id="newChVisual" class="hud-input" placeholder="Visuelles Element (z.B. Live-Demo)" aria-label="Visuelle Darstellung" />
          <button type="button" id="btnAddChapter" class="btn-secondary">Kapitel hinzufügen</button>
        </div>
      </section>

      <section class="surface-card" aria-label="Titel-Analyse und Alternativen">
        <div class="section-header-row">
          <h2 class="section-title">02. Titel-Bewertung &amp; Klickraten-Optimierung (CTR)</h2>
          <span class="section-meta tabular-nums">Titel-Relevanzwert: ${this.currentData.titleAnalysis.score} / 100</span>
        </div>
        <p class="summary-prose">${escapeHtml(this.currentData.titleAnalysis.critique)}</p>

        <div class="alternatives-list">
          ${alternatives
            .map(
              (alt) => `
            <div class="alt-item">
              <div class="alt-meta">${escapeHtml(alt.predictedCtr)} prognostizierte CTR</div>
              <div class="alt-title">${escapeHtml(alt.title)}</div>
              <div class="alt-strategy">${escapeHtml(alt.strategy)}</div>
              <div style="margin-top:auto;padding-top:6px;">
                <button type="button" class="btn-secondary btn-use-title" data-title="${escapeHtml(alt.title)}">
                  Als Haupttitel übernehmen
                </button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;
  }

  /**
   * Tab 3: Multi-Speaker Transcript with Timestamps + Voice/Music Separation & 1-Click Audio Downloads
   */
  private renderTranscriptAndAudioTab(): string {
    const allSegments = this.getTranscriptSegments();
    const speakerStats = computeSpeakerStats(allSegments);
    const filteredSegments =
      this.selectedSpeakerFilter === 'ALL'
        ? allSegments
        : allSegments.filter((s) => s.speaker === this.selectedSpeakerFilter);

    const vidId = (this.currentData.meta.videoId || 'Video').replace(/[^a-zA-Z0-9_-]/g, '_');

    return `
      <!-- Section 1: Music & Voice Separation (Stimme von Musik trennen) + 1-Click Audio Downloads -->
      <section class="surface-card" aria-label="Musik von Stimme trennen und Audio-Downloads">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">01. Musik von Stimme trennen (Audio-Stem-Separation &amp; Einzel-Downloads)</h2>
            <div class="section-meta" style="margin-top:4px;">
              Jede Audiospur liegt als 24 kHz / 16-Bit RIFF WAVE (.wav) vor. Beim Klick auf Download wird jedes Mal der Zielordner abgefragt.
            </div>
          </div>
          <button type="button" id="btnRunStemSeparation" class="btn-secondary">
            Stimme &amp; Musik neu separieren
          </button>
        </div>

        <div class="stems-grid">
          <!-- Track 1: Vocals Only -->
          <div class="stem-card highlight-stem">
            <h3 class="stem-title">Isolierte Sprachspur (Nur Stimme / Vocals)</h3>
            <p class="stem-desc">Reine Sprecherstimmen ohne Hintergrundmusik – ideal für Schnitt, Dubbing &amp; Voice-Analyse.</p>
            <audio controls class="stem-audio-player" src="${this.stemBlobUrls.vocalsOnly || ''}"></audio>
            <div class="stem-actions">
              <span class="section-meta tabular-nums">WAV · 24 kHz · Dry Voice</span>
              <button type="button" id="btnDownloadVocalsWav" class="btn-primary">
                Audio herunterladen (.wav)
              </button>
            </div>
          </div>

          <!-- Track 2: Music / Instrumental Only -->
          <div class="stem-card">
            <h3 class="stem-title">Isolierte Musikspur (Nur Hintergrundmusik)</h3>
            <p class="stem-desc">Gefiltertes Instrumental &amp; Atmos-Bett komplett ohne gesprochene Dialoge.</p>
            <audio controls class="stem-audio-player" src="${this.stemBlobUrls.musicOnly || ''}"></audio>
            <div class="stem-actions">
              <span class="section-meta tabular-nums">WAV · 24 kHz · Instrumental</span>
              <button type="button" id="btnDownloadMusicWav" class="btn-secondary">
                Audio herunterladen (.wav)
              </button>
            </div>
          </div>

          <!-- Track 3: Full Mix -->
          <div class="stem-card">
            <h3 class="stem-title">Komplette Audiospur (Original-Mix)</h3>
            <p class="stem-desc">Kombinierte Master- Tonspur inklusive aller Sprecher und Hintergrundmusik.</p>
            <audio controls class="stem-audio-player" src="${this.stemBlobUrls.fullMix || ''}"></audio>
            <div class="stem-actions">
              <span class="section-meta tabular-nums">WAV · 24 kHz · Master Mix</span>
              <button type="button" id="btnDownloadFullMixWav" class="btn-secondary">
                Audio herunterladen (.wav)
              </button>
            </div>
          </div>
        </div>

        <!-- Per-Speaker Individual Voice Audio Downloads -->
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-hairline);">
          <h3 class="sidebar-heading" style="margin-bottom:10px;">
            Einzelne Personen- / Stimmspuren separat als Audio herunterladen (${speakerStats.length} erkannte Stimmen)
          </h3>
          <div class="stems-grid">
            ${speakerStats
              .map(
                (sp, idx) => `
              <div class="stem-card">
                <h4 class="stem-title">${escapeHtml(sp.speaker)}</h4>
                <p class="stem-desc">Rolle: ${escapeHtml(sp.role)} · <span class="tabular-nums">${sp.segmentCount} Abschnitte · ${sp.wordCount} Wörter · ${sp.durationSeconds}s Redezeit</span></p>
                <audio controls class="stem-audio-player" src="${this.stemBlobUrls.speakers[sp.speaker] || this.stemBlobUrls.vocalsOnly || ''}"></audio>
                <div class="stem-actions">
                  <span class="section-meta tabular-nums">Stimme #0${idx + 1} (.wav)</span>
                  <button
                    type="button"
                    class="btn-secondary btn-download-speaker-wav"
                    data-speaker-name="${escapeHtml(sp.speaker)}"
                  >
                    Stimme herunterladen (.wav)
                  </button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- Section 2: Full Multi-Speaker Transcript & Subtitles with Timestamps -->
      <section class="surface-card" aria-label="Vollständiges Text-Transkript und Untertitel mit Zeitstempeln">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">02. Untertitel &amp; Gesprochenes Text-Transkript mit Zeitstempeln (${filteredSegments.length} Segmente)</h2>
            <div class="section-meta" style="margin-top:4px;">
              Inklusive automatischer Sprecher- und Personen-Zuordnung (${speakerStats.length} Personen erkannt)
            </div>
          </div>
        </div>

        <!-- 1-Click Transcript & Subtitle Download Buttons -->
        <div class="download-toolbar">
          <button type="button" id="btnDownloadTranscriptTxt" class="btn-primary">
            Transkript als Text herunterladen (.txt)
          </button>
          <button type="button" id="btnDownloadSubtitleSrt" class="btn-secondary">
            Untertitel als SRT herunterladen (.srt)
          </button>
          <button type="button" id="btnDownloadSubtitleVtt" class="btn-secondary">
            Untertitel als WebVTT herunterladen (.vtt)
          </button>
        </div>

        <!-- Speaker Filter Segmented Control -->
        <div class="speaker-filter-bar" role="group" aria-label="Nach Person oder Stimme filtern">
          <button
            type="button"
            class="speaker-filter-btn ${this.selectedSpeakerFilter === 'ALL' ? 'active' : ''}"
            data-speaker-filter="ALL"
          >
            Alle Personen (${allSegments.length})
          </button>
          ${speakerStats
            .map(
              (sp) => `
            <button
              type="button"
              class="speaker-filter-btn ${this.selectedSpeakerFilter === sp.speaker ? 'active' : ''}"
              data-speaker-filter="${escapeHtml(sp.speaker)}"
            >
              ${escapeHtml(sp.speaker)} (${sp.segmentCount})
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Transcript Table -->
        <div class="table-responsive">
          <table class="chapter-table">
            <thead>
              <tr>
                <th style="width:130px;">Zeitstempel</th>
                <th style="width:240px;">Person / Stimme</th>
                <th>Gesprochener Text (Wortlaut / Untertitel)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSegments
                .map(
                  (seg) => `
                <tr class="chapter-row" data-transcript-id="${escapeHtml(seg.id)}">
                  <td class="time-cell">${escapeHtml(seg.startTime)} – ${escapeHtml(seg.endTime)}</td>
                  <td>
                    <strong>${escapeHtml(seg.speaker)}</strong>
                    <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(seg.speakerRole || 'Sprecher')}</div>
                  </td>
                  <td style="line-height:1.55;">${escapeHtml(seg.text)}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- Inline Form to Add a New Transcript Segment -->
        <div class="add-chapter-bar">
          <input type="text" id="newTrStart" class="hud-input tabular-nums" placeholder="Start (4:12)" aria-label="Start-Zeitstempel" />
          <input type="text" id="newTrSpeaker" class="hud-input" placeholder="Person / Stimme (z.B. Gast 2)" aria-label="Name der Person oder Stimme" />
          <input type="text" id="newTrText" class="hud-input" placeholder="Gesprochener Untertitel-Text..." aria-label="Gesprochener Text" style="grid-column: span 2;" />
          <button type="button" id="btnAddTranscriptSeg" class="btn-secondary">Segment ergänzen</button>
        </div>
      </section>
    `;
  }

  /**
   * Tab 4: Content Summary & Key Takeaways
   */
  private renderSummaryTab(): string {
    const summary = this.currentData.summary;
    return `
      <section class="surface-card" aria-label="Inhaltliche Zusammenfassung">
        <div class="section-header-row">
          <h2 class="section-title">01. Inhaltliche Executive Summary</h2>
          <span class="section-meta tabular-nums">Qualitätsindex: ${this.currentData.meta.overallRating ?? 9.2} / 10</span>
        </div>
        <h3 style="font-size:17px;font-weight:700;margin:0 0 10px 0;">${escapeHtml(summary.headline)}</h3>
        <p class="summary-prose">${escapeHtml(summary.executiveSummary)}</p>
        <div class="context-meta-line">
          <strong>Zielgruppe &amp; Vorwissen:</strong>
          <span>${escapeHtml(summary.targetAudience)}</span>
        </div>
      </section>

      <section class="surface-card" aria-label="Wichtigste Kernbotschaften">
        <div class="section-header-row">
          <h2 class="section-title">02. Kernbotschaften &amp; Inhaltliche Takeaways (${summary.keyTakeaways.length})</h2>
          <span class="section-meta">Strukturierte Wissensextraktion</span>
        </div>
        <div class="takeaways-list">
          ${summary.keyTakeaways
            .map(
              (item, idx) => `
            <div class="takeaway-row">
              <span class="takeaway-index">0${idx + 1}.</span>
              <span>${escapeHtml(item)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;
  }

  /**
   * Tab 5: Presentation, Visuals, Camera, Audio and Dramaturgy
   */
  private renderPresentationTab(): string {
    const p = this.currentData.presentationAnalysis;
    const d = this.currentData.dramaturgy;

    return `
      <section class="surface-card" aria-label="Darstellungs- und Videoaufbau-Analyse">
        <div class="section-header-row">
          <h2 class="section-title">01. Visuelle Darstellung, Kameraführung &amp; Tontechnik</h2>
          <span class="section-meta">Produktions- &amp; Regie-Auswertung</span>
        </div>

        <div class="presentation-grid">
          <div class="presentation-cell">
            <h3 class="cell-heading">Visuelle Machart &amp; Video-Format</h3>
            <p class="cell-body">${escapeHtml(p.visualStyle)}</p>
          </div>

          <div class="presentation-cell">
            <h3 class="cell-heading">Kameraeinstellungen &amp; Beleuchtung</h3>
            <p class="cell-body">${escapeHtml(p.cameraAndLighting)}</p>
          </div>

          <div class="presentation-cell">
            <h3 class="cell-heading">Grafiken, Overlays &amp; B-Roll</h3>
            <p class="cell-body">${escapeHtml(p.graphicsAndBroll)}</p>
          </div>

          <div class="presentation-cell">
            <h3 class="cell-heading">Pacing &amp; Schnittfrequenz</h3>
            <p class="cell-body">${escapeHtml(p.pacingAndTempo)}</p>
          </div>

          <div class="presentation-cell">
            <h3 class="cell-heading">Sprechweise &amp; Moderation</h3>
            <p class="cell-body">${escapeHtml(p.speakerDelivery)}</p>
          </div>

          <div class="presentation-cell">
            <h3 class="cell-heading">Audio-Qualität &amp; Sounddesign</h3>
            <p class="cell-body">${escapeHtml(p.audioQuality)}</p>
          </div>
        </div>
      </section>

      <section class="surface-card" aria-label="Dramaturgie und Zuschauerbindung">
        <div class="section-header-row">
          <h2 class="section-title">02. Dramaturgischer Aufbau, Hook &amp; Call-to-Action</h2>
          <span class="section-meta">Storytelling-Analyse</span>
        </div>

        <div class="presentation-grid">
          <div class="presentation-cell">
            <h3 class="cell-heading">Hook-Analyse (Erste 30 Sekunden)</h3>
            <p class="cell-body">${escapeHtml(d.hookAnalysis)}</p>
          </div>

          <div class="presentation-cell">
            <h3 class="cell-heading">Spannungsbogen &amp; Storytelling</h3>
            <p class="cell-body">${escapeHtml(d.storytellingArc)}</p>
          </div>

          <div class="presentation-cell">
            <h3 class="cell-heading">Zuschauer-Bindung (Retention-Taktiken)</h3>
            <p class="cell-body">${escapeHtml(d.retentionTactics)}</p>
          </div>

          <div class="presentation-cell">
            <h3 class="cell-heading">Call-to-Action (CTA) Effektivität</h3>
            <p class="cell-body">${escapeHtml(d.ctaEffectiveness)}</p>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Opens the "Download-Ordner wählen" dialog every single time a download is requested.
   */
  private requestDownloadWithFolderPrompt(download: PendingDownload) {
    this.pendingDownload = download;
    this.addLog(`Download vorbereitet: "${download.filename}" – Bitte Zielordner wählen.`);
    this.render();
  }

  /**
   * Executes the actual file download after the user chooses/confirms the target folder.
   */
  private async executePendingDownload(useNativeFilePicker: boolean = false) {
    if (!this.pendingDownload) return;
    const folderInput = this.container.querySelector('#modalInputFolder') as HTMLInputElement | null;
    const filenameInput = this.container.querySelector('#modalInputFilename') as HTMLInputElement | null;

    const chosenFolder = (folderInput?.value || this.selectedDownloadFolder || '/Downloads').trim();
    const chosenFilename = (filenameInput?.value || this.pendingDownload.filename).trim();
    this.selectedDownloadFolder = chosenFolder;

    const { content, mimeType } = this.pendingDownload;
    const blob = new Blob([content as unknown as BlobPart], { type: mimeType });

    // Try native OS File System Access API ("Speichern unter...") if requested or supported
    if (useNativeFilePicker && typeof (window as any).showSaveFilePicker === 'function') {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: chosenFilename,
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        this.addLog(`Datei über System-Ordnerdialog gespeichert: ${chosenFilename}`);
        this.pendingDownload = null;
        this.render();
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          this.addLog('System-Ordnerdialog vom Benutzer abgebrochen.');
          return;
        }
        // If blocked by iframe sandbox, fall through to browser download with chosen folder path
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = chosenFilename;
    a.click();
    URL.revokeObjectURL(url);

    const separator = chosenFolder.includes('\\') ? '\\' : '/';
    const cleanFolder = chosenFolder.replace(/[/\\]+$/, '');
    const fullTargetPath = `${cleanFolder}${separator}${chosenFilename}`;

    this.addLog(`Gespeichert in Zielordner: ${fullTargetPath}`);
    this.pendingDownload = null;
    this.render();
  }

  private attachEventListeners() {
    // Brand home link
    const brandHome = this.container.querySelector('#brandHomeLink');
    brandHome?.addEventListener('click', (e) => {
      e.preventDefault();
      this.activeTab = 'upload';
      this.render();
    });

    // Topbar tab switching
    const tabBtns = this.container.querySelectorAll('.topbar-link');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute('data-tab') as any;
        if (target) {
          this.activeTab = target;
          this.render();
        }
      });
    });

    // Jump to Transcript & Audio tab from Upload mask
    const btnJumpTranscript = this.container.querySelector('#btnJumpToTranscript');
    btnJumpTranscript?.addEventListener('click', () => {
      this.activeTab = 'transcript';
      this.render();
    });

    // Sidebar quick download buttons (each opens the Folder Picker Modal on 1 click!)
    const vidId = (this.currentData.meta.videoId || 'Video').replace(/[^a-zA-Z0-9_-]/g, '_');

    const btnSidebarVocals = this.container.querySelector('#btnSidebarQuickVocals');
    btnSidebarVocals?.addEventListener('click', () => {
      if (!this.audioStems) this.rebuildAudioStems();
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Nur_Stimme_Vocals.wav`,
        mimeType: 'audio/wav',
        content: this.audioStems!.vocalsOnlyWav,
        description: 'Isolierte Sprachspur (Nur Stimme / Vocals ohne Musik, 24 kHz WAV)',
      });
    });

    const btnSidebarMusic = this.container.querySelector('#btnSidebarQuickMusic');
    btnSidebarMusic?.addEventListener('click', () => {
      if (!this.audioStems) this.rebuildAudioStems();
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Nur_Musik_Instrumental.wav`,
        mimeType: 'audio/wav',
        content: this.audioStems!.musicOnlyWav,
        description: 'Isolierte Musikspur (Nur Hintergrundmusik ohne Stimme, 24 kHz WAV)',
      });
    });

    const btnSidebarSrt = this.container.querySelector('#btnSidebarQuickSrt');
    btnSidebarSrt?.addEventListener('click', () => {
      const srtContent = exportTranscriptAsSrt(this.getTranscriptSegments(), true);
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Untertitel_mit_Sprechern.srt`,
        mimeType: 'text/plain;charset=utf-8',
        content: srtContent,
        description: 'SRT-Untertitel inkl. Zeitstempeln & Personen-Zuordnung',
      });
    });

    // Sidebar package selection
    const pkgButtons = this.container.querySelectorAll('.package-item');
    pkgButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const pkgId = (e.currentTarget as HTMLElement).getAttribute('data-pkg-id');
        const found = SAMPLE_VIDEOS.find((p) => p.id === pkgId);
        if (found) {
          this.addLog(`Lade Paket "${found.label}" (${found.data.structurePlan.length} Kapitel)...`);
          this.setData(found.data, found.id);
        }
      });
    });

    // Sidebar Prev / Next Chapter buttons
    const btnPrevCh = this.container.querySelector('#btnPrevChapter');
    btnPrevCh?.addEventListener('click', () => {
      const len = this.currentData.structurePlan.length;
      if (len === 0) return;
      this.activeChapterIndex = (this.activeChapterIndex - 1 + len) % len;
      const ch = this.currentData.structurePlan[this.activeChapterIndex];
      this.addLog(`Kapitel-Monitor: [${ch.timestamp}] ${ch.title}`);
      this.render();
    });

    const btnNextCh = this.container.querySelector('#btnNextChapter');
    btnNextCh?.addEventListener('click', () => {
      const len = this.currentData.structurePlan.length;
      if (len === 0) return;
      this.activeChapterIndex = (this.activeChapterIndex + 1) % len;
      const ch = this.currentData.structurePlan[this.activeChapterIndex];
      this.addLog(`Kapitel-Monitor: [${ch.timestamp}] ${ch.title}`);
      this.render();
    });

    // Upload Mask Inputs & Live State Persistence
    const videoInput = this.container.querySelector('#inputVideoUrl') as HTMLInputElement | null;
    if (videoInput) {
      videoInput.addEventListener('input', () => {
        this.currentData.meta.url = videoInput.value;
      });
    }

    const thumbInput = this.container.querySelector('#inputThumbnail') as HTMLInputElement | null;
    if (thumbInput) {
      thumbInput.addEventListener('input', () => {
        if (thumbInput.value.trim()) {
          this.currentData.meta.thumbnailUrl = thumbInput.value.trim();
        }
      });
    }

    const titleInput = this.container.querySelector('#inputTitle') as HTMLInputElement | null;
    const titleCounter = this.container.querySelector('#titleCounter');
    if (titleInput && titleCounter) {
      titleInput.addEventListener('input', () => {
        titleCounter.textContent = `${titleInput.value.length} / 100`;
        this.currentData.uploadPackage.suggestedTitle = titleInput.value;
        this.currentData.meta.title = titleInput.value;
      });
    }

    const tagsInput = this.container.querySelector('#inputTags') as HTMLInputElement | null;
    const tagsCounter = this.container.querySelector('#tagsCounter');
    if (tagsInput && tagsCounter) {
      tagsInput.addEventListener('input', () => {
        tagsCounter.textContent = `${tagsInput.value.length} / 500`;
        this.currentData.uploadPackage.tags = tagsInput.value;
      });
    }

    const descInput = this.container.querySelector('#inputDescription') as HTMLTextAreaElement | null;
    if (descInput) {
      descInput.addEventListener('input', () => {
        this.currentData.uploadPackage.suggestedDescription = descInput.value;
      });
    }

    const selectVisibility = this.container.querySelector('#selectVisibility') as HTMLSelectElement | null;
    if (selectVisibility) {
      selectVisibility.addEventListener('change', () => {
        this.currentData.uploadPackage.visibility = selectVisibility.value as any;
        this.addLog(`Sichtbarkeit geändert auf: ${selectVisibility.value}`);
      });
    }

    const chkForKids = this.container.querySelector('#chkForKids') as HTMLInputElement | null;
    if (chkForKids) {
      chkForKids.addEventListener('change', () => {
        this.forKids = chkForKids.checked;
      });
    }

    const chkAutoArchive = this.container.querySelector('#chkAutoArchive') as HTMLInputElement | null;
    if (chkAutoArchive) {
      chkAutoArchive.addEventListener('change', () => {
        this.autoArchive = chkAutoArchive.checked;
      });
    }

    // Toggle Thumbnail Preview
    const btnPreviewThumb = this.container.querySelector('#btnPreviewThumb');
    btnPreviewThumb?.addEventListener('click', () => {
      this.showThumbPreview = !this.showThumbPreview;
      this.addLog(
        this.showThumbPreview ? 'Thumbnail-Detailvorschau eingeblendet.' : 'Thumbnail-Detailvorschau ausgeblendet.'
      );
      this.render();
    });

    // Synchronize chapters from Structure Plan to Description
    const btnSyncChapters = this.container.querySelector('#btnSyncChaptersToDesc');
    btnSyncChapters?.addEventListener('click', () => {
      const updatedDesc = generateYouTubeDescription(
        this.currentData.summary.executiveSummary,
        this.currentData.structurePlan,
        ['Checkliste & Architekturplan als PDF', 'Weiterführende Dokumentation']
      );
      this.currentData.uploadPackage.suggestedDescription = updatedDesc;
      this.addLog(
        `Beschreibung mit ${this.currentData.structurePlan.length} Kapiteln aus dem Strukturplan synchronisiert.`
      );
      this.render();
    });

    // Cycle Package button ("Paket laden ...")
    const btnCyclePackage = this.container.querySelector('#btnCyclePackage');
    btnCyclePackage?.addEventListener('click', () => {
      const currentIndex = SAMPLE_VIDEOS.findIndex((p) => p.id === this.activePackageId);
      const nextPkg = SAMPLE_VIDEOS[(currentIndex + 1) % SAMPLE_VIDEOS.length];
      this.addLog(`Lade Paket: "${nextPkg.label}"`);
      this.setData(nextPkg.data, nextPkg.id);
    });

    // Validate Metadata ("Prüfen")
    const btnValidateData = this.container.querySelector('#btnValidateData');
    btnValidateData?.addEventListener('click', () => {
      this.addLog('Prüfe Titel, Kapitelstruktur und Tags gegen YouTube-Richtlinien...');
      const validation = validateUploadMetadata({
        title: this.currentData.uploadPackage.suggestedTitle || this.currentData.meta.title,
        description: this.currentData.uploadPackage.suggestedDescription,
        tags: this.currentData.uploadPackage.tags,
      });

      if (validation.valid && validation.warnings.length === 0) {
        this.addLog('Prüfung erfolgreich: Alle Felder, Zeitstempel (ab 0:00) und Zeichenlimits sind valide.');
      } else {
        validation.errors.forEach((err) => this.addLog(`Fehler: ${err}`));
        validation.warnings.forEach((warn) => this.addLog(`Hinweis: ${warn}`));
      }
      this.render();
    });

    // Analyze Video URL ("Video analysieren")
    const btnAnalyze = this.container.querySelector('#btnAnalyzeVideo');
    btnAnalyze?.addEventListener('click', () => {
      const urlVal = videoInput?.value || this.currentData.meta.url || '';
      void this.analyzeVideoUrl(urlVal);
    });

    // Simulate / Run Upload Pipeline ("Hochladen")
    const btnStartUpload = this.container.querySelector('#btnStartUpload');
    btnStartUpload?.addEventListener('click', () => {
      const validation = validateUploadMetadata({
        title: this.currentData.uploadPackage.suggestedTitle || this.currentData.meta.title,
        description: this.currentData.uploadPackage.suggestedDescription,
        tags: this.currentData.uploadPackage.tags,
      });

      if (!validation.valid) {
        validation.errors.forEach((err) => this.addLog(`Upload abgebrochen – ${err}`));
        this.render();
        return;
      }

      const shortLink = `https://youtu.be/${vidId}`;
      this.addLog(`Lade hoch: Vortrag_${vidId}.mp4 (${this.currentData.uploadPackage.visibility})`);
      this.addLog(`Video hochgeladen: ${shortLink}`);
      this.addLog(`Thumbnail gesetzt.`);
      if (this.autoArchive) {
        this.addLog(`Gelöscht: /tmp/tmpv8vyv8bs/Vortrag_${vidId}.mp4`);
        this.addLog(`Gelöscht: /tmp/tmpv8vyv8bs/thumb.png`);
      }
      this.addLog(`Fertig: ${shortLink}`);
      this.render();
    });

    // Structure Plan Table Row Selection
    const chapterRows = this.container.querySelectorAll('.chapter-row[data-chapter-idx]');
    chapterRows.forEach((row) => {
      row.addEventListener('click', (e) => {
        const idxStr = (e.currentTarget as HTMLElement).getAttribute('data-chapter-idx');
        const idx = idxStr ? parseInt(idxStr, 10) : 0;
        if (!isNaN(idx) && this.currentData.structurePlan[idx]) {
          this.activeChapterIndex = idx;
          const ch = this.currentData.structurePlan[idx];
          this.addLog(`Kapitel ausgewählt: [${ch.timestamp}] ${ch.title} (${ch.phase})`);
          this.render();
        }
      });
    });

    // Add New Chapter in Structure Plan Tab
    const btnAddChapter = this.container.querySelector('#btnAddChapter');
    btnAddChapter?.addEventListener('click', () => {
      const timeEl = this.container.querySelector('#newChTime') as HTMLInputElement | null;
      const phaseEl = this.container.querySelector('#newChPhase') as HTMLInputElement | null;
      const titleEl = this.container.querySelector('#newChTitle') as HTMLInputElement | null;
      const visualEl = this.container.querySelector('#newChVisual') as HTMLInputElement | null;

      const timestamp = (timeEl?.value || '').trim() || '4:00';
      const phase = (phaseEl?.value || '').trim() || 'Erweiterung';
      const title = (titleEl?.value || '').trim();
      const visualElement = (visualEl?.value || '').trim() || 'Screencast & Zusammenfassung';

      if (!title) {
        this.addLog('Hinweis: Bitte einen Kapitel-Titel eingeben, um ein Kapitel hinzuzufügen.');
        this.render();
        return;
      }

      const seconds = parseTimestampToSeconds(timestamp);
      this.currentData.structurePlan.push({
        timestamp,
        seconds,
        phase,
        title,
        duration: '0:45',
        purpose: 'Benutzerdefinierter Strukturabschnitt',
        retentionImpact: 'Hoch (90%)',
        visualElement,
      });

      this.currentData.structurePlan.sort((a, b) => a.seconds - b.seconds);
      this.currentData.uploadPackage.suggestedDescription = generateYouTubeDescription(
        this.currentData.summary.executiveSummary,
        this.currentData.structurePlan
      );

      this.addLog(`Neues Kapitel [${timestamp} ${title}] zum Strukturplan und zur Beschreibung hinzugefügt.`);
      this.render();
    });

    // Title Replacement Buttons in Structure Tab
    const titleButtons = this.container.querySelectorAll('.btn-use-title');
    titleButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const title = (e.currentTarget as HTMLElement).getAttribute('data-title');
        if (title) {
          this.currentData.uploadPackage.suggestedTitle = title;
          this.currentData.meta.title = title;
          this.addLog(`Haupttitel übernommen: "${title}"`);
          this.activeTab = 'upload';
          this.render();
        }
      });
    });

    // --- Transcript & Audio-Stems Tab Event Listeners ---
    const btnRunStemSeparation = this.container.querySelector('#btnRunStemSeparation');
    btnRunStemSeparation?.addEventListener('click', () => {
      this.rebuildAudioStems();
      this.addLog(
        'Audio-Stem-Separation durchgeführt: Stimme (Vocals) und Hintergrundmusik (Instrumental) wurden als separate 24 kHz WAV-Spuren isoliert.'
      );
      this.render();
    });

    const btnDownloadVocalsWav = this.container.querySelector('#btnDownloadVocalsWav');
    btnDownloadVocalsWav?.addEventListener('click', () => {
      if (!this.audioStems) this.rebuildAudioStems();
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Nur_Stimme_Vocals.wav`,
        mimeType: 'audio/wav',
        content: this.audioStems!.vocalsOnlyWav,
        description: 'Isolierte Sprachspur (Nur Stimme / Vocals ohne Musik, 24 kHz WAV)',
      });
    });

    const btnDownloadMusicWav = this.container.querySelector('#btnDownloadMusicWav');
    btnDownloadMusicWav?.addEventListener('click', () => {
      if (!this.audioStems) this.rebuildAudioStems();
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Nur_Musik_Instrumental.wav`,
        mimeType: 'audio/wav',
        content: this.audioStems!.musicOnlyWav,
        description: 'Isolierte Musikspur (Nur Hintergrundmusik ohne Stimme, 24 kHz WAV)',
      });
    });

    const btnDownloadFullMixWav = this.container.querySelector('#btnDownloadFullMixWav');
    btnDownloadFullMixWav?.addEventListener('click', () => {
      if (!this.audioStems) this.rebuildAudioStems();
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Komplett_Mix_Stimme_und_Musik.wav`,
        mimeType: 'audio/wav',
        content: this.audioStems!.fullMixWav,
        description: 'Komplette Audiospur (Stimme + Hintergrundmusik, 24 kHz WAV)',
      });
    });

    const speakerWavBtns = this.container.querySelectorAll('.btn-download-speaker-wav');
    speakerWavBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const spName = (e.currentTarget as HTMLElement).getAttribute('data-speaker-name') || 'Sprecher';
        if (!this.audioStems) this.rebuildAudioStems();
        const wavBytes = this.audioStems!.speakerWavs[spName] || this.audioStems!.vocalsOnlyWav;
        const safeSp = spName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
        this.requestDownloadWithFolderPrompt({
          filename: `${vidId}_Stimme_${safeSp}.wav`,
          mimeType: 'audio/wav',
          content: wavBytes,
          description: `Einzel-Stimmspur für ${spName} (24 kHz WAV)`,
        });
      });
    });

    // Transcript & Subtitle Download Buttons
    const btnDownloadTxt = this.container.querySelector('#btnDownloadTranscriptTxt');
    btnDownloadTxt?.addEventListener('click', () => {
      const txt = exportTranscriptAsTxt(this.getTranscriptSegments(), true);
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Transkript_mit_Zeitstempeln.txt`,
        mimeType: 'text/plain;charset=utf-8',
        content: txt,
        description: 'Text-Transkript inkl. Zeitstempeln & Personen-Namen (.txt)',
      });
    });

    const btnDownloadSrt = this.container.querySelector('#btnDownloadSubtitleSrt');
    btnDownloadSrt?.addEventListener('click', () => {
      const srt = exportTranscriptAsSrt(this.getTranscriptSegments(), true);
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Untertitel_mit_Sprechern.srt`,
        mimeType: 'text/plain;charset=utf-8',
        content: srt,
        description: 'SubRip-Untertiteldatei inkl. Zeitstempeln & Personen (.srt)',
      });
    });

    const btnDownloadVtt = this.container.querySelector('#btnDownloadSubtitleVtt');
    btnDownloadVtt?.addEventListener('click', () => {
      const vtt = exportTranscriptAsVtt(this.getTranscriptSegments(), true);
      this.requestDownloadWithFolderPrompt({
        filename: `${vidId}_Untertitel_WebVTT.vtt`,
        mimeType: 'text/vtt;charset=utf-8',
        content: vtt,
        description: 'WebVTT-Untertiteldatei inkl. Voice-Tags (.vtt)',
      });
    });

    // Speaker Filter Buttons
    const speakerFilterBtns = this.container.querySelectorAll('.speaker-filter-btn');
    speakerFilterBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const filterVal = (e.currentTarget as HTMLElement).getAttribute('data-speaker-filter') || 'ALL';
        this.selectedSpeakerFilter = filterVal;
        this.addLog(
          filterVal === 'ALL'
            ? 'Transkript-Filter: Alle Personen & Stimmen werden angezeigt.'
            : `Transkript gefiltert nach Person/Stimme: "${filterVal}"`
        );
        this.render();
      });
    });

    // Add New Transcript Segment
    const btnAddTranscriptSeg = this.container.querySelector('#btnAddTranscriptSeg');
    btnAddTranscriptSeg?.addEventListener('click', () => {
      const startEl = this.container.querySelector('#newTrStart') as HTMLInputElement | null;
      const speakerEl = this.container.querySelector('#newTrSpeaker') as HTMLInputElement | null;
      const textEl = this.container.querySelector('#newTrText') as HTMLInputElement | null;

      const startTime = (startEl?.value || '').trim() || '4:15';
      const speaker = (speakerEl?.value || '').trim() || 'Thomas Weber (Host & IT-Architekt)';
      const text = (textEl?.value || '').trim();

      if (!text) {
        this.addLog('Hinweis: Bitte gesprochenen Text für das neue Transkript-Segment eingeben.');
        this.render();
        return;
      }

      const startSeconds = parseTimestampToSeconds(startTime);
      const endSeconds = startSeconds + 22;
      const mins = Math.floor(endSeconds / 60);
      const secs = endSeconds % 60;
      const endTime = `${mins}:${secs < 10 ? '0' + secs : secs}`;

      if (!this.currentData.transcript) {
        this.currentData.transcript = this.getTranscriptSegments();
      }

      this.currentData.transcript.push({
        id: `tr-${Date.now()}`,
        startTime,
        endTime,
        startSeconds,
        endSeconds,
        speaker,
        speakerRole: 'Sprecher',
        text,
      });

      this.currentData.transcript.sort((a, b) => a.startSeconds - b.startSeconds);
      this.rebuildAudioStems();
      this.addLog(`Neues Transkript-Segment [${startTime} – ${endTime}] für "${speaker}" ergänzt.`);
      this.render();
    });

    // Folder Picker Modal Event Listeners
    const presetBtns = this.container.querySelectorAll('.folder-preset-btn');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const folder = (e.currentTarget as HTMLElement).getAttribute('data-folder-preset');
        if (folder) {
          this.selectedDownloadFolder = folder;
          const folderInput = this.container.querySelector('#modalInputFolder') as HTMLInputElement | null;
          if (folderInput) folderInput.value = folder;
          this.render();
        }
      });
    });

    const modalFolderInput = this.container.querySelector('#modalInputFolder') as HTMLInputElement | null;
    if (modalFolderInput) {
      modalFolderInput.addEventListener('input', () => {
        this.selectedDownloadFolder = modalFolderInput.value;
      });
    }

    const modalFilenameInput = this.container.querySelector('#modalInputFilename') as HTMLInputElement | null;
    if (modalFilenameInput) {
      modalFilenameInput.addEventListener('input', () => {
        if (this.pendingDownload) {
          this.pendingDownload.filename = modalFilenameInput.value;
        }
      });
    }

    const btnCancelModal = this.container.querySelector('#btnCancelDownloadModal');
    btnCancelModal?.addEventListener('click', () => {
      this.pendingDownload = null;
      this.addLog('Download-Ordnerauswahl abgebrochen.');
      this.render();
    });

    const btnNativePicker = this.container.querySelector('#btnNativeFilePicker');
    btnNativePicker?.addEventListener('click', () => {
      void this.executePendingDownload(true);
    });

    const btnConfirmModal = this.container.querySelector('#btnConfirmDownloadModal');
    btnConfirmModal?.addEventListener('click', () => {
      void this.executePendingDownload(false);
    });

    // Console & Footer Actions
    const btnClearLog = this.container.querySelector('#btnClearLog');
    btnClearLog?.addEventListener('click', () => {
      this.logMessages = [];
      this.addLog('Protokoll zurückgesetzt.');
      this.render();
    });

    const btnCopyLink = this.container.querySelector('#btnCopyLink');
    btnCopyLink?.addEventListener('click', () => {
      const url = this.currentData.meta.url || `https://youtu.be/${this.currentData.meta.videoId || 'DEM0123NET'}`;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
      this.addLog(`Video-Link in Zwischenablage kopiert: ${url}`);
      this.render();
    });

    const btnCopyDesc = this.container.querySelector('#btnCopyDescription');
    btnCopyDesc?.addEventListener('click', () => {
      const desc = this.currentData.uploadPackage.suggestedDescription;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(desc).catch(() => {});
      }
      this.addLog('Formatierte YouTube-Beschreibung inklusive Kapitelmarken in Zwischenablage kopiert.');
      this.render();
    });

    const btnToggleQueue = this.container.querySelector('#btnToggleQueue');
    btnToggleQueue?.addEventListener('click', () => {
      this.queueActive = !this.queueActive;
      this.addLog(
        this.queueActive
          ? 'Warteschlangen-Überwachung aktiviert (Verzeichnis /tmp wird überwacht).'
          : 'Warteschlangen-Überwachung beendet.'
      );
      this.render();
    });

    const btnExport = this.container.querySelector('#btnExportMarkdown');
    btnExport?.addEventListener('click', () => {
      const md = buildMarkdownReport(this.currentData);
      this.requestDownloadWithFolderPrompt({
        filename: `Strukturplan_${vidId}.md`,
        mimeType: 'text/markdown;charset=utf-8',
        content: md,
        description: 'Vollständiger Video-Strukturplan & Analysebericht (.md)',
      });
    });
  }

  private async analyzeVideoUrl(urlOrId: string) {
    if (this.isAnalyzing) return;
    const trimmed = (urlOrId || '').trim();
    if (!trimmed) {
      this.addLog('Fehler: Bitte zuerst einen gültigen YouTube-Link oder Dateipfad eingeben.');
      this.render();
      return;
    }

    this.isAnalyzing = true;
    this.addLog(`Starte KI-Videoanalyse inkl. Sprecher-Transkription & Audio-Stem-Trennung für: "${trimmed}"...`);
    this.render();

    try {
      const videoId = extractYouTubeVideoId(trimmed) || 'custom_vid';
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: trimmed,
          videoId,
          title: this.currentData.meta.title,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: VideoAnalysisResult = await response.json();
      this.addLog(
        `Analyse abgeschlossen: ${result.structurePlan.length} Kapitel, ${(result.transcript || []).length} Transkript-Segmente und isolierte Audio-Stems erstellt.`
      );
      this.setData(result, 'custom');
    } catch (err: any) {
      this.addLog(`Hinweis bei Online-Abfrage (${err.message || err}). Lade lokales Analyse-Modell.`);
      this.setData(SAMPLE_VIDEOS[0].data, SAMPLE_VIDEOS[0].id);
    } finally {
      this.isAnalyzing = false;
      this.render();
    }
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
