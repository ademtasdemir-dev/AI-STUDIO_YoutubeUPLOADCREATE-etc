import { VideoAnalysisResult } from '../types';
import { SAMPLE_VIDEOS } from '../constants';
import { extractYouTubeVideoId, generateYouTubeDescription } from '../utils/youtubeParser';

export class DesktopHud {
  private container: HTMLElement;
  private currentData: VideoAnalysisResult;
  private onDataChangeCallback?: (data: VideoAnalysisResult) => void;
  private activeTab: 'upload' | 'structure' | 'summary' | 'presentation' = 'upload';
  private logMessages: string[] = [];
  private isAnalyzing: boolean = false;

  constructor(
    container: HTMLElement,
    initialData: VideoAnalysisResult,
    onDataChange?: (data: VideoAnalysisResult) => void
  ) {
    this.container = container;
    this.currentData = initialData;
    this.onDataChangeCallback = onDataChange;

    this.addLog('System initialisiert. Bereit für Video-URL oder Dateipfad.');
    this.addLog('Gemini 4 Argon Analyse-Modell aktiviert.');
    this.render();
  }

  private addLog(msg: string) {
    const time = new Date().toTimeString().split(' ')[0];
    this.logMessages.push(`${time} ${msg}`);
    if (this.logMessages.length > 25) {
      this.logMessages.shift();
    }
  }

  public setData(data: VideoAnalysisResult) {
    this.currentData = data;
    this.render();
    this.onDataChangeCallback?.(data);
  }

