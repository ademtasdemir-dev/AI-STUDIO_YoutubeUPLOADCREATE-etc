import { VideoAnalysisResult } from './types';

const SVG_THUMB_NETWORK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg1)"/>
    <g stroke="#334155" stroke-width="1">
      <line x1="0" y1="90" x2="800" y2="90"/>
      <line x1="0" y1="180" x2="800" y2="180"/>
      <line x1="0" y1="270" x2="800" y2="270"/>
      <line x1="0" y1="360" x2="800" y2="360"/>
      <line x1="160" y1="0" x2="160" y2="450"/>
      <line x1="320" y1="0" x2="320" y2="450"/>
      <line x1="480" y1="0" x2="480" y2="450"/>
      <line x1="640" y1="0" x2="640" y2="450"/>
    </g>
    <rect x="60" y="65" width="210" height="110" rx="8" fill="#0284c7" opacity="0.2" stroke="#38bdf8" stroke-width="2"/>
    <text x="84" y="105" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">VLAN 10 · CAD / BIM</text>
    <text x="84" y="135" fill="#cbd5e1" font-family="monospace" font-size="14">10.10.10.0/24 · 10GbE</text>
    <rect x="530" y="65" width="210" height="110" rx="8" fill="#0d9488" opacity="0.2" stroke="#2dd4bf" stroke-width="2"/>
    <text x="554" y="105" fill="#2dd4bf" font-family="sans-serif" font-size="16" font-weight="bold">NAS · RAID 6 ARRAY</text>
    <text x="554" y="135" fill="#cbd5e1" font-family="monospace" font-size="14">8x 16TB · Dual Parity</text>
    <line x1="270" y1="120" x2="530" y2="120" stroke="#38bdf8" stroke-width="3" stroke-dasharray="8 6"/>
    <text x="60" y="295" fill="#f8fafc" font-family="sans-serif" font-size="34" font-weight="bold">Netzwerk &amp; Backup Architektur</text>
    <text x="60" y="340" fill="#94a3b8" font-family="sans-serif" font-size="22">VLANs · RAID 6 · Hardware-Firewall · 20 Clients</text>
  </svg>`);

const SVG_THUMB_AI_AGENTS =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#27272a"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#bg2)"/>
    <circle cx="200" cy="145" r="52" fill="#3b82f6" opacity="0.18" stroke="#60a5fa" stroke-width="2"/>
    <text x="165" y="150" fill="#93c5fd" font-family="monospace" font-size="15" font-weight="bold">PLANNING</text>
    <circle cx="400" cy="145" r="52" fill="#10b981" opacity="0.18" stroke="#34d399" stroke-width="2"/>
    <text x="366" y="150" fill="#6ee7b7" font-family="monospace" font-size="15" font-weight="bold">MEMORY</text>
    <circle cx="600" cy="145" r="52" fill="#f59e0b" opacity="0.18" stroke="#fbbf24" stroke-width="2"/>
    <text x="572" y="150" fill="#fde68a" font-family="monospace" font-size="15" font-weight="bold">TOOLS</text>
    <line x1="252" y1="145" x2="348" y2="145" stroke="#71717a" stroke-width="2"/>
    <line x1="452" y1="145" x2="548" y2="145" stroke="#71717a" stroke-width="2"/>
    <text x="60" y="295" fill="#fafafa" font-family="sans-serif" font-size="34" font-weight="bold">Autonome KI-Agenten verstehen</text>
    <text x="60" y="340" fill="#a1a1aa" font-family="sans-serif" font-size="22">ReAct-Loops · Tool-Calling · Vektor-Gedächtnis</text>
  </svg>`);

