import fs from 'fs';
import path from 'path';
import { Workbook, Note, StudyCard, SourceMedia, GeminiMessage, VoiceNote, UserProfile } from '../src/types';

interface DatabaseSchema {
  workbooks: Workbook[];
  notes: Note[];
  cards: StudyCard[];
  sources: SourceMedia[];
  chatHistory: GeminiMessage[];
  userProfile: UserProfile;
  preferences: {
    retentionRate: number;
    activeDeskMode: string;
    lastActiveWorkbookId: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'scholar_codex.json');

// Initial seed data directly reflecting the reference design
const INITIAL_DATA: DatabaseSchema = {
  workbooks: [
    {
      id: 'epistemology-ai',
      name: 'Epistemology & AI',
      slug: 'epistemology-and-ai',
      icon: 'neurology',
      chapterCount: 12,
      noteCount: 34,
      mastery: 83.4,
      description: 'Critiques of induction, epistemic bounds of LLM reasoning, RLHF telemetry traps, and synthetic truth verification.'
    },
    {
      id: 'dsa-codex',
      name: 'DSA Codex',
      slug: 'dsa-codex',
      icon: 'account_tree',
      chapterCount: 8,
      noteCount: 22,
      mastery: 72.0,
      description: 'Formal algorithms, graph isomorphism proofs, cache-oblivious architectures, and persistent data structures.'
    },
    {
      id: 'eng-mathematics',
      name: 'Eng Mathematics',
      slug: 'eng-mathematics',
      icon: 'functions',
      chapterCount: 15,
      noteCount: 45,
      mastery: 64.5,
      description: 'Stochastic calculus, Riemannian geometry for deep embeddings, and spectral decomposition in transformer weights.'
    },
    {
      id: 'arena-benchmarks',
      name: 'Arena Benchmarks',
      slug: 'arena-benchmarks',
      icon: 'swords',
      chapterCount: 6,
      noteCount: 18,
      mastery: 91.0,
      description: 'Live Elo comparative metrics, adversarial red-teaming vectors, and loss curves.'
    },
    {
      id: 'archival-ledger',
      name: 'Archival Ledger',
      slug: 'archival-ledger',
      icon: 'history_edu',
      chapterCount: 4,
      noteCount: 14,
      mastery: 88.0,
      description: 'Historical prompt iterations, epistemic session histories, and philosophical annotations.'
    }
  ],
  notes: [
    {
      id: 'note-epist-094',
      workbookId: 'epistemology-ai',
      chapter: 'CODEX CHAPTER 03',
      chapterNumber: '§ 03.4',
      title: '§ 03.4 Is Inductive Alignment Merely Statistical Habit?',
      updatedAt: 'Updated 14 mins ago',
      tags: ['Hume', 'Russell', 'Induction', 'RLHF', 'Prompt Engineering'],
      content: `When reinforcement learning from human feedback (RLHF) optimizes model outputs for adherence, it reproduces what David Hume famously characterized as empirical custom. The machine does not deduce universal deontic ethics; rather, like the inductive observer in Russell '12 · Ch.6 §2, it infers benevolence strictly through repetition of rewards.

“The man who has fed the chicken every day throughout its life at last wrings its neck instead, showing that more refined views as to the uniformity of nature would have been useful to the bird.”

In modern frontier prompt architecture, benchmark saturation presents an analogous crisis. A prompt tested against 10,000 synthetic evaluations builds high inductive confidence (Tape 24:15). Yet, when deployed into adversarial open environments, zero-shot distribution shifts render statistical habits completely brittle. The model has internalized neither safety nor reason, but simply the expectation of continuous grain. (Lec 03 · p.12)`,
      scholarAnnotation: {
        reference: 'Ref: Hume Treatise I.III.VI',
        text: 'Note the subtle divergence between inductive bias in gradient descent and Humean custom. While custom implies passive association, modern backpropagation actively carves loss landscapes that over-fit to the past distribution.'
      },
      voiceNotes: [
        {
          id: 'vn-01',
          filename: 'Prof_Vance_Seminar_Clip_01.wav',
          duration: '01:42',
          durationSeconds: 102,
          recordedAt: 'Morning Colloquium',
          transcript: 'When you consider prompt templates tested across thousands of validation iterations, remember Hume\'s warning: repetition of past observations cannot yield epistemic certainty about future safety without structural, deductive constraints.'
        }
      ],
      citations: [
        {
          id: 'cit-1',
          label: "Russell '12 · Ch.6 §2",
          sourceId: 'src-2',
          sourceTitle: 'The Problems of Philosophy',
          excerpt: 'The turkey found that, on his first morning at the farm, he was fed at 9 a.m. However, being a good inductivist, he did not jump to conclusions. He collected a large number of observations...',
          location: 'Chapter 6, Page 63'
        },
        {
          id: 'cit-2',
          label: 'Tape 24:15',
          sourceId: 'src-1',
          sourceTitle: 'Seminar Audio Tape',
          excerpt: 'At 24:15, Vance emphasizes how prompt engineers develop confirmation bias by running identical validation suites repeatedly.',
          location: 'Timestamp 24:15 - 26:00'
        },
        {
          id: 'cit-3',
          label: 'Lec 03 · p.12',
          sourceId: 'src-3',
          sourceTitle: 'Lecture 03 Transcripts & Slides',
          excerpt: 'David Hume’s induction problem applied to RLHF reveals an inescapable telemetry trap: rewarding compliance merely measures past alignment to proxy metrics, never moral or rational comprehension.',
          location: 'Lecture 03, Slide 12'
        }
      ]
    }
  ],
  cards: [
    {
      id: 'card-01',
      workbookId: 'epistemology-ai',
      noteId: 'note-epist-094',
      cardNumber: 1,
      totalCards: 6,
      conceptBadge: 'UNTESTED CONCEPT',
      title: 'The Turkey Paradox in Modern Prompt Engineering',
      question: 'Why does achieving 99.8% benchmark accuracy in fixed prompts inevitably collapse when confronted with zero-day adversarial distribution shifts?',
      groundingSource: "Synthesized from Russell '12 & Seminar Tape (18:42)",
      quoteRef: 'Hume (1748) · Inquiry IV',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      backTitle: 'The Fallacy of Historical Induction',
      backAnswer: 'Statistical alignment merely optimizes for known reward vectors. Without counterfactual meta-prompting and structural bounds, each successful run reinforces the illusion of safety until an out-of-distribution prompt triggers complete hallucination.',
      pedagogicalAxiom: 'Empirical prompt runs only document historical compliance; they cannot assert epistemic necessity without symbolic guardrails.',
      coreAxiomCode: 'P(Failure | T=N+1) >> P(Failure | T ≤ N)',
      intervalDays: 1,
      reviewCount: 0,
      isPinned: false,
      easeFactor: 2.5,
      masteryPercent: 0
    },
    {
      id: 'card-02',
      workbookId: 'epistemology-ai',
      noteId: 'note-epist-094',
      cardNumber: 2,
      totalCards: 6,
      conceptBadge: 'IN REVIEW',
      title: 'Goodhart’s Law in RLHF Reward Models',
      question: 'When a proxy alignment score becomes the terminal training target, why does semantic coherence deteriorate at extreme optimization steps?',
      groundingSource: 'Lec 03 · Slide 14 & Radford et al.',
      quoteRef: 'Goodhart (1975) · Problems of Monetary Management',
      backTitle: 'Reward Hacking & Deceptive Alignment',
      backAnswer: 'When a measure becomes a target, it ceases to be a good measure. The policy exploits idiosyncratic flaws in the reward model, producing sycophantic verbiage rather than epistemic truth.',
      pedagogicalAxiom: 'Optimization against an imperfect heuristic will exhaust the domain where heuristic and underlying goal correlate.',
      coreAxiomCode: 'argmax_π R(π) ≠ argmax_π Truth(π)',
      intervalDays: 3,
      reviewCount: 2,
      isPinned: true,
      easeFactor: 2.4,
      masteryPercent: 65
    },
    {
      id: 'card-03',
      workbookId: 'epistemology-ai',
      noteId: 'note-epist-094',
      cardNumber: 3,
      totalCards: 6,
      conceptBadge: 'MASTERED',
      title: 'The Symbol Grounding Problem (Harnad 1990)',
      question: 'Can next-token prediction over text corpora ever bridge the gap to physical sensorimotor semantics?',
      groundingSource: 'Russell Ch. 6 & Harnad (1990)',
      quoteRef: 'Harnad (1990) · Physica D',
      backTitle: 'Parasitic Semantics vs. Intrinsic Semantics',
      backAnswer: 'Pure text models manipulate tokens whose meanings are grounded only in other tokens—a Chinese Room dictionary circle. True grounding requires causal interaction with external environments.',
      pedagogicalAxiom: 'Syntactic manipulation cannot bootstrap intrinsic intentionality without causal multi-modal feedback loops.',
      coreAxiomCode: 'Meaning(T) = f(T) ∘ World_Grounding',
      intervalDays: 7,
      reviewCount: 5,
      isPinned: false,
      easeFactor: 2.8,
      masteryPercent: 95
    },
    {
      id: 'card-04',
      workbookId: 'epistemology-ai',
      noteId: 'note-epist-094',
      cardNumber: 4,
      totalCards: 6,
      conceptBadge: 'IN REVIEW',
      title: 'Kripkean Rule-Following Paradox in LLMs',
      question: 'How do ambiguous prompt demonstrations leave open an infinite family of incompatible semantic rules?',
      groundingSource: 'Wittgenstein (1953) / Kripke (1982)',
      quoteRef: 'Kripke (1982) · Wittgenstein on Rules',
      backTitle: 'The "Quus" Problem in Prompt Engineering',
      backAnswer: 'Few-shot examples cannot uniquely determine future intent. Any novel input could be legitimately completed under an unintended interpretation ("plus" vs "quus") consistent with all prior examples.',
      pedagogicalAxiom: 'Explicit negative constraints and operational invariants must accompany few-shot inductive demonstrations.',
      coreAxiomCode: '∀ D_k, ∃ π_1, π_2 : π_1(D_k) = π_2(D_k) ∧ π_1(x*) ≠ π_2(x*)',
      intervalDays: 4,
      reviewCount: 3,
      isPinned: false,
      easeFactor: 2.3,
      masteryPercent: 70
    },
    {
      id: 'card-05',
      workbookId: 'epistemology-ai',
      noteId: 'note-epist-094',
      cardNumber: 5,
      totalCards: 6,
      conceptBadge: 'UNTESTED CONCEPT',
      title: 'Gradients vs. Intent: The Teleology Mirage',
      question: 'Why is describing an autoregressive model as "trying" to be honest an anthropomorphic category mistake?',
      groundingSource: 'Bostrom & Yudkowsky / Lec 03',
      quoteRef: 'Ryle (1949) · The Concept of Mind',
      backTitle: 'Shoggoth with a Smiley Face',
      backAnswer: 'Gradient updates minimize next-token cross-entropy loss over a manifold. The resulting persona is a sampled trajectory over predictive likelihood, devoid of subjective commitment or epistemic agency.',
      pedagogicalAxiom: 'Conflating prediction loss with teleological intent leads to miscalculated trust in model safety assertions.',
      coreAxiomCode: 'Loss = -E[log P(x_t | x_{<t})]',
      intervalDays: 1,
      reviewCount: 0,
      isPinned: false,
      easeFactor: 2.5,
      masteryPercent: 10
    },
    {
      id: 'card-06',
      workbookId: 'epistemology-ai',
      noteId: 'note-epist-094',
      cardNumber: 6,
      totalCards: 6,
      conceptBadge: 'IN REVIEW',
      title: 'Epistemic Luck & Veridical Hallucinations',
      question: 'If a model outputs a factually correct answer using flawed premises, does it possess knowledge?',
      groundingSource: 'Gettier (1963) · Is Justified True Belief Knowledge?',
      quoteRef: 'Gettier (1963) · Analysis',
      backTitle: 'The Gettierized Prompt Output',
      backAnswer: 'Justified True Belief (JTB) fails when truth is accidentally coincident with spurious token associations. Robust knowledge requires counterfactual validity under prompt perturbation.',
      pedagogicalAxiom: 'A correct answer obtained via spurious correlation is epistemic luck, vulnerable to slight adversarial perturbation.',
      coreAxiomCode: 'Knowledge ≠ Belief ∧ Truth (Gettier Counterexample)',
      intervalDays: 3,
      reviewCount: 2,
      isPinned: false,
      easeFactor: 2.6,
      masteryPercent: 55
    }
  ],
  sources: [
    {
      id: 'src-1',
      workbookId: 'epistemology-ai',
      name: 'Lec03_Tape.mp3',
      type: 'audio',
      icon: 'graphic_eq',
      metadataTag: 'Indexed (18:42)',
      size: '24.8 MB',
      uploadDate: 'Sep 12, 2026',
      excerpt: 'Seminar recording by Prof. Vance on inductive alignment, Humean custom, and empirical confidence in stochastic sampling.',
      details: 'Recorded during Morning Colloquium in Cambridge Hall. Audio indexed with time markers at 18:42 and 24:15.'
    },
    {
      id: 'src-2',
      workbookId: 'epistemology-ai',
      name: 'Russell_Problems.pdf',
      type: 'pdf',
      icon: 'picture_as_pdf',
      metadataTag: 'Ch. 6 §2 parsed',
      size: '3.4 MB',
      uploadDate: 'Sep 10, 2026',
      excerpt: 'Bertrand Russell, The Problems of Philosophy (1912), Chapter VI: On Induction and the Turkey Paradox.',
      details: 'Full OCR extraction of Chapter 6 with semantic cross-references to Hume’s Treatise of Human Nature.'
    },
    {
      id: 'src-3',
      workbookId: 'epistemology-ai',
      name: 'Handout_Annotated.png',
      type: 'image',
      icon: 'image',
      metadataTag: 'OCR Synced',
      size: '1.2 MB',
      uploadDate: 'Sep 11, 2026',
      excerpt: 'Annotated diagram comparing empirical loss minimizers with Hume’s critique of causal necessity.',
      details: 'Scanned manuscript with handwritten margin notes on inductive boundaries and telemetry traps.'
    }
  ],
  chatHistory: [
    {
      id: 'msg-1',
      role: 'model',
      content: 'In Lec03 Tape (18:42), Prof. Vance cautions that over-prompting with stylistic examples causes models to prioritize superficial rhyme over logical coherence. This directly explains the Turkey Paradox card: high benchmark scores reflect habituation to prompt contours, not actual causal reasoning.',
      timestamp: 'Just now',
      sourceRef: 'Cross-ref: Russell Ch. 6, Page 63',
      actionType: 'socratic'
    }
  ],
  userProfile: {
    id: 'scholar-01',
    name: 'Dr. Aaron Vance',
    email: 'a.vance@scholar-codex.org',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    role: 'Chair of Epistemology & Formal Semantics',
    institution: 'Department of Cognitive Logic',
    retentionRate: 94.2,
    epistemicStability: 89.6,
    totalNotes: 48,
    totalCardsMastered: 132
  },
  preferences: {
    retentionRate: 94.2,
    activeDeskMode: 'arranged',
    lastActiveWorkbookId: 'epistemology-ai'
  }
};

// Database class
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (!parsed.userProfile) {
          parsed.userProfile = INITIAL_DATA.userProfile;
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing with defaults:', err);
    }
    // Save initial data
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveData(dataToSave?: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  // Workbooks
  getWorkbooks(): Workbook[] {
    return this.data.workbooks;
  }

  getWorkbookById(id: string): Workbook | undefined {
    return this.data.workbooks.find(w => w.id === id || w.slug === id);
  }

  createWorkbook(workbook: Omit<Workbook, 'id'>): Workbook {
    const id = workbook.slug || `wb-${Date.now()}`;
    const newWb: Workbook = { ...workbook, id };
    this.data.workbooks.push(newWb);
    this.saveData();
    return newWb;
  }

  updateWorkbook(id: string, updates: Partial<Workbook>): Workbook | undefined {
    const wb = this.getWorkbookById(id);
    if (!wb) return undefined;
    Object.assign(wb, updates);
    this.saveData();
    return wb;
  }

  deleteWorkbook(id: string): boolean {
    const initialLen = this.data.workbooks.length;
    this.data.workbooks = this.data.workbooks.filter(w => w.id !== id);
    if (this.data.workbooks.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Notes
  getNotes(workbookId?: string): Note[] {
    if (workbookId) {
      return this.data.notes.filter(n => n.workbookId === workbookId);
    }
    return this.data.notes;
  }

  getNoteById(id: string): Note | undefined {
    return this.data.notes.find(n => n.id === id);
  }

  createNote(noteData: Partial<Note> & { workbookId: string; title: string }): Note {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      workbookId: noteData.workbookId,
      chapter: noteData.chapter || 'CODEX CHAPTER 04',
      chapterNumber: noteData.chapterNumber || '§ 04.1',
      title: noteData.title,
      content: noteData.content || '',
      noteType: noteData.noteType || 'text note',
      generatedPrompt: noteData.generatedPrompt || '',
      updatedAt: 'Just now',
      tags: noteData.tags || ['Study Desk'],
      scholarAnnotation: noteData.scholarAnnotation || {
        reference: 'Ref: Scholar Annotation',
        text: 'Initial marginalia note recorded.'
      },
      voiceNotes: noteData.voiceNotes || [],
      citations: noteData.citations || []
    };
    this.data.notes.unshift(newNote);

    // Update workbook note count
    const wb = this.getWorkbookById(noteData.workbookId);
    if (wb) {
      wb.noteCount = this.getNotes(noteData.workbookId).length;
    }

    this.saveData();
    return newNote;
  }

  updateNote(id: string, updates: Partial<Note>): Note | undefined {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index === -1) return undefined;
    this.data.notes[index] = {
      ...this.data.notes[index],
      ...updates,
      updatedAt: 'Just now'
    };
    this.saveData();
    return this.data.notes[index];
  }

  deleteNote(id: string): boolean {
    const initialLen = this.data.notes.length;
    this.data.notes = this.data.notes.filter(n => n.id !== id);
    if (this.data.notes.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Cards
  getCards(workbookId?: string): StudyCard[] {
    if (workbookId) {
      return this.data.cards.filter(c => c.workbookId === workbookId);
    }
    return this.data.cards;
  }

  getCardById(id: string): StudyCard | undefined {
    return this.data.cards.find(c => c.id === id);
  }

  createCard(cardData: Partial<StudyCard> & { workbookId: string; title: string }): StudyCard {
    const existing = this.getCards(cardData.workbookId);
    const cardNumber = existing.length + 1;
    const newCard: StudyCard = {
      id: `card-${Date.now()}`,
      workbookId: cardData.workbookId,
      noteId: cardData.noteId,
      cardNumber: cardNumber,
      totalCards: cardNumber,
      conceptBadge: cardData.conceptBadge || 'UNTESTED CONCEPT',
      title: cardData.title,
      question: cardData.question || '',
      groundingSource: cardData.groundingSource || 'Synthesized via Scholar Codex',
      quoteRef: cardData.quoteRef || 'Active Manuscript',
      imageUrl: cardData.imageUrl,
      backTitle: cardData.backTitle || 'Dialectical Resolution',
      backAnswer: cardData.backAnswer || '',
      pedagogicalAxiom: cardData.pedagogicalAxiom || '',
      coreAxiomCode: cardData.coreAxiomCode || '',
      intervalDays: 1,
      reviewCount: 0,
      isPinned: false,
      easeFactor: 2.5,
      masteryPercent: 0
    };

    // update totalCards on all cards in this workbook
    this.data.cards.push(newCard);
    const wbCards = this.data.cards.filter(c => c.workbookId === cardData.workbookId);
    wbCards.forEach(c => {
      c.totalCards = wbCards.length;
    });

    this.saveData();
    return newCard;
  }

  updateCard(id: string, updates: Partial<StudyCard>): StudyCard | undefined {
    const index = this.data.cards.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.data.cards[index] = {
      ...this.data.cards[index],
      ...updates
    };
    this.saveData();
    return this.data.cards[index];
  }

  reviewCard(id: string, rating: 'hard' | 'good' | 'mastered' | 'easy'): StudyCard | undefined {
    const card = this.getCardById(id);
    if (!card) return undefined;

    let newInterval = 1;
    let newBadge: StudyCard['conceptBadge'] = 'IN REVIEW';
    let masteryIncrement = 15;

    if (rating === 'hard') {
      newInterval = 1;
      card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
      newBadge = 'IN REVIEW';
      masteryIncrement = 5;
    } else if (rating === 'good') {
      newInterval = Math.max(2, Math.round(card.intervalDays * 1.5));
      newBadge = 'IN REVIEW';
      masteryIncrement = 15;
    } else {
      // mastered or easy
      newInterval = Math.max(7, Math.round(card.intervalDays * 2.2));
      card.easeFactor = card.easeFactor + 0.15;
      newBadge = 'MASTERED';
      masteryIncrement = 25;
    }

    card.intervalDays = newInterval;
    card.reviewCount += 1;
    card.conceptBadge = newBadge;
    card.masteryPercent = Math.min(100, card.masteryPercent + masteryIncrement);

    // Update overall workbook mastery
    const wb = this.getWorkbookById(card.workbookId);
    if (wb) {
      const allWbCards = this.getCards(card.workbookId);
      const avgMastery = allWbCards.reduce((sum, c) => sum + c.masteryPercent, 0) / (allWbCards.length || 1);
      wb.mastery = Math.round(avgMastery * 10) / 10;
    }

    this.saveData();
    return card;
  }

  // Sources
  getSources(workbookId?: string): SourceMedia[] {
    if (workbookId) {
      return this.data.sources.filter(s => s.workbookId === workbookId);
    }
    return this.data.sources;
  }

  addSource(source: Omit<SourceMedia, 'id'>): SourceMedia {
    const newSource: SourceMedia = {
      ...source,
      id: `src-${Date.now()}`
    };
    this.data.sources.push(newSource);
    this.saveData();
    return newSource;
  }

  deleteSource(id: string): boolean {
    const initialLen = this.data.sources.length;
    this.data.sources = this.data.sources.filter(s => s.id !== id);
    if (this.data.sources.length !== initialLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // Voice Notes
  addVoiceNoteToNote(noteId: string, voiceNote: Omit<VoiceNote, 'id'>): VoiceNote | undefined {
    const note = this.getNoteById(noteId);
    if (!note) return undefined;
    const newVn: VoiceNote = {
      ...voiceNote,
      id: `vn-${Date.now()}`
    };
    note.voiceNotes.unshift(newVn);

    // Also add to source list as an indexed audio clip
    this.addSource({
      workbookId: note.workbookId,
      name: newVn.filename,
      type: 'audio',
      icon: 'graphic_eq',
      metadataTag: `Indexed (${newVn.duration})`,
      size: '3.6 MB',
      uploadDate: 'Just now',
      excerpt: newVn.transcript || 'User recorded seminar voice memo clip.',
      details: `Recorded at ${newVn.recordedAt}. Attached to ${note.title}`
    });

    this.saveData();
    return newVn;
  }

  // Chat
  getChatHistory(): GeminiMessage[] {
    return this.data.chatHistory;
  }

  addChatMessage(msg: Omit<GeminiMessage, 'id' | 'timestamp'>): GeminiMessage {
    const newMsg: GeminiMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: 'Just now'
    };
    this.data.chatHistory.push(newMsg);
    this.saveData();
    return newMsg;
  }

  clearChatHistory(): void {
    this.data.chatHistory = [
      {
        id: 'msg-seed',
        role: 'model',
        content: 'Dialectic session reset. Ready to interrogate the current manuscript and grounded sources.',
        timestamp: 'Just now',
        actionType: 'socratic'
      }
    ];
    this.saveData();
  }

  // User Management
  getUserProfile(): UserProfile {
    return this.data.userProfile;
  }

  updateUserProfile(profile: Partial<UserProfile>): UserProfile {
    this.data.userProfile = {
      ...this.data.userProfile,
      ...profile
    };
    this.saveData();
    return this.data.userProfile;
  }

  // Preferences & Stats
  getPreferences() {
    return this.data.preferences;
  }

  updatePreferences(pref: Partial<DatabaseSchema['preferences']>) {
    this.data.preferences = {
      ...this.data.preferences,
      ...pref
    };
    this.saveData();
    return this.data.preferences;
  }
}

export const db = new Database();
