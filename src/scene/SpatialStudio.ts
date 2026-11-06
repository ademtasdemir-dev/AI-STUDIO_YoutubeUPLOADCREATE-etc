import * as THREE from 'three';
import * as xb from 'xrblocks';
import { VideoAnalysisResult } from '../types';

export class SpatialStudio extends xb.Script {
  private currentData: VideoAnalysisResult | null = null;
  private screenMesh?: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>;
  private screenCanvas?: HTMLCanvasElement;
  private screenTexture?: THREE.CanvasTexture;
  private leftCard?: xb.UICard;
  private centerCard?: xb.UICard;
  private rightCard?: xb.UICard;
  private activeChapterIndex: number = 0;

  // Center card text elements
  private titleText?: xb.UIText;
  private authorText?: xb.UIText;
  private summaryText?: xb.UIText;
  private scoreText?: xb.UIText;

  // Left card container
  private chapterContainer?: xb.UIPanel;
  private chapterDetailText?: xb.UIText;

  // Right card text elements
  private pacingText?: xb.UIText;
  private visualStyleText?: xb.UIText;
  private audioQualityText?: xb.UIText;
  private hookText?: xb.UIText;

  init() {
    this.setupLighting();
    this.createVirtualCinemaScreen();
    this.createSpatialCards();
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1a2233, 2.5);
    this.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0x60a5fa, 2.0);
    dirLight.position.set(0, 3, 2);
    this.add(dirLight);

    // Subtle studio floor ring
    const ringGeo = new THREE.RingGeometry(1.2, 2.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    this.add(ringMesh);
  }

  private createVirtualCinemaScreen() {
    // Curved screen geometry representing holographic video preview
    const radius = 2.4;
    const height = 0.9;
    const segments = 48;
    const thetaLength = Math.PI * 0.42;
    const thetaStart = Math.PI * 0.5 - thetaLength / 2;

    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      segments,
      1,
      true,
      thetaStart,
      thetaLength
    );

    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 512;
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.colorSpace = THREE.SRGBColorSpace;

    this.renderScreenTexture('Bereit zur Videoanalyse', 'Wähle ein Video oder füge einen YouTube-Link ein');

    const material = new THREE.MeshStandardMaterial({
      map: this.screenTexture,
      roughness: 0.25,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    this.screenMesh = new THREE.Mesh(geometry, material);
    this.screenMesh.position.set(0, 1.85, 0);
    this.add(this.screenMesh);
  }

  private renderScreenTexture(mainTitle: string, subtitle: string) {
    if (!this.screenCanvas || !this.screenTexture) return;
    const ctx = this.screenCanvas.getContext('2d');
    if (!ctx) return;

    // Background gradient (Studio Cyber look)
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Glowing framing lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 1024 - 36, 512 - 36);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, 90);
    ctx.lineTo(1024 - 18, 90);
    ctx.stroke();

    // Top status bar
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('🔴 YOUTUBE STRUKTUR- & INHALTS-STUDIO', 40, 58);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('GEMINI 4 ARGON DEEP-ANALYSIS', 700, 58);

    // Main title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, sans-serif';
    const words = mainTitle.split(' ');
    let line = '';
    let y = 170;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 920 && n > 0) {
        ctx.fillText(line, 50, y);
        line = words[n] + ' ';
        y += 48;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 50, y);

    // Subtitle
    ctx.fillStyle = '#38bdf8';
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillText(subtitle, 50, y + 60);

    // Active Chapter indicator at bottom
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fillRect(50, 410, 924, 60);
    ctx.strokeStyle = '#0284c7';
    ctx.strokeRect(50, 410, 924, 60);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px system-ui, sans-serif';
    const chapterName =
      this.currentData?.structurePlan[this.activeChapterIndex]?.title ||
      'Kapitel-Strukturplan wird synchronisiert';
    const timestamp =
      this.currentData?.structurePlan[this.activeChapterIndex]?.timestamp ||
      '0:00';
    ctx.fillText(`⏱ Kapitel [${timestamp}]: ${chapterName}`, 70, 448);

    this.screenTexture.needsUpdate = true;
  }

  private createSpatialCards() {
    // 1. Left Card: Strukturplan & Kapitel-Timeline
    this.chapterContainer = new xb.UIPanel({
      style: {
        width: '100%',
        flexDirection: 'column',
        gap: 6,
      },
    });

    this.chapterDetailText = new xb.UIText({
      text: 'Wähle ein Kapitel für Detail-Einblicke.',
      style: {
        fontSize: 14,
        color: '#94a3b8',
        backgroundColor: '#0f172a',
        padding: 10,
        borderRadius: 8,
      },
    });

    this.leftCard = new xb.UICard({
      size: { width: 0.62, height: 0.66 },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
      },
      children: [
        new xb.UIPanel({
          style: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          },
          children: [
            new xb.UIIcon({
              icon: 'format_list_numbered',
              style: { width: 28, height: 28, color: '#38bdf8' },
            }),
            new xb.UIText({
              text: 'Strukturplan & Kapitel',
              style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
            }),
          ],
        }),
        this.chapterContainer,
        this.chapterDetailText,
      ],
    });
    this.leftCard.position.set(-0.75, 1.35, -1.1);
    this.leftCard.rotation.y = 0.28;
    this.add(this.leftCard);

    // 2. Center Card: Inhalt, Executive Summary & Key Takeaways
    this.titleText = new xb.UIText({
      text: 'Kein Video geladen',
      style: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
    });

    this.authorText = new xb.UIText({
      text: 'Bereit zur Analyse',
      style: { fontSize: 14, color: '#38bdf8' },
    });

    this.scoreText = new xb.UIText({
      text: 'Score: --/10',
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4ade80',
        backgroundColor: '#14532d',
        padding: 6,
        borderRadius: 6,
      },
    });

    this.summaryText = new xb.UIText({
      text: 'Füge einen YouTube-Link in das Menü ein oder klicke auf "Paket laden", um das Video komplett in Inhalt, visueller Darstellung und Dramaturgie aufzuschlüsseln.',
      style: {
        fontSize: 14,
        lineHeight: 1.4,
        color: '#e2e8f0',
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        padding: 12,
        borderRadius: 10,
      },
    });

    this.centerCard = new xb.UICard({
      size: { width: 0.68, height: 0.66 },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
      },
      children: [
        new xb.UIPanel({
          style: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          children: [
            new xb.UIPanel({
              style: { flexDirection: 'column', gap: 2 },
              children: [this.titleText, this.authorText],
            }),
            this.scoreText,
          ],
        }),
        new xb.UIText({
          text: 'INHALTLICHE KERN-SYNTHESE',
          style: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8' },
        }),
        this.summaryText,
        new xb.UIPanel({
          style: { flexDirection: 'row', gap: 10, marginTop: 10 },
          children: [
            new xb.UIButton({
              label: 'Kapitel vor',
              icon: 'skip_next',
              style: { flexGrow: 1 },
              onClick: () => this.stepChapter(1),
            }),
            new xb.UIButton({
              label: 'Kapitel zurück',
              icon: 'skip_previous',
              style: { flexGrow: 1 },
              onClick: () => this.stepChapter(-1),
            }),
          ],
        }),
      ],
    });
    this.centerCard.position.set(0, 1.35, -1.2);
    this.add(this.centerCard);

    // 3. Right Card: Darstellung & YouTube-Optimierung
    this.visualStyleText = new xb.UIText({
      text: 'Format: Analyse bereit',
      style: { fontSize: 13, color: '#e2e8f0' },
    });

    this.pacingText = new xb.UIText({
      text: 'Pacing: --',
      style: { fontSize: 13, color: '#e2e8f0' },
    });

    this.audioQualityText = new xb.UIText({
      text: 'Audio: --',
      style: { fontSize: 13, color: '#e2e8f0' },
    });

    this.hookText = new xb.UIText({
      text: 'Hook: --',
      style: { fontSize: 13, color: '#e2e8f0' },
    });

    this.rightCard = new xb.UICard({
      size: { width: 0.62, height: 0.66 },
      manipulation: true,
      edge: true,
      style: {
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
      },
      children: [
        new xb.UIPanel({
          style: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          },
          children: [
            new xb.UIIcon({
              icon: 'video_settings',
              style: { width: 28, height: 28, color: '#38bdf8' },
            }),
            new xb.UIText({
              text: 'Darstellung & Regie',
              style: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
            }),
          ],
        }),
        new xb.UIPanel({
          style: {
            flexDirection: 'column',
            gap: 8,
            backgroundColor: '#0f172a',
            padding: 12,
            borderRadius: 8,
          },
          children: [
            new xb.UIText({
              text: 'VISUELLE MACHART & KAMERA',
              style: { fontSize: 12, fontWeight: 'bold', color: '#38bdf8' },
            }),
            this.visualStyleText,
            new xb.UIText({
              text: 'PACING & SCHNITTFREQUENZ',
              style: { fontSize: 12, fontWeight: 'bold', color: '#38bdf8' },
            }),
            this.pacingText,
            new xb.UIText({
              text: 'AUDIO & SPRECHER',
              style: { fontSize: 12, fontWeight: 'bold', color: '#38bdf8' },
            }),
            this.audioQualityText,
            new xb.UIText({
              text: 'HOOK (0-30 SEKUNDEN)',
              style: { fontSize: 12, fontWeight: 'bold', color: '#38bdf8' },
            }),
            this.hookText,
          ],
        }),
      ],
    });
    this.rightCard.position.set(0.75, 1.35, -1.1);
    this.rightCard.rotation.y = -0.28;
    this.add(this.rightCard);
  }

  public updateAnalysis(data: VideoAnalysisResult) {
    this.currentData = data;
    this.activeChapterIndex = 0;

    // Update cinema screen
    this.renderScreenTexture(data.meta.title, `Autor: ${data.meta.author} · Dauer: ${data.meta.estimatedDuration || '4:12'}`);

    // Update center card
    if (this.titleText) {
      this.titleText.text = data.meta.title.length > 38 ? data.meta.title.slice(0, 35) + '…' : data.meta.title;
    }
    if (this.authorText) {
      this.authorText.text = `${data.meta.author} · ${data.meta.category || 'Tech & Education'}`;
    }
    if (this.scoreText) {
      this.scoreText.text = `Score: ${data.meta.overallRating ?? 9.2}/10`;
    }
    if (this.summaryText) {
      this.summaryText.text = `${data.summary.headline}\n\n${data.summary.executiveSummary}`;
    }

    // Update left card (Chapters)
    if (this.chapterContainer) {
      // Clear previous buttons
      (this.chapterContainer as any).children = [];
      const chaptersToShow = data.structurePlan.slice(0, 5);

      chaptersToShow.forEach((chapter, index) => {
        const btn = new xb.UIButton({
          label: `${chapter.timestamp} - ${chapter.title.slice(0, 26)}`,
          icon: 'play_arrow',
          style: {
            width: '100%',
            backgroundColor: index === 0 ? '#0284c7' : 'rgba(30, 41, 59, 0.7)',
          },
          onClick: () => this.selectChapter(index),
        });
        this.chapterContainer?.add(btn);
      });
    }

    this.selectChapter(0);

    // Update right card (Presentation)
    if (this.visualStyleText) {
      this.visualStyleText.text = data.presentationAnalysis.visualStyle;
    }
    if (this.pacingText) {
      this.pacingText.text = data.presentationAnalysis.pacingAndTempo;
    }
    if (this.audioQualityText) {
      this.audioQualityText.text = data.presentationAnalysis.audioQuality;
    }
    if (this.hookText) {
      this.hookText.text = data.dramaturgy.hookAnalysis;
    }
  }

  public selectChapter(index: number) {
    if (!this.currentData || !this.currentData.structurePlan[index]) return;
    this.activeChapterIndex = index;
    const ch = this.currentData.structurePlan[index];

    if (this.chapterDetailText) {
      this.chapterDetailText.text = `Phase: ${ch.phase}\nZweck: ${ch.purpose || 'Hauptinhalt'}\nVisuell: ${ch.visualElement || 'Screencast / B-Roll'}\nRetention: ${ch.retentionImpact || 'Hoch'}`;
    }

    this.renderScreenTexture(
      this.currentData.meta.title,
      `Aktives Kapitel [${ch.timestamp}]: ${ch.title}`
    );
  }

  public stepChapter(delta: number) {
    if (!this.currentData) return;
    const len = this.currentData.structurePlan.length;
    if (len === 0) return;
    const next = (this.activeChapterIndex + delta + len) % len;
    this.selectChapter(next);
  }

  update() {
    // Subtle breathing animation on virtual screen
    if (this.screenMesh) {
      const time = performance.now() * 0.001;
      this.screenMesh.position.y = 1.85 + Math.sin(time) * 0.012;
    }
  }

  dispose() {
    this.screenMesh?.geometry.dispose();
    this.screenMesh?.material.dispose();
    this.screenTexture?.dispose();
  }
}