const SVG_THUMB_CLEAN_CODE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <rect width="800" height="450" fill="#090d16"/>
    <rect x="60" y="55" width="680" height="160" rx="8" fill="#111827" stroke="#374151" stroke-width="2"/>
    <text x="85" y="95" fill="#34d399" font-family="monospace" font-size="16">export async function analyzePipeline(url: string) {</text>
    <text x="105" y="128" fill="#93c5fd" font-family="monospace" font-size="16">const chapters = await extractChapters(url);</text>
    <text x="105" y="161" fill="#f9a8d4" font-family="monospace" font-size="16">return synthesizeStructure(chapters);</text>
    <text x="85" y="192" fill="#34d399" font-family="monospace" font-size="16">}</text>
    <text x="60" y="295" fill="#f9fafb" font-family="sans-serif" font-size="34" font-weight="bold">TypeScript &amp; Clean Architecture</text>
    <text x="60" y="340" fill="#9ca3af" font-family="sans-serif" font-size="22">Modularisierung · Unit-Testing · Skalierbares Design</text>
  </svg>`);

export const SAMPLE_VIDEOS: Array<{
  id: string;
  label: string;
  url: string;
  videoId: string;
  title: string;
  data: VideoAnalysisResult;
}> = [
  {
    id: 'network-backup',
    label: 'Netzwerk & Backup im Architekturbüro (Referenz)',
    url: 'https://www.youtube.com/watch?v=DEM0123NET',
    videoId: 'DEM0123NET',
    title: 'Netzwerk & Backup im Architekturbüro – VLANs, RAID 6, Firewall einfach erklärt',
    data: {
      meta: {
        title: 'Netzwerk & Backup im Architekturbüro – VLANs, RAID 6, Firewall einfach erklärt',
        author: 'IT-Infrastruktur & Systemhaus Praxis',
        category: 'Bildung / IT-Infrastruktur',
        estimatedDuration: '4:12 Min.',
        overallRating: 9.2,
        thumbnailUrl: SVG_THUMB_NETWORK,
        videoId: 'DEM0123NET',
        url: 'https://www.youtube.com/watch?v=DEM0123NET',
        analyzedAt: new Date().toISOString(),
      },
      titleAnalysis: {
        currentTitle: 'Netzwerk & Backup im Architekturbüro – VLANs, RAID 6, Firewall einfach erklärt',
        score: 88,
        critique: 'Sehr starker Fachbezug mit klarer Branchen-Zielgruppe (Architekturbüro) und den drei wichtigsten Technologiestichworten (VLAN, RAID 6, Firewall). Hohe Suchintention.',
        alternatives: [
          {
            title: 'So planen Profis IT-Infrastruktur: VLANs, RAID 6 & Firewall im Praxistest',
            strategy: 'Experten-Framing & Praxis-Fokus (+24% CTR)',
            predictedCtr: '+24%',
          },
          {
            title: '20 Arbeitsplätze absichern: Das perfekte Backup- & Netzwerkkonzept',
            strategy: 'Problemorientierte Skalierung (+19% CTR)',
            predictedCtr: '+19%',
          },
          {
            title: 'Architekturbüro vor Datenverlust schützen (VLAN, RAID 6 & USV Setup)',
            strategy: 'Loss Aversion & Risikobewusstsein (+15% CTR)',
            predictedCtr: '+15%',
          },
        ],
      },
      summary: {
        headline: 'Ganzheitliche IT-Infrastruktur-Konzeption für anspruchsvolle CAD-Arbeitsumgebungen',
        executiveSummary:
          'Das Video liefert eine strukturierte Schritt-für-Schritt-Anleitung zur Dimensionierung und Absicherung eines Firmennetzwerks mit 20 Arbeitsplätzen. Besonderer Fokus liegt auf der strikten Segmentierung sensibler Datenbereiche mittels VLANs, der Ausfallsicherheit von NAS-Systemen durch RAID 6 und redundante Stromversorgungen (USV) sowie einer dreistufigen Backup-Strategie (3-2-1-Regel).',
        keyTakeaways: [
          'VLAN-Segmentierung verhindert unbefugten Datenabfluss zwischen Gastnetz, Verwaltung und CAD-Projektarbeit.',
          'RAID 6 bietet doppelten Plattenausfallschutz und ist für große CAD/BIM-Datenmengen unverzichtbar.',
          '100 GB Dateiübertragungen erfordern min. 10 Gbit/s Uplinks zum zentralen NAS, um Engpässe zu vermeiden.',
          'Eine hardwarebasierte Firewall mit DPI (Deep Packet Inspection) sichert externe VPN-Zugänge für Bauleiter vor Ort.',
          'Automatisierte Offsite-Backups schützen vor Ransomware und physischen Gefahren (Brand/Diebstahl).',
        ],
        targetAudience: 'Fachinformatiker (FISI), IT-Administratoren, Architekten und Büroinhaber mit Eigenregie.',
      },
      structurePlan: [
        {
          timestamp: '0:00',
          seconds: 0,
          phase: 'Hook & Problemstellung',
          title: 'Port- und Bandbreitenplanung',
          duration: '0:38',
          purpose: 'Einstieg mit Worst-Case-Szenario: Netzwerkausfall während einer Bauabgabe. Definition der Anforderungen für 20 Clients.',
          retentionImpact: 'Sehr hoch (95%)',
          visualElement: 'Sprecher (Talking Head) wechselt zu animierter Topologie-Grafik mit Datenstrom-Visualisierung.',
        },
        {
          timestamp: '0:38',
          seconds: 38,
          phase: 'Segmentierung & Architektur',
          title: 'IP-Konzept und VLANs',
          duration: '0:35',
          purpose: 'Trennung in Management-, CAD-, Gäste- und IoT-Netzwerk. Demonstration der Subnetzmasken.',
          retentionImpact: 'Hoch (88%)',
          visualElement: 'Farbcodierte Switch-Port-Matrix und Routing-Tabelle im Splitscreen.',
        },
        {
          timestamp: '1:13',
          seconds: 73,
          phase: 'Zentrale Datenspeicherung',
          title: 'Zentrale Datenablage und Backup',
          duration: '0:38',
          purpose: 'Vergleich RAID 5 vs. RAID 6 bei 8-Bay NAS Systemen. Erläuterung der Rebuild-Gefahr.',
          retentionImpact: 'Sehr hoch (92%)',
          visualElement: '3D-Explosionsgrafik der Festplatten-Arrays mit Paritäts-Berechnung.',
        },
        {
          timestamp: '1:51',
          seconds: 111,
          phase: 'Engpassanalyse',
          title: 'Drei Engpassanalysen',
          duration: '0:47',
          purpose: 'Analyse von Switch-Backplane-Limits, langsamen HDDs und fehlerhaften Cat.5e Verkabelungen.',
          retentionImpact: 'Mittel (84%)',
          visualElement: 'Benchmark-Diagramm (I/O Latenzen) mit Hervorhebung der Spitzenlasten.',
        },
        {
          timestamp: '2:38',
          seconds: 158,
          phase: 'Praxis-Benchmark',
          title: '100 GB übertragen',
          duration: '0:36',
          purpose: 'Live-Transfer eines Autodesk Revit Projekts: 1 Gbit vs. 10 Gbit Verbindung im Zeitvergleich.',
          retentionImpact: 'Sehr hoch (94%)',
          visualElement: 'Side-by-Side Fortschrittsbalken mit Stoppuhr und Übertragungsraten.',
        },
        {
          timestamp: '3:14',
          seconds: 194,
          phase: 'Security & Outro',
          title: 'Sicherheit, Verfügbarkeit und Datenschutz',
          duration: '0:58',
          purpose: 'Firewall-Regeln, USV-Überbrückungszeit und 3-2-1 Backup-Regel. Zusammenfassung und Checkliste zum Download.',
          retentionImpact: 'Hoch (89%)',
          visualElement: 'Übersichtliche Zusammenfassungs-Card mit Download-Hinweis und Abspann-Verlinkung.',
        },
      ],
      speakers: [
        {
          id: 'spk-1',
          name: 'Thomas Weber (Host & IT-Architekt)',
          role: 'Hauptsprecher / Moderator',
          voiceCharacteristics: 'Bariton, ruhig, sachlich, 142 WPM',
        },
        {
          id: 'spk-2',
          name: 'Julia Albrecht (Büroleitung Architektur)',
          role: 'Praxis-Interviewpartnerin',
          voiceCharacteristics: 'Mezzosopran, klar, praxisorientiert, 148 WPM',
        },
        {
          id: 'spk-3',
          name: 'Markus König (Security Engineer)',
          role: 'Gast-Experte für Firewall & RAID',
          voiceCharacteristics: 'Tenor, präzise, analytisch, 138 WPM',
        },
      ],
      transcript: [
        {
          id: 't-1',
          startTime: '0:00',
          endTime: '0:19',
          startSeconds: 0,
          endSeconds: 19,
          speaker: 'Thomas Weber (Host & IT-Architekt)',
          speakerRole: 'Hauptsprecher / Moderator',
          text: 'Stellt euch vor: Freitagmittag, 14 Uhr, die Bauabgabe für ein großes Wohnprojekt läuft – und plötzlich steht das gesamte Netzwerk im Architekturbüro still. Genau deshalb planen wir heute eine ausfallsichere Infrastruktur für 20 CAD-Arbeitsplätze.',
        },
        {
          id: 't-2',
          startTime: '0:19',
          endTime: '0:38',
          startSeconds: 19,
          endSeconds: 38,
          speaker: 'Julia Albrecht (Büroleitung Architektur)',
          speakerRole: 'Praxis-Interviewpartnerin',
          text: 'Bei uns arbeiten 20 Architekten gleichzeitig an bis zu 100 Gigabyte großen BIM- und 3D-Modellen. Wenn zwei Leute gleichzeitig rendern oder synchronisieren, darf das restliche Büro auf keinen Fall blockiert werden.',
        },
        {
          id: 't-3',
          startTime: '0:38',
          endTime: '1:13',
          startSeconds: 38,
          endSeconds: 73,
          speaker: 'Thomas Weber (Host & IT-Architekt)',
          speakerRole: 'Hauptsprecher / Moderator',
          text: 'Um dieses Problem sauber zu lösen, trennen wir das Netz in vier strikte VLANs: VLAN 10 für die CAD-Workstations mit 10-Gigabit-Anbindung, VLAN 20 für Verwaltung und Buchhaltung, VLAN 30 für Gäste-WLAN und VLAN 40 für Drucker und Gebäudetechnik.',
        },
        {
          id: 't-4',
          startTime: '1:13',
          endTime: '1:51',
          startSeconds: 73,
          endSeconds: 111,
          speaker: 'Markus König (Security Engineer)',
          speakerRole: 'Gast-Experte für Firewall & RAID',
          text: 'Für die zentrale Datenablage setzen wir auf ein 8-Bay Enterprise-NAS im RAID-6-Verbund. Warum RAID 6 statt RAID 5? Bei großen 16-Terabyte-Festplatten dauert ein Rebuild nach einem Ausfall oft über 24 Stunden. Fällt in dieser Zeit eine zweite Platte aus, schützt nur die doppelte Parität von RAID 6 vor dem Totalverlust.',
        },
        {
          id: 't-5',
          startTime: '1:51',
          endTime: '2:38',
          startSeconds: 111,
          endSeconds: 158,
          speaker: 'Thomas Weber (Host & IT-Architekt)',
          speakerRole: 'Hauptsprecher / Moderator',
          text: 'Schauen wir uns die drei häufigsten Flaschenhälse im Alltag an: Erstens ein unterdimensionierter 1-Gigabit-Uplink zwischen Switch und NAS, zweitens fehlender SSD-Read/Write-Cache für kleine Projektdateien und drittens veraltete Cat.5e-Patchkabel in den Bodentanks.',
        },
        {
          id: 't-6',
          startTime: '2:38',
          endTime: '3:14',
          startSeconds: 158,
          endSeconds: 194,
          speaker: 'Julia Albrecht (Büroleitung Architektur)',
          speakerRole: 'Praxis-Interviewpartnerin',
          text: 'Im direkten Vergleich sieht man den Unterschied sofort: Die 100-Gigabyte-Projektübertragung dauerte vorher über 15 Minuten – über den neuen 10-Gigabit-Glasfaser-Trunk zum NAS sind wir in knapp 95 Sekunden komplett fertig.',
        },
        {
          id: 't-7',
          startTime: '3:14',
          endTime: '4:12',
          startSeconds: 194,
          endSeconds: 252,
          speaker: 'Markus König (Security Engineer)',
          speakerRole: 'Gast-Experte für Firewall & RAID',
          text: 'Zum Abschluss sichern wir das System nach der 3-2-1-Backup-Regel ab: Tägliche unveränderbare Snapshots lokal, ein nächtliches verschlüsseltes Offsite-Backup in ein zweites Brandabschnitt-Rechenzentrum und eine Hardware-Firewall mit WireGuard-VPN für die Bauleiter auf der Baustelle.',
        },
      ],
      presentationAnalysis: {
        visualStyle: 'Professionelles Erklär- und Tutorial-Format mit starker technischer Glaubwürdigkeit.',
        cameraAndLighting: '3-Punkt-Beleuchtung mit kaltweißem Key-Light und blauem Akzentlicht. Klare 4K-Kopffreiheit.',
        graphicsAndBroll: 'Hochwertige Vektor-Diagramme, flüssige Callouts und synchrone Maus-Hervorhebungen. Keine störenden Effekte.',
        speakerDelivery: 'Präzise, souveräne Aussprache ohne Füllwörter. Drei klar unterscheidbare Stimmen im Dialog.',
        pacingAndTempo: 'Strukturierte Schnitte alle 4 bis 7 Sekunden verhindern visuelle Ermüdung und halten die Aufmerksamkeit hoch.',
        audioQuality: 'Broadcast-Mikrofonierung mit Nahbesprechungseffekt, subtiler Raumhall-Unterdrückung und dezenter Lo-Fi Hintergrundmusik.',
      },
      dramaturgy: {
        hookAnalysis: 'Die ersten 10 Sekunden etablieren sofort das reale Schmerzproblem (Datenverlust kurz vor Deadline) und versprechen die direkte Lösung.',
        storytellingArc: 'Klassischer Heldenweg des Administrators: Problem -> Architekturplan -> Härtetest -> Gelöster Endzustand mit Sicherheitsgarantie.',
        retentionTactics: 'Pattern Interrupts durch visuelle Benchmarks bei Minute 2:38 fangen das typische Zuschauer-Mittagstief perfekt ab.',
        ctaEffectiveness: 'Der Call-to-Action verweist auf eine kostenlose Netzplan-Vorlage in der Beschreibung – extrem hohe Conversion-Wahrscheinlichkeit.',
      },
      uploadPackage: {
        suggestedTitle: 'Netzwerk & Backup im Architekturbüro – VLANs, RAID 6, Firewall einfach erklärt',
        suggestedDescription: `IT-Infrastruktur für ein Architekturbüro mit 20 Arbeitsplätzen: Netzwerk, VLANs, NAS mit RAID 6, Backup-Konzept, Engpässe und Sicherheit.

