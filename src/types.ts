export interface Workbook {
  id: string;
  name: string;
  slug: string;
  icon: string;
  chapterCount: number;
  noteCount: number;
  mastery: number;
  description: string;
}

export interface VoiceNote {
  id: string;
  filename: string;
  duration: string;
  durationSeconds: number;
  recordedAt: string;
  transcript: string;
  audioUrl?: string;
}

export interface CitationRef {
  id: string;
  label: string;
  sourceId: string;
  sourceTitle: string;
  excerpt: string;
  location: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  institution: string;
  retentionRate: number;
  epistemicStability: number;
  totalNotes: number;
  totalCardsMastered: number;
}

export interface Note {
  id: string;
  workbookId: string;
  chapter: string;
  chapterNumber: string;
  title: string;
  content: string;
  updatedAt: string;
  tags: string[];
  noteType?: 'text note' | 'AI-generated content' | 'manuscript' | 'voice note transcript';
  generatedPrompt?: string;
  scholarAnnotation?: {
    reference: string;
    text: string;
  };
  voiceNotes: VoiceNote[];
  citations: CitationRef[];
}

export interface StudyCard {
  id: string;
  workbookId: string;
  noteId?: string;
  cardNumber: number;
  totalCards: number;
  conceptBadge: 'UNTESTED CONCEPT' | 'IN REVIEW' | 'MASTERED';
  title: string;
  question: string;
  groundingSource: string;
  quoteRef: string;
  imageUrl?: string;
  backTitle: string;
  backAnswer: string;
  pedagogicalAxiom: string;
  coreAxiomCode: string;
  intervalDays: number;
  reviewCount: number;
  isPinned: boolean;
  easeFactor: number;
  masteryPercent: number;
}

export interface SourceMedia {
  id: string;
  workbookId: string;
  name: string;
  type: 'audio' | 'pdf' | 'image' | 'text';
  icon: string;
  metadataTag: string;
  size: string;
  uploadDate: string;
  excerpt: string;
  details?: string;
}

export interface GeminiMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  sourceRef?: string;
  actionType?: 'explanation' | 'challenge' | 'card_created' | 'socratic';
}

export type ViewLayoutMode = 'arranged' | 'folio' | 'grid';
export type MobileTab = 'study-desk' | 'sources-notes' | 'gemini-companion';

export interface ScholarPreferences {
  theme: 'dark' | 'light';
  activeViewMode: ViewLayoutMode;
  studyDeckVisible: boolean;
  geminiCompanionExpanded: boolean;
  fontSize: 'compact' | 'normal' | 'large';
  highYieldOnly: boolean;
}

export interface AppState {
  currentWorkbookId: string;
  currentNoteId: string;
  activeCardIndex: number;
  viewMode: ViewLayoutMode;
  mobileTab: MobileTab;
}