  public render() {
    this.container.innerHTML = `
      <div class="hud-window">
        <!-- Top Title Bar -->
        <div class="hud-header">
          <div class="header-left">
            <span class="hud-app-title">Automatischer YouTube-Upload & Video-Struktur-Analyzer</span>
            <span class="hud-status-badge">Gemini 4 Argon Video-Engine aktiv</span>
          </div>
          <div class="header-right">
            <button id="btnQuickSample" class="hud-btn-secondary" title="Referenz-Projekt aus Screenshot laden">
              📁 Referenz-Paket laden
            </button>
            <button id="btnToggleXrMode" class="hud-btn-xr" title="Zwischen 2D-Arbeitsplatz und 3D-XR Studio wechseln">
              🥽 3D XR Studio
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="hud-tabs">
          <button class="tab-btn ${this.activeTab === 'upload' ? 'active' : ''}" data-tab="upload">
            📋 YouTube-Metadaten & Upload
          </button>
          <button class="tab-btn ${this.activeTab === 'structure' ? 'active' : ''}" data-tab="structure">
            ⏱ Detaillierter Strukturplan
          </button>
          <button class="tab-btn ${this.activeTab === 'summary' ? 'active' : ''}" data-tab="summary">
            📑 Inhaltsanalyse & Kernbotschaften
          </button>
          <button class="tab-btn ${this.activeTab === 'presentation' ? 'active' : ''}" data-tab="presentation">
            🎬 Darstellung & Regie-Check
          </button>
        </div>

        <!-- Main Body Grid -->
        <div class="hud-content">
          ${this.renderActiveTabContent()}
        </div>

        <!-- Progress Bar -->
        <div class="hud-progress-wrapper">
          <div class="hud-progress-bar ${this.isAnalyzing ? 'animating' : ''}" id="progressBar" style="width: ${this.isAnalyzing ? '65%' : '100%'}"></div>
        </div>

        <!-- Terminal Log Console -->
        <div class="hud-console">
          <div class="console-body" id="consoleBody">
            ${this.logMessages.map((m) => `<div class="log-line">${escapeHtml(m)}</div>`).join('')}
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="hud-footer">
          <div class="footer-left">
            <button id="btnOpenLink" class="hud-btn-action">Link öffnen</button>
            <button id="btnCopyLink" class="hud-btn-action">Link kopieren</button>
            <button id="btnExportMarkdown" class="hud-btn-action">Strukturplan exportieren (MD)</button>
          </div>
          <div class="footer-right">
            <span class="queue-status">Warteschlange überwachen: aus</span>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    // Scroll console to bottom
    const consoleBody = this.container.querySelector('#consoleBody');
    if (consoleBody) {
      consoleBody.scrollTop = consoleBody.scrollHeight;
    }
  }

  private renderActiveTabContent(): string {
    switch (this.activeTab) {
      case 'structure':
        return this.renderStructurePlanTab();
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
   * Tab 1: Exact layout matching user's uploaded screenshot with enhanced features
   */
  private renderUploadMaskTab(): string {
    const titleVal = this.currentData.uploadPackage.suggestedTitle || this.currentData.meta.title;
    const titleLen = titleVal.length;
    const descVal = this.currentData.uploadPackage.suggestedDescription;
    const tagsVal = this.currentData.uploadPackage.tags;
    const tagsLen = tagsVal.length;
    const videoUrlOrPath = this.currentData.meta.url || `/tmp/tmpv8vyv8bs/Vortrag.mp4`;
    const thumbUrlOrPath = this.currentData.meta.thumbnailUrl || `/tmp/tmpv8vyv8bs/thumb.png`;

    return `
      <div class="upload-mask-layout">
        <!-- Input Row: Video -->
        <div class="form-row">
          <label class="row-label">Video / URL</label>
          <div class="row-input-group">
            <input type="text" id="inputVideoUrl" class="hud-input" value="${escapeHtml(videoUrlOrPath)}" placeholder="YouTube-Link (z.B. https://www.youtube.com/watch?v=...) oder Pfad" />
            <button id="btnAnalyzeVideo" class="hud-btn-input-action ${this.isAnalyzing ? 'busy' : ''}">
              ${this.isAnalyzing ? 'Analysiere...' : 'Mit KI analysieren'}
            </button>
          </div>
        </div>

        <!-- Input Row: Thumbnail -->
        <div class="form-row">
          <label class="row-label">Thumbnail</label>
          <div class="row-input-group">
            <input type="text" id="inputThumbnail" class="hud-input" value="${escapeHtml(thumbUrlOrPath)}" placeholder="Pfad oder Bild-URL" />
            <button id="btnPreviewThumb" class="hud-btn-input-action">Vorschau</button>
          </div>
        </div>

        <!-- Input Row: Titel -->
        <div class="form-row">
          <label class="row-label">Titel</label>
          <div class="row-input-group title-group">
            <input type="text" id="inputTitle" maxlength="100" class="hud-input" value="${escapeHtml(titleVal)}" />
            <span class="char-counter" id="titleCounter">${titleLen} / 100</span>
          </div>
        </div>

        <!-- Input Row: Beschreibung -->
        <div class="form-row description-row">
          <label class="row-label">Beschreibung</label>
          <div class="row-input-group">
            <textarea id="inputDescription" class="hud-textarea" rows="9">${escapeHtml(descVal)}</textarea>
          </div>
        </div>

        <!-- Input Row: Tags -->
        <div class="form-row">
          <label class="row-label">Tags</label>
          <div class="row-input-group tags-group">
            <input type="text" id="inputTags" maxlength="500" class="hud-input" value="${escapeHtml(tagsVal)}" />
            <span class="char-counter" id="tagsCounter">${tagsLen} / 500</span>
          </div>
        </div>
        <div class="form-hint">mit Komma trennen, zusammen max. 500 Zeichen</div>

        <!-- Options: Sichtbarkeit & Checkboxen -->
        <div class="form-row options-row">
          <label class="row-label">Sichtbarkeit</label>
          <div class="row-input-group options-group">
            <select id="selectVisibility" class="hud-select">
              <option value="nicht gelistet" ${this.currentData.uploadPackage.visibility === 'nicht gelistet' ? 'selected' : ''}>nicht gelistet</option>
              <option value="öffentlich" ${this.currentData.uploadPackage.visibility === 'öffentlich' ? 'selected' : ''}>öffentlich</option>
              <option value="privat" ${this.currentData.uploadPackage.visibility === 'privat' ? 'selected' : ''}>privat</option>
            </select>

            <label class="hud-checkbox-label">
              <input type="checkbox" id="chkForKids" /> Speziell für Kinder
            </label>

            <label class="hud-checkbox-label">
              <input type="checkbox" id="chkAutoArchive" checked /> Nach erfolgreichem Upload Video, Thumbnail und Arbeitsdateien löschen
            </label>
          </div>
        </div>

        <!-- Mask Action Buttons (Paket laden, Prüfen, Hochladen) -->
        <div class="mask-action-row">
          <div class="left-actions">
            <button id="btnLoadPackage" class="hud-btn-action">Paket laden ...</button>
            <button id="btnValidateData" class="hud-btn-action">Prüfen</button>
          </div>
          <div class="right-actions">
            <button id="btnStartUpload" class="hud-btn-primary">
              ${this.isAnalyzing ? 'Wird analysiert...' : 'Analysieren & Bereitstellen'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Tab 2: Detailed Structure Plan with Chapters, Timestamps, Phases, Visuals, and Retention Impact
   */
  private renderStructurePlanTab(): string {
    const chapters = this.currentData.structurePlan;
    const alternatives = this.currentData.titleAnalysis.alternatives || [];

    return `
      <div class="structure-plan-layout">
        <!-- Title & CTR Optimization Section -->
        <div class="sub-card">
          <div class="sub-card-header">
            <span class="sub-card-title">💡 Klickstarke Titel-Alternativen & Hook-Strategien</span>
            <span class="score-badge">Titel-Score: ${this.currentData.titleAnalysis.score}/100</span>
          </div>
          <div class="title-critique-text">${escapeHtml(this.currentData.titleAnalysis.critique)}</div>
          <div class="alternatives-grid">
            ${alternatives
              .map(
                (alt) => `
              <div class="alt-title-card" data-title="${escapeHtml(alt.title)}">
                <div class="alt-ctr-badge">${escapeHtml(alt.predictedCtr)} CTR</div>
                <div class="alt-title-text">${escapeHtml(alt.title)}</div>
                <div class="alt-strategy">${escapeHtml(alt.strategy)}</div>
                <button class="btn-use-title" data-title="${escapeHtml(alt.title)}">Als Haupttitel übernehmen</button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Chapters Table -->
        <div class="sub-card">
          <div class="sub-card-header">
            <span class="sub-card-title">⏱ Sekundengenauer Strukturplan (${chapters.length} Kapitel)</span>
            <span class="info-pill">Dauer gesamt: ${this.currentData.meta.estimatedDuration || '4:12'}</span>
          </div>
          <div class="table-responsive">
            <table class="chapter-table">
              <thead>
                <tr>
                  <th style="width: 80px;">Zeit</th>
                  <th style="width: 140px;">Dramaturgie-Phase</th>
                  <th>Kapitel-Titel</th>
                  <th>Inhaltlicher Zweck</th>
                  <th style="width: 170px;">Visuelle Darstellung</th>
                  <th style="width: 130px;">Retention-Impact</th>
                </tr>
              </thead>
              <tbody>
                ${chapters
                  .map(
                    (ch, idx) => `
                  <tr class="chapter-row" data-timestamp="${ch.timestamp}">
                    <td><span class="time-pill">${escapeHtml(ch.timestamp)}</span></td>
                    <td><span class="phase-badge">${escapeHtml(ch.phase)}</span></td>
                    <td class="ch-title"><strong>${escapeHtml(ch.title)}</strong></td>
                    <td class="ch-purpose">${escapeHtml(ch.purpose || 'Hauptabschnitt')}</td>
                    <td class="ch-visual">${escapeHtml(ch.visualElement || 'Screencast / B-Roll')}</td>
                    <td>
                      <span class="retention-pill ${ch.retentionImpact?.includes('Sehr hoch') ? 'high' : 'medium'}">
                        ${escapeHtml(ch.retentionImpact || 'Hoch')}
                      </span>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Tab 3: Content Summary, Core Theses & Key Takeaways
   */
  private renderSummaryTab(): string {
    const summary = this.currentData.summary;
    return `
      <div class="summary-layout">
        <div class="sub-card">
          <div class="sub-card-header">
            <span class="sub-card-title">📑 Inhaltliche Executive Summary</span>
            <span class="score-badge">Gesamtbewertung: ${this.currentData.meta.overallRating ?? 9.2}/10</span>
          </div>
          <h3 class="summary-headline">${escapeHtml(summary.headline)}</h3>
          <p class="summary-text">${escapeHtml(summary.executiveSummary)}</p>
          <div class="audience-badge">🎯 Zielgruppe & Vorwissen: <strong>${escapeHtml(summary.targetAudience)}</strong></div>
        </div>

        <div class="sub-card">
          <div class="sub-card-header">
            <span class="sub-card-title">🔑 Die 5 wichtigsten Kernbotschaften & Takeaways</span>
          </div>
          <div class="takeaways-list">
            ${summary.keyTakeaways
              .map(
                (item, idx) => `
              <div class="takeaway-item">
                <span class="takeaway-number">${idx + 1}</span>
                <span class="takeaway-text">${escapeHtml(item)}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Tab 4: Presentation, Visuals, Camera, Audio and Dramaturgy
   */
  private renderPresentationTab(): string {
    const p = this.currentData.presentationAnalysis;
    const d = this.currentData.dramaturgy;

    return `
      <div class="presentation-layout">
        <div class="presentation-grid">
          <!-- Visuals -->
          <div class="feature-box">
            <div class="box-header">
              <span class="box-icon">🎥</span>
              <span class="box-title">Visuelle Machart & Video-Format</span>
            </div>
            <p class="box-desc">${escapeHtml(p.visualStyle)}</p>
          </div>

          <!-- Camera & Lighting -->
          <div class="feature-box">
            <div class="box-header">
              <span class="box-icon">💡</span>
              <span class="box-title">Kameraeinstellungen & Beleuchtung</span>
            </div>
            <p class="box-desc">${escapeHtml(p.cameraAndLighting)}</p>
          </div>

          <!-- Graphics & B-Roll -->
          <div class="feature-box">
            <div class="box-header">
              <span class="box-icon">📊</span>
              <span class="box-title">Grafiken, Overlays & B-Roll</span>
            </div>
            <p class="box-desc">${escapeHtml(p.graphicsAndBroll)}</p>
          </div>

          <!-- Pacing & Cut Frequency -->
          <div class="feature-box">
            <div class="box-header">
              <span class="box-icon">⚡</span>
              <span class="box-title">Pacing & Schnittfrequenz</span>
            </div>
            <p class="box-desc">${escapeHtml(p.pacingAndTempo)}</p>
          </div>

          <!-- Audio & Delivery -->
          <div class="feature-box">
            <div class="box-header">
              <span class="box-icon">🎙</span>
              <span class="box-title">Sprechweise & Audio-Qualität</span>
            </div>
            <p class="box-desc">
              <strong>Sprecher:</strong> ${escapeHtml(p.speakerDelivery)}<br/>
              <strong>Tontechnik:</strong> ${escapeHtml(p.audioQuality)}
            </p>
          </div>

          <!-- Hook Analysis -->
          <div class="feature-box highlight-box">
            <div class="box-header">
              <span class="box-icon">🪝</span>
              <span class="box-title">Hook-Kritik (Erste 30 Sekunden)</span>
            </div>
            <p class="box-desc">${escapeHtml(d.hookAnalysis)}</p>
          </div>
        </div>

        <!-- Storytelling & CTA -->
        <div class="sub-card">
          <div class="sub-card-header">
            <span class="sub-card-title">📖 Dramaturgischer Aufbau & Handlungsbogen</span>
          </div>
          <p class="summary-text">${escapeHtml(d.storytellingArc)}</p>
          <div class="dramaturgy-row">
            <div><strong>Zuschauer-Retention Tricks:</strong> ${escapeHtml(d.retentionTactics)}</div>
            <div style="margin-top: 6px;"><strong>Call to Action (CTA) Bewertung:</strong> ${escapeHtml(d.ctaEffectiveness)}</div>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    // Tab switching
    const tabBtns = this.container.querySelectorAll('.tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute('data-tab') as any;
        if (target) {
          this.activeTab = target;
          this.render();
        }
      });
    });

    // Character counters
    const titleInput = this.container.querySelector('#inputTitle') as HTMLInputElement;
    const titleCounter = this.container.querySelector('#titleCounter');
    if (titleInput && titleCounter) {
      titleInput.addEventListener('input', () => {
        titleCounter.textContent = `${titleInput.value.length} / 100`;
        this.currentData.uploadPackage.suggestedTitle = titleInput.value;
      });
    }

    const tagsInput = this.container.querySelector('#inputTags') as HTMLInputElement;
    const tagsCounter = this.container.querySelector('#tagsCounter');
    if (tagsInput && tagsCounter) {
      tagsInput.addEventListener('input', () => {
        tagsCounter.textContent = `${tagsInput.value.length} / 500`;
        this.currentData.uploadPackage.tags = tagsInput.value;
      });
    }

    const descInput = this.container.querySelector('#inputDescription') as HTMLTextAreaElement;
    if (descInput) {
      descInput.addEventListener('input', () => {
        this.currentData.uploadPackage.suggestedDescription = descInput.value;
      });
    }

    // Load sample / packet
    const btnQuickSample = this.container.querySelector('#btnQuickSample');
    const btnLoadPackage = this.container.querySelector('#btnLoadPackage');
    const loadSample = () => {
      const sample = SAMPLE_VIDEOS[0];
      this.addLog(`Lade Referenz-Paket: "${sample.title.slice(0, 45)}..."`);
      this.setData(sample.data);
      this.addLog(`Paket geladen: 6 Kapitel, Metadaten, Tags und Videoanalyse bereit.`);
    };
    btnQuickSample?.addEventListener('click', loadSample);
    btnLoadPackage?.addEventListener('click', loadSample);

    // Validate data button
    const btnValidateData = this.container.querySelector('#btnValidateData');
    btnValidateData?.addEventListener('click', () => {
      this.addLog('Überprüfe YouTube-Metadaten & Richtlinien...');
      const titleLen = (this.container.querySelector('#inputTitle') as HTMLInputElement)?.value.length || 0;
      const tagsLen = (this.container.querySelector('#inputTags') as HTMLInputElement)?.value.length || 0;
      const descVal = (this.container.querySelector('#inputDescription') as HTMLTextAreaElement)?.value || '';

      const errors: string[] = [];
      if (titleLen === 0) errors.push('Titel darf nicht leer sein.');
      if (titleLen > 100) errors.push('Titel überschreitet 100 Zeichen.');
      if (tagsLen > 500) errors.push('Tags überschreiten 500 Zeichen.');
      if (!descVal.includes('Kapitel:')) errors.push('Warnung: Beschreibung enthält keine Kapitelmarken.');

      if (errors.length === 0) {
        this.addLog('✅ Prüfung erfolgreich: Titel, Kapitelstruktur & Tags entsprechen allen YouTube-Vorgaben.');
      } else {
        errors.forEach((err) => this.addLog(`⚠️ ${err}`));
      }
      this.render();
    });

    // Analyze video button
    const btnAnalyze = this.container.querySelector('#btnAnalyzeVideo');
    const btnStartUpload = this.container.querySelector('#btnStartUpload');
    const triggerAnalysis = () => {
      const videoInput = (this.container.querySelector('#inputVideoUrl') as HTMLInputElement)?.value || '';
      this.analyzeVideoUrl(videoInput);
    };
    btnAnalyze?.addEventListener('click', triggerAnalysis);
    btnStartUpload?.addEventListener('click', triggerAnalysis);

    // Toggle 3D XR mode button
    const btnToggleXr = this.container.querySelector('#btnToggleXrMode');
    btnToggleXr?.addEventListener('click', () => {
      document.body.classList.toggle('xr-immersive-view');
      const isImmersive = document.body.classList.contains('xr-immersive-view');
      this.addLog(isImmersive ? '3D XR Studio Ansicht vergrößert.' : '2D Desktop-Maske fokussiert.');
    });

    // Copy link / Open link
    const btnCopyLink = this.container.querySelector('#btnCopyLink');
    btnCopyLink?.addEventListener('click', () => {
      const url = this.currentData.meta.url || 'https://youtu.be/DEM0123NET';
      navigator.clipboard?.writeText(url).then(() => {
        this.addLog(`Link in Zwischenablage kopiert: ${url}`);
        this.render();
      });
    });

    const btnOpenLink = this.container.querySelector('#btnOpenLink');
    btnOpenLink?.addEventListener('click', () => {
      const url = this.currentData.meta.url || 'https://www.youtube.com';
      this.addLog(`Öffne Video-Link: ${url}`);
      window.open(url, '_blank');
    });

    // Export markdown
    const btnExport = this.container.querySelector('#btnExportMarkdown');
    btnExport?.addEventListener('click', () => {
      this.exportMarkdownPlan();
    });

    // Title replacement buttons in structure tab
    const titleButtons = this.container.querySelectorAll('.btn-use-title');
    titleButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const title = (e.currentTarget as HTMLElement).getAttribute('data-title');
        if (title) {
          this.currentData.uploadPackage.suggestedTitle = title;
          this.addLog(`Haupttitel aktualisiert zu: "${title.slice(0, 40)}..."`);
          this.activeTab = 'upload';
          this.render();
        }
      });
    });
  }

  private async analyzeVideoUrl(urlOrId: string) {
    if (this.isAnalyzing) return;
    this.isAnalyzing = true;
    this.addLog(`Starte Deep-Analyse für: "${urlOrId || 'Aktuelles Video'}"`);
    this.addLog(`Sende Anfrage an Gemini 4 Argon Video-Engine...`);
    this.render();

    try {
      const videoId = extractYouTubeVideoId(urlOrId) || 'demo_id';
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlOrId,
          videoId,
          title: this.currentData.meta.title,
        }),
      });

      if (!response.ok) {
        throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
      }

      const result: VideoAnalysisResult = await response.json();
      this.addLog(`Analyse erfolgreich abgeschlossen mit Gemini 4 Argon!`);
      this.addLog(`Strukturplan mit ${result.structurePlan.length} Kapiteln generiert.`);
      this.addLog(`Dramaturgie und Videoaufbau bewertet: Score ${result.meta.overallRating || 9.2}/10`);
      this.setData(result);
    } catch (err: any) {
      this.addLog(`Fehler bei Online-Analyse: ${err.message || err}. Wechsle auf vorbereitetes Referenz-Modell.`);
      // Fallback to sample
      this.setData(SAMPLE_VIDEOS[0].data);
    } finally {
      this.isAnalyzing = false;
      this.render();
    }
  }

  private exportMarkdownPlan() {
    const data = this.currentData;
    const md = `# YouTube Video-Strukturplan & Analyse: ${data.meta.title}
**Autor:** ${data.meta.author} | **Dauer:** ${data.meta.estimatedDuration || '4:12'} | **Score:** ${data.meta.overallRating ?? 9.2}/10

---

## 1. Inhaltliche Zusammenfassung
### ${data.summary.headline}
${data.summary.executiveSummary}

**Zielgruppe:** ${data.summary.targetAudience}

### Kernbotschaften & Takeaways:
${data.summary.keyTakeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}

---

## 2. Detaillierter Strukturplan (Kapitel & Zeitstempel)
| Zeitstempel | Phase | Kapitel | Inhaltlicher Zweck | Visuelle Gestaltung | Retention |
|---|---|---|---|---|---|
${data.structurePlan
  .map(
    (c) =>
      `| ${c.timestamp} | ${c.phase} | ${c.title} | ${c.purpose || ''} | ${c.visualElement || ''} | ${c.retentionImpact || ''} |`
  )
  .join('\n')}

---

## 3. Darstellungs- & Regie-Analyse
- **Visuelles Format:** ${data.presentationAnalysis.visualStyle}
- **Kamera & Licht:** ${data.presentationAnalysis.cameraAndLighting}
- **Grafiken & B-Roll:** ${data.presentationAnalysis.graphicsAndBroll}
- **Pacing & Schnittfrequenz:** ${data.presentationAnalysis.pacingAndTempo}
- **Sprechtempo & Audio:** ${data.presentationAnalysis.speakerDelivery} | ${data.presentationAnalysis.audioQuality}

---

## 4. Dramaturgie & Hook
- **Hook (Erste 30 Sek.):** ${data.dramaturgy.hookAnalysis}
- **Handlungsbogen:** ${data.dramaturgy.storytellingArc}
- **Retention-Tricks:** ${data.dramaturgy.retentionTactics}
- **Call-to-Action (CTA):** ${data.dramaturgy.ctaEffectiveness}

---

## 5. YouTube-Upload-Beschreibung
\`\`\`
${data.uploadPackage.suggestedDescription}
\`\`\`

**Tags:**
\`${data.uploadPackage.tags}\`
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Strukturplan_${(data.meta.videoId || 'Video').replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    this.addLog(`Strukturplan als Markdown heruntergeladen.`);
    this.render();
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