Kapitel:
0:00 Port- und Bandbreitenplanung
0:38 IP-Konzept und VLANs
1:13 Zentrale Datenablage und Backup
1:51 Drei Engpassanalysen
2:38 100 GB übertragen
3:14 Sicherheit, Verfügbarkeit und Datenschutz

Wichtige Links & Ressourcen:
• Checkliste & Netzwerkplan als PDF herunterladen
• Empfohlene Hardware-Komponenten (NAS, 10G-Switch, USV)

Abonniere den Kanal für wöchentliche Praxis-Tutorials zu Systemintegration und Netzwerksicherheit!`,
        tags: 'Netzwerkplanung, IT-Infrastruktur, VLAN, RAID 6, Backup, Firewall, Fachinformatiker, FISI, NAS, Architekturbüro, 10GbE, Datensicherheit',
        visibility: 'nicht gelistet',
        audience: 'Nicht speziell für Kinder (Fachpublikum)',
      },
    },
  },
  {
    id: 'ai-agents-explained',
    label: 'KI-Agenten & Autonome Workflows erklärt',
    url: 'https://www.youtube.com/watch?v=ai_agents_gemini',
    videoId: 'ai_agents_gemini',
    title: 'Autonome KI-Agenten verstehen: Architektur, Reasoning & Praxis-Anwendung',
    data: {
      meta: {
        title: 'Autonome KI-Agenten verstehen: Architektur, Reasoning & Praxis-Anwendung',
        author: 'AI Engineering Academy',
        category: 'Technologie & Wissenschaft',
        estimatedDuration: '6:45 Min.',
        overallRating: 9.5,
        thumbnailUrl: SVG_THUMB_AI_AGENTS,
        videoId: 'ai_agents_gemini',
        url: 'https://www.youtube.com/watch?v=ai_agents_gemini',
        analyzedAt: new Date().toISOString(),
      },
      titleAnalysis: {
        currentTitle: 'Autonome KI-Agenten verstehen: Architektur, Reasoning & Praxis-Anwendung',
        score: 91,
        critique: 'Hohe thematische Dichte, spricht Software-Architekten und Entwickler zielgerichtet an.',
        alternatives: [
          {
            title: 'Wie KI-Agenten wirklich denken: ReAct, Tools & Memory visualisiert',
            strategy: 'Visuelle Versprechung & konkrete Architektur-Termini',
            predictedCtr: '+28%',
          },
          {
            title: 'Vergiss normale Chatbots: So bauen Entwickler echte KI-Agenten',
            strategy: 'Provokativer Kontrast & Upgrade-Motivation',
            predictedCtr: '+22%',
          },
        ],
      },
      summary: {
        headline: 'Vom stochastischen Papagei zum zielgerichteten Agenten-System',
        executiveSummary:
          'Der Beitrag dekonstruiert den Aufbau autonomer Agenten in vier fundamentale Säulen: Profiling, Memory (kurz- und langzeit), Planning (Reflexion, Sub-Goal Decomposition) und Action (Tool Execution). Anhand anschaulicher Codebeispiele wird gezeigt, wie LLMs mit APIs interagieren.',
        keyTakeaways: [
          'Agenten sind mehr als Prompts: Sie benötigen Zustandsspeicher und Fehlertoleranz-Schleifen.',
          'ReAct-Framework kombiniert Gedanken (Thought) mit Aktionen (Action) und Beobachtungen (Observation).',
          'Langzeitgedächtnis über Vektordatenbanken reduziert Halluzinationen dramatisch.',
        ],
        targetAudience: 'Softwareentwickler, KI-Interessierte, Product Owner.',
      },
      structurePlan: [
        {
          timestamp: '0:00',
          seconds: 0,
          phase: 'Hook',
          title: 'Warum einfache Chatbots ausgedient haben',
          duration: '0:45',
          purpose: 'Veranschaulichung der Grenzen traditioneller Prompts.',
          retentionImpact: 'Sehr hoch (96%)',
          visualElement: 'Schneller Animationsschnitt: Chatbot scheitert vs. Agent führt 5 Schritte autonom aus.',
        },
        {
          timestamp: '0:45',
          seconds: 45,
          phase: 'Konzept',
          title: 'Die 4 Kernbausteine eines Agenten',
          duration: '1:30',
          purpose: 'Übersicht über Memory, Planning, Tools und Execution.',
          retentionImpact: 'Hoch (90%)',
          visualElement: 'Interaktives Architektur-Schema mit Knotenpunkten.',
        },
        {
          timestamp: '2:15',
          seconds: 135,
          phase: 'Deep Dive',
          title: 'Planning & Reasoning: Der ReAct-Loop',
          duration: '2:10',
          purpose: 'Schritt-für-Schritt Durchlauf einer Multi-Turn API Interaktion.',
          retentionImpact: 'Sehr hoch (93%)',
          visualElement: 'Live-Terminal mit farbigen Log-Ausgaben und Syntax-Highlighting.',
        },
        {
          timestamp: '4:25',
          seconds: 265,
          phase: 'Praxis-Demo',
          title: 'Vermeidung von Endlosschleifen & Guardrails',
          duration: '1:20',
          purpose: 'Sicherheitsmechanismen und Budget-Limits im Produktiveinsatz.',
          retentionImpact: 'Mittel (86%)',
          visualElement: 'Flowchart mit Entscheidungspfaden und Exception Handling.',
        },
        {
          timestamp: '5:45',
          seconds: 345,
          phase: 'Fazit & CTA',
          title: 'Zukunftsausblick und Open-Source Boilerplate',
          duration: '1:00',
          purpose: 'Zusammenfassung und Verlinkung zum GitHub-Repo.',
          retentionImpact: 'Hoch (88%)',
          visualElement: 'Repo-Vorschau und Abspann-Verlinkung.',
        },
      ],
      speakers: [
        {
          id: 'spk-a1',
          name: 'Dr. Elena Rostova (AI Lead)',
          role: 'Hauptsprecherin',
          voiceCharacteristics: 'Klar, dynamisch, 155 WPM',
        },
        {
          id: 'spk-a2',
          name: 'David Chen (Backend Engineer)',
          role: 'Co-Moderator / Live-Coder',
          voiceCharacteristics: 'Ruhig, fokussiert, 145 WPM',
        },
      ],
      transcript: [
        {
          id: 'ta-1',
          startTime: '0:00',
          endTime: '0:45',
          startSeconds: 0,
          endSeconds: 45,
          speaker: 'Dr. Elena Rostova (AI Lead)',
          speakerRole: 'Hauptsprecherin',
          text: 'Was wäre, wenn euer Sprachmodell nicht nur Text ausgibt, sondern eigenständig Fehler im Code findet, Tests ausführt und den Patch verifiziert? Genau hier beginnt die Welt autonomer KI-Agenten.',
        },
        {
          id: 'ta-2',
          startTime: '0:45',
          endTime: '2:15',
          startSeconds: 45,
          endSeconds: 135,
          speaker: 'Dr. Elena Rostova (AI Lead)',
          speakerRole: 'Hauptsprecherin',
          text: 'Jeder produktionsreife Agent besteht aus vier Komponenten: Dem System-Profil, dem Kurz- und Langzeitgedächtnis, der Planungs-Engine und den ausführbaren Werkzeugen.',
        },
        {
          id: 'ta-3',
          startTime: '2:15',
          endTime: '4:25',
          startSeconds: 135,
          endSeconds: 265,
          speaker: 'David Chen (Backend Engineer)',
          speakerRole: 'Co-Moderator / Live-Coder',
          text: 'In unserem Terminal sehen wir den ReAct-Zyklus live: Der Agent formuliert erst seine Hypothese, ruft dann gezielt die Datenbank-API auf und wertet das JSON-Ergebnis im nächsten Schritt aus.',
        },
        {
          id: 'ta-4',
          startTime: '4:25',
          endTime: '6:45',
          startSeconds: 265,
          endSeconds: 405,
          speaker: 'Dr. Elena Rostova (AI Lead)',
          speakerRole: 'Hauptsprecherin',
          text: 'Damit ein Agent niemals in einer teuren Endlosschleife hängen bleibt, definieren wir strikte Iterations-Budgets und Validierungs-Guardrails vor jedem API-Aufruf.',
        },
      ],
      presentationAnalysis: {
        visualStyle: 'Modernes Tech-Explainer Format mit klarer Code-Visualisierung.',
        cameraAndLighting: 'Kino-Optik mit geringer Tiefenschärfe (f/1.8) und neutralem Key-Light.',
        graphicsAndBroll: 'Spezifisch für das Video gerenderte Systemdiagramme statt generischer Stock-Footage.',
        speakerDelivery: 'Dynamisch, engagiert, ca. 155 WPM im Wechsel zwischen zwei Fachleuten.',
        pacingAndTempo: 'Keine Längen; alle 5-6 Sekunden wechselnde Bildelemente.',
        audioQuality: 'Glasklare Podcast-Mikrofonie mit dezentem Hintergrund-Soundtrack.',
      },
      dramaturgy: {
        hookAnalysis: 'Herausragender Hook: Stellt sofort die provokante Frage: "Was wenn dein Code sich selbst repariert?".',
        storytellingArc: 'Problemstellung -> Entzauberung des Hypes -> Konkreter Bauplan -> Ermutigung zum Selbstbauen.',
        retentionTactics: 'Code-Snippets werden schrittweise aufgedeckt, was zum Dranbleiben animiert.',
        ctaEffectiveness: 'Kostenloses GitHub Starter-Template als starker Lead-Magnet.',
      },
      uploadPackage: {
        suggestedTitle: 'Autonome KI-Agenten verstehen: Architektur, Reasoning & Praxis-Anwendung',
        suggestedDescription: `So funktionieren autonome KI-Agenten wirklich: Von ReAct-Loops bis zum Langzeitgedächtnis.

