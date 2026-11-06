import { VideoAnalysisResult } from './types';

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
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
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
      presentationAnalysis: {
        visualStyle: 'Professionelles Erklär- und Tutorial-Format mit starker technischer Glaubwürdigkeit.',
        cameraAndLighting: '3-Punkt-Beleuchtung mit kaltweißem Key-Light und blauem Akzentlicht. Klare 4K-Kopffreiheit.',
        graphicsAndBroll: 'Hochwertige Vektor-Diagramme, flüssige Callouts und synchrone Maus-Hervorhebungen. Keine störenden Effekte.',
        speakerDelivery: 'Präzise, souveräne Aussprache ohne Füllwörter. Durchschnittlich ca. 142 Wörter/Minute (ideales Lerntempo).',
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
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
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
          visualElement: 'Interaktives Architektur-Schema mit Glowing Nodes.',
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
          visualElement: 'Repo-Vorschau und animierter Subscribe-Button.',
        },
      ],
      presentationAnalysis: {
        visualStyle: 'Modernes Tech-Explainer Format im Dark-Mode Neon-Look.',
        cameraAndLighting: 'Kino-Optik mit geringer Tiefenschärfe (f/1.8) und Ambient Neon-Backlight.',
        graphicsAndBroll: 'Spezifisch für das Video gerenderte 3D-Konzepte statt generischer Stock-Footage.',
        speakerDelivery: 'Dynamisch, engagiert, ca. 155 WPM.',
        pacingAndTempo: 'Keine Längen; alle 5-6 Sekunden wechselnde Bildelemente.',
        audioQuality: 'Glasklare Podcast-Mikrofonie mit dezentem Synthesizer-Soundtrack.',
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
];
