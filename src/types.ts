export interface Chapter {
  timestamp: string;
  seconds: number;
  phase: string;
  title: string;
  duration?: string;
  purpose?: string;
  retentionImpact?: string;
  visualElement?: string;
}

export interface TitleAlternative {
  title: string;
  strategy: string;
  predictedCtr: string;
}

export interface TitleAnalysis {
  currentTitle: string;
  score: number;
  critique: string;
  alternatives: TitleAlternative[];
}

export interface ContentSummary {
  headline: string;
  executiveSummary: string;
  keyTakeaways: string[];
  targetAudience: string;
}

export interface PresentationAnalysis {
  visualStyle: string;
  cameraAndLighting: string;
  graphicsAndBroll: string;
  speakerDelivery: string;
  pacingAndTempo: string;
  audioQuality: string;
}

export interface DramaturgyAnalysis {
  hookAnalysis: string;
  storytellingArc: string;
  retentionTactics: string;
  ctaEffectiveness: string;
}

export interface UploadPackage {
  suggestedTitle: string;
  suggestedDescription: string;
  tags: string;
  visibility: 'öffentlich' | 'nicht gelistet' | 'privat';
  audience: string;
}

export interface VideoMetadata {
  title: string;
  author: string;
  category?: string;
  estimatedDuration?: string;
  overallRating?: number;
  thumbnailUrl?: string;
  videoId?: string;
  url?: string;
  analyzedAt?: string;
}

export interface VideoAnalysisResult {
  meta: VideoMetadata;
  titleAnalysis: TitleAnalysis;
  summary: ContentSummary;
  structurePlan: Chapter[];
  presentationAnalysis: PresentationAnalysis;
  dramaturgy: DramaturgyAnalysis;
  uploadPackage: UploadPackage;
}