Kapitel:
0:00 Warum einfache Chatbots ausgedient haben
0:45 Die 4 Kernbausteine eines Agenten
2:15 Planning & Reasoning: Der ReAct-Loop
4:25 Vermeidung von Endlosschleifen & Guardrails
5:45 Zukunftsausblick und Open-Source Boilerplate

Links:
• GitHub Repository & Starter-Kit
• Discord Community für AI Engineers`,
        tags: 'KI Agenten, Artificial Intelligence, LLM, Gemini, ReAct, Autonome Systeme, Python, Softwarearchitektur, Machine Learning',
        visibility: 'öffentlich',
        audience: 'Für Entwickler & Technik-Interessierte',
      },
    },
  },
  {
    id: 'clean-code-ts',
    label: 'TypeScript & Clean Architecture Masterclass',
    url: 'https://www.youtube.com/watch?v=ts_clean_arch',
    videoId: 'ts_clean_arch',
    title: 'TypeScript in großen Projekten: Clean Architecture & automatisiertes Testing',
    data: {
      meta: {
        title: 'TypeScript in großen Projekten: Clean Architecture & automatisiertes Testing',
        author: 'DevCraft Deutschland',
        category: 'Softwareentwicklung',
        estimatedDuration: '8:20 Min.',
        overallRating: 9.0,
        thumbnailUrl: SVG_THUMB_CLEAN_CODE,
        videoId: 'ts_clean_arch',
        url: 'https://www.youtube.com/watch?v=ts_clean_arch',
        analyzedAt: new Date().toISOString(),
      },
      titleAnalysis: {
        currentTitle: 'TypeScript in großen Projekten: Clean Architecture & automatisiertes Testing',
        score: 86,
        critique: 'Klare Positionierung für fortgeschrittene Entwickler und Tech-Leads.',
        alternatives: [
          {
            title: 'Nie wieder Spaghetti-Code: Unser TypeScript-Setup für 100.000 Zeilen',
            strategy: 'Konkreter Maßstab & Schmerzpunkt-Lösung',
            predictedCtr: '+21%',
          },
          {
            title: 'Warum 90% aller TypeScript-Tests fehlschlagen (und wie du es besser machst)',
            strategy: 'Fehlervermeidung & Praxis-Relevanz',
            predictedCtr: '+17%',
          },
        ],
      },
      summary: {
        headline: 'Strikte Trennung von Geschäftslogik und UI für wartbare Web-Applikationen',
        executiveSummary:
          'Das Video demonstriert am Beispiel einer realen Web-Anwendung, wie reine Logik-Module von DOM-Komponenten entkoppelt und mit schnellen Unit-Tests abgesichert werden, bevor ein Deployment oder GitHub-Release erfolgt.',
        keyTakeaways: [
          'Geschäftslogik gehört in reine Funktionen ohne direkte DOM-Abhängigkeiten.',
          'Deterministische Unit-Tests laufen in Millisekunden und fangen Regressionsfehler sofort ab.',
          'Strikte TypeScript-Interfaces verhindern Laufzeitfehler an API-Grenzen.',
        ],
        targetAudience: 'Frontend- & Full-Stack-Entwickler, Software-Architekten.',
      },
      structurePlan: [
        {
          timestamp: '0:00',
          seconds: 0,
          phase: 'Hook',
          title: 'Das Problem mit ungetestetem UI-Code',
          duration: '1:10',
          purpose: 'Demonstration eines typischen Produktionsfehlers nach einem schnellen Refactoring.',
          retentionImpact: 'Sehr hoch (94%)',
          visualElement: 'Splitscreen: Bug im Browser vs. sauberer Test-Runner.',
        },
        {
          timestamp: '1:10',
          seconds: 70,
          phase: 'Architektur',
          title: 'Entkopplung von Parsern, Validierung und Rendering',
          duration: '2:40',
          purpose: 'Ordnerstruktur und Dependency-Richtung erklären.',
          retentionImpact: 'Hoch (89%)',
          visualElement: 'Schichten-Diagramm (UI -> Services -> Pure Utils).',
        },
        {
          timestamp: '3:50',
          seconds: 230,
          phase: 'Live-Coding',
          title: 'Unit-Tests mit node:test in 30 Sekunden schreiben',
          duration: '2:50',
          purpose: 'Praktische Implementierung von Grenzfall-Tests.',
          retentionImpact: 'Sehr hoch (91%)',
          visualElement: 'IDE-Screencast mit Echtzeit-Testausführung im Terminal.',
        },
        {
          timestamp: '6:40',
          seconds: 400,
          phase: 'CI/CD & GitHub',
          title: 'Pre-Commit Checks vor dem GitHub-Push',
          duration: '1:40',
          purpose: 'Automatisierung von Build, Linting und Tests.',
          retentionImpact: 'Hoch (87%)',
          visualElement: 'GitHub Actions Pipeline mit grünen Checkmarks.',
        },
      ],
      speakers: [
        {
          id: 'spk-c1',
          name: 'Lukas Bergmann (Principal Engineer)',
          role: 'Tutorial-Sprecher',
          voiceCharacteristics: 'Sachlich, ruhig, 138 WPM',
        },
      ],
      transcript: [
        {
          id: 'tc-1',
          startTime: '0:00',
          endTime: '1:10',
          startSeconds: 0,
          endSeconds: 70,
          speaker: 'Lukas Bergmann (Principal Engineer)',
          speakerRole: 'Tutorial-Sprecher',
          text: 'Jeder von uns kennt den Moment: Man ändert eine Kleinigkeit am Layout und plötzlich funktioniert ein Button im Formular nicht mehr. Heute richten wir eine Architektur ein, die solche Fehler vor jedem GitHub-Commit automatisch abfängt.',
        },
        {
          id: 'tc-2',
          startTime: '1:10',
          endTime: '3:50',
          startSeconds: 70,
          endSeconds: 230,
          speaker: 'Lukas Bergmann (Principal Engineer)',
          speakerRole: 'Tutorial-Sprecher',
          text: 'Der Schlüssel liegt in der strikten Trennung: Alle Parser, Zeitstempel-Berechnungen und Validatoren wandern in eigenständige TypeScript-Module ohne Browser-Abhängigkeiten.',
        },
        {
          id: 'tc-3',
          startTime: '3:50',
          endTime: '8:20',
          startSeconds: 230,
          endSeconds: 500,
          speaker: 'Lukas Bergmann (Principal Engineer)',
          speakerRole: 'Tutorial-Sprecher',
          text: 'Mit dem integrierten Node-Testrunner prüfen wir diese Funktionen in weniger als einer halben Sekunde und testen anschließend die Oberfläche automatisiert im Headless-Browser.',
        },
      ],
      presentationAnalysis: {
        visualStyle: 'Fokussierter Code-Screencast mit klaren Architektur-Skizzen.',
        cameraAndLighting: 'Dezent eingeblendete Picture-in-Picture Kamera unten rechts.',
        graphicsAndBroll: 'Hohe Lesbarkeit durch große Schriftgrade (18pt im Editor) und fokussierte Zooms.',
        speakerDelivery: 'Ruhig, strukturiert, auf den Punkt (138 WPM).',
        pacingAndTempo: 'Tipp-Passagen sind im Zeitraffer geschnitten, Erklärungen in Echtzeit.',
        audioQuality: 'Studio-Kondensatormikrofon ohne Tastaturklappern.',
      },
      dramaturgy: {
        hookAnalysis: 'Jeder Entwickler erkennt den Schmerz eines kaputten Releases sofort wieder.',
        storytellingArc: 'Chaos im Projekt -> Strukturierter Umbau -> Sicheres Release.',
        retentionTactics: 'Vorher/Nachher-Vergleich der Testgeschwindigkeit hält die Spannung hoch.',
        ctaEffectiveness: 'Verweis auf die Checkliste für GitHub-Releases.',
      },
      uploadPackage: {
        suggestedTitle: 'TypeScript in großen Projekten: Clean Architecture & automatisiertes Testing',
        suggestedDescription: `Saubere Architektur und verlässliche Tests für moderne TypeScript-Anwendungen.

Kapitel:
0:00 Das Problem mit ungetestetem UI-Code
1:10 Entkopplung von Parsern, Validierung und Rendering
3:50 Unit-Tests mit node:test in 30 Sekunden schreiben
6:40 Pre-Commit Checks vor dem GitHub-Push`,
        tags: 'TypeScript, Clean Architecture, Unit Testing, Softwareentwicklung, GitHub, CI/CD, Web Development, Refactoring',
        visibility: 'öffentlich',
        audience: 'Softwareentwickler & Teams',
      },
    },
  },
];
