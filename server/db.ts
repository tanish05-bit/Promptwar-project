import fs from 'fs';
import path from 'path';
import {
  Workbook,
  Note,
  StudyCard,
  SourceMedia,
  GeminiMessage,
  VoiceNote,
  UserProfile,
  WebsiteProject,
  ProjectAsset,
  DesignSettings,
} from '../src/types';

interface DatabaseSchema {
  workbooks: Workbook[];
  notes: Note[];
  cards: StudyCard[];
  sources: SourceMedia[];
  chatHistory: GeminiMessage[];
  userProfile: UserProfile;
  websiteProjects: WebsiteProject[];
  assets: ProjectAsset[];
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
  websiteProjects: [
    {
      id: 'proj-codex-hub',
      workbookId: 'epistemology-ai',
      title: 'Scholar Codex — Dialectic & Research Portal',
      description: 'Production responsive research portal featuring epistemic study cards, audio archives, and interactive dialectic exploration.',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      designSettings: {
        primaryColor: '#ffb68c',
        backgroundColor: '#131315',
        surfaceColor: '#1e1e22',
        textColor: '#f0ede6',
        accentColor: '#8ed5b4',
        fontFamily: 'Be Vietnam Pro',
        baseFontSize: 16,
        borderRadius: 8,
        spacingUnit: 16,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        containerMaxWidth: 1200,
      },
      assets: [
        {
          id: 'asset-hero-1',
          name: 'Scholar Codex Emblem',
          url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80',
          type: 'image',
          size: '240 KB',
          associatedSection: 'hero',
          createdAt: new Date().toISOString(),
        }
      ],
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scholar Codex — Epistemic Research Portal</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400&family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
</head>
<body>
  <!-- Navigation Header -->
  <header class="site-header" id="navbar">
    <div class="nav-container">
      <a href="#hero" class="brand-logo">
        <span class="logo-badge">§</span>
        <span class="logo-text">Scholar Codex</span>
      </a>
      <nav class="nav-menu" id="navMenu">
        <a href="#features" class="nav-link active">Chapters</a>
        <a href="#dialectic" class="nav-link">Dialectic</a>
        <a href="#study-stack" class="nav-link">Study Stack</a>
      </nav>
      <div class="nav-actions">
        <button class="btn btn-secondary" id="modeToggleBtn">Toggle Theme</button>
        <button class="btn btn-primary" id="launchBtn">Launch Studio</button>
      </div>
      <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle navigation">☰</button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-section" id="hero">
    <div class="hero-container">
      <div class="hero-badge">
        <span class="pulse-dot"></span>
        <span>ARCHIVAL STUDY DESK v4.2</span>
      </div>
      <h1 class="hero-title">Synthesize Deep Knowledge into <span class="highlight">Interactive Epistemic Apps</span></h1>
      <p class="hero-lead">Transform unstructured scholarly manuscripts, audio colloquia, and visual prototypes into production-grade websites and dialectic study workspaces.</p>
      <div class="hero-buttons">
        <a href="#dialectic" class="btn btn-primary btn-lg">Explore Dialectic Engine</a>
        <a href="#features" class="btn btn-outline btn-lg">View Curated Chapters</a>
      </div>
      <div class="hero-metrics">
        <div class="metric-card">
          <span class="metric-value">94.2%</span>
          <span class="metric-label">Retention Index</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">12+</span>
          <span class="metric-label">Codex Chapters</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">Zero-Shot</span>
          <span class="metric-label">Alignment Verification</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Curated Features Grid -->
  <section class="features-section" id="features">
    <div class="section-container">
      <div class="section-header text-center">
        <h2 class="section-title">Core Archival Modules</h2>
        <p class="section-subtitle">Disciplined physical study metaphors translated into high-performance web tooling.</p>
      </div>
      <div class="cards-grid">
        <div class="feature-card" data-card="1">
          <div class="card-icon">📖</div>
          <span class="card-tag">Chapter § 03.4</span>
          <h3 class="card-title">Humean Custom & Induction</h3>
          <p class="card-desc">Critiques of modern RLHF reward shaping through the philosophical lens of inductive habit.</p>
          <div class="card-footer">
            <span class="card-status status-mastered">Mastered (95%)</span>
            <button class="card-action-btn">Study</button>
          </div>
        </div>
        <div class="feature-card" data-card="2">
          <div class="card-icon">🎙️</div>
          <span class="card-tag">Acoustic Codex</span>
          <h3 class="card-title">Seminar Audio Colloquia</h3>
          <p class="card-desc">Lossless voice memo recording, real-time waveform inspection, and automated transcription synthesis.</p>
          <div class="card-footer">
            <span class="card-status status-review">In Review</span>
            <button class="card-action-btn">Listen</button>
          </div>
        </div>
        <div class="feature-card" data-card="3">
          <div class="card-icon">⚡</div>
          <span class="card-tag">AI Vision Bridge</span>
          <h3 class="card-title">Image-to-Website Engine</h3>
          <p class="card-desc">Convert hand-drawn wireframes and digital screenshots directly into responsive semantic HTML & CSS.</p>
          <div class="card-footer">
            <span class="card-status status-ready">Active Pipeline</span>
            <button class="card-action-btn">Convert</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Dialectic Sandbox -->
  <section class="dialectic-section" id="dialectic">
    <div class="section-container">
      <div class="dialectic-box">
        <div class="dialectic-header">
          <div>
            <h2 class="section-title">Dialectic Inquiry Terminal</h2>
            <p class="section-subtitle">Test epistemic counter-arguments against the grounded codex archive.</p>
          </div>
          <span class="status-badge">Grounding: 4 Sources</span>
        </div>
        <div class="dialectic-interactive">
          <div class="input-group">
            <input type="text" id="hypothesisInput" placeholder="Enter a philosophical prompt or hypothesis (e.g., Is RLHF merely empirical habit?)..." class="text-input">
            <button id="inquireBtn" class="btn btn-primary">Interrogate</button>
          </div>
          <div id="dialecticResponse" class="response-card hidden">
            <div class="response-header">
              <span class="scholar-badge">Socratic Grounding Engine</span>
              <span class="timestamp" id="responseTimestamp">Just now</span>
            </div>
            <p id="responseText" class="response-body"></p>
            <div class="citation-tag" id="responseCitation">Citation: Hume Treatise I.III.VI · Russell '12 Ch.6 §2</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <span class="logo-badge">§</span>
        <span>Scholar Codex — Faculty of Epistemology</span>
      </div>
      <p class="footer-copy">Built for rigorous researchers, competitive prompt engineers, and archival codex curators.</p>
      <div class="footer-links">
        <a href="#hero">Top</a>
        <a href="#features">Chapters</a>
        <a href="#dialectic">Dialectic</a>
        <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
      css: `:root {
  --primary: #ffb68c;
  --primary-hover: #e5a968;
  --bg-color: #131315;
  --surface-1: #1e1e22;
  --surface-2: #26252b;
  --text-main: #f0ede6;
  --text-muted: #a39e93;
  --accent: #8ed5b4;
  --border-color: #2e2d35;
  --font-body: 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
  --font-serif: 'Literata', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius: 8px;
  --transition: all 0.2s ease-in-out;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family: var(--font-body);
  line-height: 1.6;
  font-size: 16px;
  overflow-x: hidden;
}

/* Header & Navigation */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(19, 19, 21, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 0.85rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--text-main);
  font-weight: 700;
  font-family: var(--font-serif);
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--surface-2);
  border: 1px solid var(--primary);
  color: var(--primary);
  border-radius: 4px;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: var(--transition);
}

.nav-link:hover, .nav-link.active {
  color: var(--primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-toggle {
  display: none;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 1.25rem;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius);
  cursor: pointer;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--primary);
  color: #131315;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--surface-2);
  color: var(--text-main);
  border-color: var(--border-color);
}

.btn-secondary:hover {
  background-color: #353437;
  border-color: var(--text-muted);
}

.btn-outline {
  background-color: transparent;
  color: var(--text-main);
  border-color: var(--border-color);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-lg {
  padding: 0.8rem 1.6rem;
  font-size: 1rem;
}

/* Hero Section */
.hero-section {
  padding: 5rem 1.5rem 4rem;
  background: radial-gradient(circle at 50% 20%, rgba(217, 119, 54, 0.12) 0%, rgba(19, 19, 21, 0) 70%);
  border-bottom: 1px solid var(--border-color);
}

.hero-container {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  background-color: var(--surface-1);
  border: 1px solid var(--border-color);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--primary);
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background-color: var(--accent);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.hero-title {
  font-family: var(--font-serif);
  font-size: 3rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}

.hero-title .highlight {
  color: var(--primary);
  text-decoration: underline;
  text-decoration-color: rgba(255, 182, 140, 0.4);
}

.hero-lead {
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 720px;
  margin: 0 auto 2.25rem;
  line-height: 1.7;
}

.hero-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3.5rem;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  border-top: 1px solid var(--border-color);
  padding-top: 2.5rem;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-value {
  font-family: var(--font-mono);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary);
}

.metric-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* Features Grid */
.features-section {
  padding: 4.5rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 3rem;
}

.text-center {
  text-align: center;
}

.section-title {
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.section-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background-color: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.75rem;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.card-tag {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--primary);
  margin-bottom: 0.5rem;
  display: inline-block;
}

.card-title {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.card-desc {
  color: var(--text-muted);
  font-size: 0.925rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.card-status {
  font-size: 0.75rem;
  font-family: var(--font-mono);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.status-mastered {
  background: rgba(142, 213, 180, 0.15);
  color: var(--accent);
}

.status-review {
  background: rgba(249, 186, 120, 0.15);
  color: #f9ba78;
}

.status-ready {
  background: rgba(255, 182, 140, 0.15);
  color: var(--primary);
}

.card-action-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--transition);
}

.card-action-btn:hover {
  background: var(--surface-2);
  border-color: var(--primary);
  color: var(--primary);
}

/* Dialectic Interactive */
.dialectic-section {
  padding: 4.5rem 1.5rem;
}

.dialectic-box {
  background-color: var(--surface-1);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 2.5rem;
}

.dialectic-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-badge {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  background-color: var(--surface-2);
  border: 1px solid var(--border-color);
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  color: var(--primary);
}

.input-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.text-input {
  flex: 1;
  background-color: #131315;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-family: var(--font-body);
  outline: none;
  transition: var(--transition);
}

.text-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(255, 182, 140, 0.2);
}

.response-card {
  background-color: var(--surface-2);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--primary);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.response-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.scholar-badge {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--primary);
  text-transform: uppercase;
}

.timestamp {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.response-body {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-main);
  margin-bottom: 0.75rem;
}

.citation-tag {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  font-family: var(--font-serif);
}

.hidden {
  display: none;
}

/* Footer */
.site-footer {
  border-top: 1px solid var(--border-color);
  padding: 2.5rem 1.5rem;
  background-color: #0e0e10;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.footer-copy {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.footer-links {
  display: flex;
  gap: 1rem;
}

.footer-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  transition: var(--transition);
}

.footer-links a:hover {
  color: var(--primary);
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.2rem; }
  .hero-metrics { grid-template-columns: 1fr; gap: 1rem; }
  .nav-menu, .nav-actions { display: none; }
  .mobile-toggle { display: block; }
  .input-group { flex-direction: column; }
}
`,
      js: `document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const inquireBtn = document.getElementById('inquireBtn');
  const hypothesisInput = document.getElementById('hypothesisInput');
  const dialecticResponse = document.getElementById('dialecticResponse');
  const responseText = document.getElementById('responseText');
  const modeToggleBtn = document.getElementById('modeToggleBtn');
  const launchBtn = document.getElementById('launchBtn');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = '#1e1e22';
        navMenu.style.padding = '1rem';
        navMenu.style.borderBottom = '1px solid #2e2d35';
      }
    });
  }

  const dialecticAnswers = [
    "Hume's Treatise of Human Nature demonstrates that inductive habits emerge from observed repetition, not epistemic certainty. In modern reward models, optimizing for compliance reproduces this telemetry trap: benchmark saturation reflects past feedback distributions rather than genuine deontic reasoning.",
    "Russell's Turkey Paradox proves that 1,000 successive mornings of grain cannot guarantee safety on Thanksgiving morning. Zero-shot transfer into adversarial environments exposes the brittleness of purely statistical association.",
    "Axiomatic alignment requires grounding beyond token frequencies: formal verification constraints, causal graphs, and epistemic margin guarantees that remain invariant under distribution shift."
  ];

  if (inquireBtn && hypothesisInput) {
    inquireBtn.addEventListener('click', () => {
      const query = hypothesisInput.value.trim();
      if (!query) return;

      inquireBtn.innerText = 'Interrogating...';
      inquireBtn.disabled = true;

      setTimeout(() => {
        const randAnswer = dialecticAnswers[Math.floor(Math.random() * dialecticAnswers.length)];
        if (responseText) responseText.innerText = randAnswer;
        if (dialecticResponse) dialecticResponse.classList.remove('hidden');
        inquireBtn.innerText = 'Interrogate';
        inquireBtn.disabled = false;
      }, 500);
    });
  }

  let isLight = false;
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      isLight = !isLight;
      if (isLight) {
        document.documentElement.style.setProperty('--bg-color', '#f7f6f3');
        document.documentElement.style.setProperty('--surface-1', '#ffffff');
        document.documentElement.style.setProperty('--surface-2', '#eae8e3');
        document.documentElement.style.setProperty('--text-main', '#1a1917');
        document.documentElement.style.setProperty('--text-muted', '#68655e');
        document.documentElement.style.setProperty('--border-color', '#d5d2cb');
        modeToggleBtn.innerText = 'Dark Mode';
      } else {
        document.documentElement.style.setProperty('--bg-color', '#131315');
        document.documentElement.style.setProperty('--surface-1', '#1e1e22');
        document.documentElement.style.setProperty('--surface-2', '#26252b');
        document.documentElement.style.setProperty('--text-main', '#f0ede6');
        document.documentElement.style.setProperty('--text-muted', '#a39e93');
        document.documentElement.style.setProperty('--border-color', '#2e2d35');
        modeToggleBtn.innerText = 'Toggle Theme';
      }
    });
  }

  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      alert('Scholar Codex Studio is running live and interactive!');
    });
  }
});
`
    }
  ],
  assets: [
    {
      id: 'asset-hero-1',
      name: 'Scholar Codex Emblem',
      url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80',
      type: 'image',
      size: '240 KB',
      associatedSection: 'hero',
      createdAt: new Date().toISOString(),
    }
  ],
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
        if (!parsed.websiteProjects || parsed.websiteProjects.length === 0) {
          parsed.websiteProjects = INITIAL_DATA.websiteProjects;
        }
        if (!parsed.assets) {
          parsed.assets = INITIAL_DATA.assets;
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

  // ==========================================
  // Website Projects Management
  // ==========================================
  getProjects(workbookId?: string): WebsiteProject[] {
    if (workbookId) {
      const filtered = this.data.websiteProjects.filter(p => p.workbookId === workbookId);
      if (filtered.length > 0) return filtered;
      // Fallback: return default project assigned to this workbook
      const defaultProj = this.data.websiteProjects[0];
      if (defaultProj) return [{ ...defaultProj, workbookId }];
    }
    return this.data.websiteProjects;
  }

  getProjectById(id: string): WebsiteProject | undefined {
    return this.data.websiteProjects.find(p => p.id === id);
  }

  createProject(projectData: Omit<WebsiteProject, 'id' | 'createdAt' | 'updatedAt' | 'version'>): WebsiteProject {
    const newProject: WebsiteProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.websiteProjects.unshift(newProject);
    this.saveData();
    return newProject;
  }

  updateProject(id: string, updates: Partial<WebsiteProject>): WebsiteProject | undefined {
    const index = this.data.websiteProjects.findIndex(p => p.id === id);
    if (index === -1) {
      // If updating default project under a different id, create or update first
      if (this.data.websiteProjects.length > 0) {
        this.data.websiteProjects[0] = {
          ...this.data.websiteProjects[0],
          ...updates,
          version: (this.data.websiteProjects[0].version || 1) + 1,
          updatedAt: new Date().toISOString(),
        };
        this.saveData();
        return this.data.websiteProjects[0];
      }
      return undefined;
    }

    this.data.websiteProjects[index] = {
      ...this.data.websiteProjects[index],
      ...updates,
      version: (this.data.websiteProjects[index].version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.websiteProjects[index];
  }

  deleteProject(id: string): boolean {
    const initLen = this.data.websiteProjects.length;
    this.data.websiteProjects = this.data.websiteProjects.filter(p => p.id !== id);
    if (this.data.websiteProjects.length !== initLen) {
      this.saveData();
      return true;
    }
    return false;
  }

  // ==========================================
  // Asset Management
  // ==========================================
  getAssets(): ProjectAsset[] {
    return this.data.assets || [];
  }

  addAsset(asset: Omit<ProjectAsset, 'id' | 'createdAt'>): ProjectAsset {
    const newAsset: ProjectAsset = {
      ...asset,
      id: `asset-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.assets) this.data.assets = [];
    this.data.assets.unshift(newAsset);
    this.saveData();
    return newAsset;
  }

  deleteAsset(id: string): boolean {
    if (!this.data.assets) return false;
    const initLen = this.data.assets.length;
    this.data.assets = this.data.assets.filter(a => a.id !== id);
    if (this.data.assets.length !== initLen) {
      this.saveData();
      return true;
    }
    return false;
  }
}

export const db = new Database();

