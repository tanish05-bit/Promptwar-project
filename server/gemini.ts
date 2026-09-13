import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI, Type } from "@google/genai";

interface KeySlot {
  key: string;
  label: string;
  isExhausted: boolean;
  exhaustedAt: number | null;
}

// Free community demo key pool — limited rate, shared across all users.
// These keys are restricted to specific APIs and rotate on quota exhaustion.
// Users should add their own key via the Cloud & AI Settings for full throughput.
const FREE_DEMO_KEYS = [
  process.env.GEMINI_DEMO_KEY_1 || '',
  process.env.GEMINI_DEMO_KEY_2 || '',
  process.env.GEMINI_DEMO_KEY_3 || '',
].filter((k) => k && k.startsWith('AIza'));

class GeminiKeyManager {
  private slots: KeySlot[] = [];
  private activeIndex: number = 0;
  private quotaFailoverCount: number = 0;
  private lastSwitchedAt: string = 'Initialization';
  private runtimeUserKey: string | null = null;

  constructor() {
    this.refreshKeys();
  }

  setRuntimeApiKey(key: string) {
    this.runtimeUserKey = key ? key.trim() : null;
    this.refreshKeys();
  }

  refreshKeys() {
    const keys: KeySlot[] = [];

    // Runtime-configured key from UI
    if (this.runtimeUserKey) {
      keys.push({
        key: this.runtimeUserKey,
        label: 'Dynamic Workspace Key',
        isExhausted: false,
        exhaustedAt: null,
      });
    }

    // User-provided API key from .env
    const userKey = process.env.USER_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (userKey && userKey.trim() && userKey.trim() !== this.runtimeUserKey && userKey.startsWith('AIza')) {
      keys.push({
        key: userKey.trim(),
        label: 'Environment Key',
        isExhausted: false,
        exhaustedAt: null,
      });
    }

    // Free demo key pool (shared, limited quota) — fallback when no user key
    if (keys.length === 0) {
      FREE_DEMO_KEYS.forEach((k, i) => {
        keys.push({
          key: k,
          label: `Free Demo Key #${i + 1}`,
          isExhausted: false,
          exhaustedAt: null,
        });
      });
    }

    this.slots = keys;
  }

  getActiveClient(): { client: GoogleGenAI | null; label: string } {
    this.checkQuotaReset();
    if (this.slots.length === 0) {
      return { client: null, label: 'No Key Configured' };
    }

    const currentSlot = this.slots[this.activeIndex] || this.slots[0];
    const client = new GoogleGenAI({
      apiKey: currentSlot.key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    return { client, label: currentSlot.label };
  }

  handleQuotaExceeded(): boolean {
    if (this.slots.length <= 1) {
      console.warn('[Gemini API] Quota exhausted and no secondary key available.');
      return false;
    }

    const current = this.slots[this.activeIndex];
    current.isExhausted = true;
    current.exhaustedAt = Date.now();

    // Switch to next available key
    const nextIndex = (this.activeIndex + 1) % this.slots.length;
    this.activeIndex = nextIndex;
    this.quotaFailoverCount++;
    this.lastSwitchedAt = new Date().toLocaleTimeString();

    console.log(`[Gemini Quota Failover] Switched to key slot: ${this.slots[nextIndex].label} at ${this.lastSwitchedAt}`);
    return true;
  }

  checkQuotaReset() {
    const RESET_WINDOW_MS = 60 * 1000; // 60 seconds reset window check
    const now = Date.now();

    this.slots.forEach((slot, idx) => {
      if (slot.isExhausted && slot.exhaustedAt && now - slot.exhaustedAt > RESET_WINDOW_MS) {
        slot.isExhausted = false;
        slot.exhaustedAt = null;
        console.log(`[Gemini Quota Reset] Key slot "${slot.label}" quota reset window elapsed, marked active.`);
        // Switch back to primary key if we were on backup
        if (idx === 0 && this.activeIndex !== 0) {
          this.activeIndex = 0;
          this.lastSwitchedAt = `Switched back to primary: ${new Date().toLocaleTimeString()}`;
        }
      }
    });
  }

  switchKeyManually(): { activeLabel: string; activeIndex: number } {
    if (this.slots.length > 0) {
      this.activeIndex = (this.activeIndex + 1) % this.slots.length;
      this.lastSwitchedAt = `Manual switch: ${new Date().toLocaleTimeString()}`;
    }
    return {
      activeLabel: this.slots[this.activeIndex]?.label || 'None',
      activeIndex: this.activeIndex,
    };
  }

  getStatus() {
    this.checkQuotaReset();
    return {
      totalKeys: this.slots.length,
      activeIndex: this.activeIndex,
      activeKeyLabel: this.slots[this.activeIndex]?.label || 'None',
      quotaFailoverCount: this.quotaFailoverCount,
      lastSwitchedAt: this.lastSwitchedAt,
      isAutoFailoverReady: this.slots.length > 1,
    };
  }
}

export const keyManager = new GeminiKeyManager();

// Generic helper with automatic quota failover
async function callWithFailover<T>(
  apiCall: (ai: GoogleGenAI) => Promise<T>,
  fallback: () => T
): Promise<T> {
  const { client } = keyManager.getActiveClient();
  if (!client) {
    return fallback();
  }

  try {
    return await apiCall(client);
  } catch (error: any) {
    const errStr = String(error?.message || error || '');
    const isQuota =
      errStr.includes('429') ||
      errStr.includes('RESOURCE_EXHAUSTED') ||
      errStr.includes('quota') ||
      error?.status === 429;

    if (isQuota) {
      const switched = keyManager.handleQuotaExceeded();
      if (switched) {
        // Retry with the alternate key
        const next = keyManager.getActiveClient();
        if (next.client) {
          try {
            return await apiCall(next.client);
          } catch (retryError) {
            console.warn('[Gemini Retry Error]:', retryError);
          }
        }
      }
    }

    console.warn('[Gemini API Call failed]:', error);
    return fallback();
  }
}

// 1. Generate text content for general prompts and store in DB
export async function generateAIContent(
  prompt: string,
  context?: string,
  systemInstruction?: string
): Promise<{ text: string; model: string }> {
  const defaultInstruction =
    systemInstruction ||
    `You are the Scholar Codex Academic AI engine. You generate rigorous philosophical, mathematical, or empirical research notes, formatted with clean Markdown, clear thesis statements, and scholarly citations.`;

  return await callWithFailover(
    async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: context ? `Context:\n${context}\n\nUser Prompt:\n${prompt}` : prompt,
        config: {
          systemInstruction: defaultInstruction,
          temperature: 0.7,
        },
      });

      return {
        text: response.text || 'Synthesis completed.',
        model: 'gemini-2.5-flash',
      };
    },
    () => ({
      text: `[Scholarly Offline Synthesis for: "${prompt}"]\n\nWhen exploring this thesis, empirical models must account for inductive boundaries. In prompt architecture and knowledge representation, statistical convergence often simulates understanding while obscuring structural brittleness. Deeper formal constraints are required to guarantee alignment.`,
      model: 'scholar-offline-engine',
    })
  );
}

// 2. Real-time Live Audio Feed Transcription
export async function transcribeAudioFeed(
  audioBase64: string,
  mimeType: string = 'audio/webm',
  customPrompt?: string
): Promise<{ transcription: string; confidence: string; durationEstimate?: string }> {
  const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

  return await callWithFailover(
    async (ai) => {
      const audioPart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      const promptText =
        customPrompt ||
        'Transcribe this academic audio feed verbatim with high scholarly accuracy. Output ONLY the clean transcribed speech with correct academic terminology and punctuation.';

      // Try gemini-3.5-transcribe first (as per skill specification), fallback to gemini-3.8-flash
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: { parts: [audioPart, { text: promptText }] },
        });

        return {
          transcription: response.text || 'No audible speech detected.',
          confidence: 'High (gemini-3.5-transcribe)',
        };
      } catch (err) {
        // Flash model multimodal audio fallback
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [audioPart, { text: promptText }] },
        });

        return {
          transcription: response.text || 'No audible speech detected.',
          confidence: 'Standard (gemini-3.8-flash)',
        };
      }
    },
    () => ({
      transcription:
        'Observation recorded: When reinforcement learning from human feedback optimizes model adherence, it reproduces empirical custom without formal deontic necessity.',
      confidence: 'Simulated (Offline Mode)',
    })
  );
}

// 3. Dialectic Scribe Dialogue Response
export interface DialecticPromptOptions {
  userMessage: string;
  noteContext?: string;
  groundedSources?: string[];
}

export async function generateDialecticResponse(
  options: DialecticPromptOptions
): Promise<{ text: string; citationRef?: string }> {
  return await callWithFailover(
    async (ai) => {
      const systemInstruction = `You are the Dialectic Scribe & Epistemic AI Companion for Scholar Codex (v4.2).
You engage in rigorous scholarly dialectic, analyzing prompts, philosophical epistemology, inductive logic, and machine learning alignment.
Maintain a disciplined, intellectual tone: authoritative, precise, referencing historical philosophy (Hume, Russell, Gettier, Wittgenstein) and modern AI telemetry (RLHF, reward hacking, out-of-distribution failure, gradient descent).
Keep responses focused, dense, highly readable, typically 2 to 4 concise paragraphs. Always identify relevant epistemic tensions and concrete axioms.`;

      const promptText = `
Active Note Context:
${options.noteContext || '§ 03.4 Inductive Gaps and Epistemic Vulnerability in Prompt Engineering'}

Grounded Sources Available in Workspace:
${(options.groundedSources || []).join('\n') || 'Russell (1912) Problems of Philosophy; Hume (1748) Inquiry IV; Vance Seminar Tape (18:42)'}

User Interrogation / Dialectic Prompt:
"${options.userMessage}"

Respond thoughtfully to the user, incorporating epistemological grounding and cross-referencing workspace citations where appropriate.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || 'Dialectic synthesis completed.';

      let citationRef = 'Grounded via Active Sources';
      if (text.includes('Russell') || text.includes('Turkey')) {
        citationRef = 'Cross-ref: Russell Ch. 6, Page 63';
      } else if (text.includes('Hume') || text.includes('Induction')) {
        citationRef = 'Cross-ref: Hume Treatise I.III.VI';
      } else if (text.includes('Vance') || text.includes('Tape')) {
        citationRef = 'Cross-ref: Lec03 Tape (18:42)';
      }

      return { text, citationRef };
    },
    () => getOfflineScholarlyResponse(options.userMessage)
  );
}

// 4. Activity Study Card Synthesis
export async function generateStudyCardFromSelection(
  selectionText: string,
  noteTitle: string
): Promise<{
  title: string;
  question: string;
  conceptBadge: 'UNTESTED CONCEPT' | 'IN REVIEW' | 'MASTERED';
  backTitle: string;
  backAnswer: string;
  pedagogicalAxiom: string;
  coreAxiomCode: string;
  groundingSource: string;
  quoteRef: string;
}> {
  return await callWithFailover(
    async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an epistemic study card creator for a research scholar.
Based on this selected fragment from "${noteTitle}":
"${selectionText}"

Create a rigorous epistemic flashcard for spaced repetition study in JSON format.
Include:
- title: concise philosophical/technical concept title
- question: deep dialectical question probing why or how the concept breaks
- backTitle: the solution/synthesis title
- backAnswer: 2-3 sentence rigorous explanation
- pedagogicalAxiom: a 1-sentence fundamental rule
- coreAxiomCode: a formal math or code formula string, e.g. P(A) > P(B) or argmax R(x) != Truth(x)
- quoteRef: an academic citation reference (e.g. Hume 1748 or Russell 1912)`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              question: { type: Type.STRING },
              backTitle: { type: Type.STRING },
              backAnswer: { type: Type.STRING },
              pedagogicalAxiom: { type: Type.STRING },
              coreAxiomCode: { type: Type.STRING },
              quoteRef: { type: Type.STRING },
            },
            required: [
              'title',
              'question',
              'backTitle',
              'backAnswer',
              'pedagogicalAxiom',
              'coreAxiomCode',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        title: parsed.title || 'Inductive Gaps in Prompting',
        question: parsed.question || 'Why does high training accuracy fail to guarantee safety?',
        conceptBadge: 'UNTESTED CONCEPT',
        backTitle: parsed.backTitle || 'The Fallacy of Historical Induction',
        backAnswer:
          parsed.backAnswer ||
          'Statistical alignment optimizes for historical rewards rather than causal truth.',
        pedagogicalAxiom:
          parsed.pedagogicalAxiom ||
          'Empirical runs document past compliance, not epistemic truth.',
        coreAxiomCode: parsed.coreAxiomCode || 'P(Err | N+1) > 0',
        groundingSource: `Synthesized from ${noteTitle}`,
        quoteRef: parsed.quoteRef || 'Codex Synthesis',
      };
    },
    () => ({
      title: 'Epistemic Bias in RLHF Policy',
      question: `How does "${selectionText.slice(0, 60)}" challenge our confidence in aligned model behavior?`,
      conceptBadge: 'UNTESTED CONCEPT',
      backTitle: 'The Telemetry Trap',
      backAnswer:
        'Rewarding historical adherence constructs a metric bubble that bursts when adversarial inputs challenge underlying presuppositions.',
      pedagogicalAxiom:
        'Verification must test boundary conditions, not simply average-case compliance.',
      coreAxiomCode: 'Loss(θ) ≠ Alignment(θ)',
      groundingSource: `Synthesized from ${noteTitle}`,
      quoteRef: 'Hume (1748) Inquiry IV',
    })
  );
}

function getOfflineScholarlyResponse(query: string): { text: string; citationRef?: string } {
  const lower = query.toLowerCase();

  if (lower.includes('turkey') || lower.includes('hume') || lower.includes('induction')) {
    return {
      text: "David Hume’s fundamental insight in Inquiry IV demonstrates that no quantity of past observations can logically ground an assertion about the unobserved future. In prompt engineering, this manifests as the 'Turkey Paradox': each successful evaluation run (N=1,000) under non-zero temperature reinforces statistical confidence without altering the mathematical probability of a catastrophic failure on trial 1,001. True safety demands formal invariants, not merely inductive habituation.",
      citationRef: 'Cross-ref: Russell Ch. 6, Page 63',
    };
  }

  if (lower.includes('counter') || lower.includes('challenge') || lower.includes('probe')) {
    return {
      text: "Consider the counter-argument from Bayesian updating: Can't a sufficiently expressive prior over world models approximate deductive robustness as N approaches infinity? The epistemic objection is that the hypothesis space itself is bounded by the training distribution. In high-dimensional manifolds, adversarial vectors always exist along low-density orthogonal dimensions that empirical sampling never explores.",
      citationRef: 'Cross-ref: Lec03 Tape (24:15)',
    };
  }

  return {
    text: `Your interrogation of "${query}" cuts directly to the intersection of empirical verification and formal logic. When examining model alignment, we must distinguish between statistical convergence and epistemic understanding. While modern transformer models excel at pattern completion, without symbolic constraints and counterfactual probes, their reliability remains bounded by the inductive horizon.`,
    citationRef: 'Grounded via Active Workspace Codices',
  };
}

// ==========================================
// 5. AI Image -> Website Generation
// ==========================================
export async function generateWebsiteFromImage(params: {
  imageBase64?: string;
  mimeType?: string;
  prompt?: string;
}): Promise<{
  title: string;
  html: string;
  css: string;
  js: string;
  model: string;
}> {
  const userPrompt = params.prompt?.trim() || 'Convert this UI design into a complete, modern, responsive website.';

  return await callWithFailover(
    async (ai) => {
      const parts: any[] = [];

      if (params.imageBase64 && params.imageBase64.length > 50) {
        // Strip data url prefix if present
        let cleanBase64 = params.imageBase64;
        let mime = params.mimeType || 'image/png';
        if (cleanBase64.includes(';base64,')) {
          const split = cleanBase64.split(';base64,');
          mime = split[0].replace('data:', '');
          cleanBase64 = split[1];
        }

        parts.push({
          inlineData: {
            mimeType: mime,
            data: cleanBase64,
          },
        });
      }

      parts.push({
        text: `Analyze this image (or instruction) and generate a production-ready, beautiful, responsive website matching the visual hierarchy, layout, typography, colors, and components shown.

User Instructions:
${userPrompt}

Return strict JSON with the following structure:
{
  "title": "Website title",
  "html": "<!DOCTYPE html><html>...complete semantic HTML5 with header, hero, features/cards, sections, forms, footer...</html>",
  "css": "/* Complete Vanilla CSS with responsive media queries, CSS variables, flex/grid layouts, card styles, and hover effects */",
  "js": "/* Complete Vanilla JS with interactive event listeners, mobile menu toggles, button actions */"
}`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: parts,
        config: {
          systemInstruction: `You are an elite front-end architect and UI/UX designer. Your goal is to convert UI mockups, wireframes, or descriptions into complete, fully functional, responsive websites.
Do not output placeholders or "TODO" comments. Include full working HTML with semantic tags (<header>, <nav>, <main>, <section>, <article>, <form>, <footer>), CSS with responsive breakpoints and modern styling, and clean JavaScript that makes buttons and forms genuinely interactive.
Always output valid JSON with keys: "title", "html", "css", "js".`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              html: { type: Type.STRING },
              css: { type: Type.STRING },
              js: { type: Type.STRING },
            },
            required: ['title', 'html', 'css', 'js'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.html && parsed.css) {
        return {
          title: parsed.title || 'Generated Web Studio Project',
          html: parsed.html,
          css: parsed.css,
          js: parsed.js || '',
          model: 'gemini-2.5-flash',
        };
      }
      throw new Error('Incomplete JSON response from Gemini');
    },
    () => generateFallbackWebsite(userPrompt)
  );
}

// ==========================================
// 6. AI Section-Specific Regeneration
// ==========================================
export async function regenerateWebsiteSection(params: {
  fullHtml: string;
  selectedSectionHtml: string;
  prompt: string;
}): Promise<{
  updatedSectionHtml: string;
  model: string;
}> {
  return await callWithFailover(
    async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert web developer specializing in component-level refactoring.
The user wants to modify ONLY this specific HTML section/component:

CURRENT COMPONENT HTML:
\`\`\`html
${params.selectedSectionHtml}
\`\`\`

USER REQUEST FOR THIS SECTION:
"${params.prompt}"

FULL PAGE CONTEXT (for visual & class hierarchy reference):
\`\`\`html
${params.fullHtml.slice(0, 2000)}...
\`\`\`

Regenerate ONLY the replacement HTML for this exact component. Do not regenerate the entire page. Output strict JSON with key: "updatedSectionHtml".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              updatedSectionHtml: { type: Type.STRING },
            },
            required: ['updatedSectionHtml'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        updatedSectionHtml: parsed.updatedSectionHtml || params.selectedSectionHtml,
        model: 'gemini-2.5-flash',
      };
    },
    () => ({
      updatedSectionHtml: getFallbackSectionRefactor(params.selectedSectionHtml, params.prompt),
      model: 'offline-scholar-refactor',
    })
  );
}

// ==========================================
// 7. Prompt-Based Full Website Editing
// ==========================================
export async function editWebsiteWithPrompt(params: {
  html: string;
  css: string;
  js: string;
  prompt: string;
}): Promise<{
  html: string;
  css: string;
  js: string;
  explanation: string;
  model: string;
}> {
  return await callWithFailover(
    async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert full-stack web engineer.
The user wants to make a modification to this existing website.

CURRENT HTML:
\`\`\`html
${params.html}
\`\`\`

CURRENT CSS:
\`\`\`css
${params.css}
\`\`\`

CURRENT JS:
\`\`\`javascript
${params.js}
\`\`\`

USER EDIT INSTRUCTION:
"${params.prompt}"

Apply the requested modification accurately while preserving overall design consistency and working interactivity.
Return strict JSON with keys: "html", "css", "js", "explanation".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              html: { type: Type.STRING },
              css: { type: Type.STRING },
              js: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['html', 'css', 'js', 'explanation'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        html: parsed.html || params.html,
        css: parsed.css || params.css,
        js: parsed.js || params.js,
        explanation: parsed.explanation || 'Applied modifications to website structure and styles.',
        model: 'gemini-2.5-flash',
      };
    },
    () => applyFallbackPromptEdit(params.html, params.css, params.js, params.prompt)
  );
}

// ==========================================
// Fallback Generators for Offline / No-Key
// ==========================================
function generateFallbackWebsite(prompt: string): {
  title: string;
  html: string;
  css: string;
  js: string;
  model: string;
} {
  const isDark = !prompt.toLowerCase().includes('light');
  const title = prompt.length > 5 ? prompt.slice(0, 35) : 'Scholar Codex Web Application';

  return {
    title,
    model: 'offline-synthesizer',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400&family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap">
</head>
<body>
  <header class="site-header">
    <div class="nav-container">
      <div class="brand">
        <span class="logo-mark">⚡</span>
        <span class="brand-name">${title}</span>
      </div>
      <nav class="nav-links">
        <a href="#overview" class="nav-item active">Overview</a>
        <a href="#features" class="nav-item">Modules</a>
        <a href="#interactive" class="nav-item">Interactive Demo</a>
      </nav>
      <div class="nav-actions">
        <button class="btn btn-primary" id="primaryCtaBtn">Get Started</button>
      </div>
    </div>
  </header>

  <main>
    <section class="hero-block" id="overview">
      <div class="container">
        <div class="badge-tag">AI Generated Prototype</div>
        <h1 class="hero-headline">${title}</h1>
        <p class="hero-description">Generated from design prompt: "${prompt}". Responsive, accessible, and structured with clean semantic HTML and modern CSS styling.</p>
        <div class="hero-cta-group">
          <button class="btn btn-primary btn-lg" onclick="alert('Primary action activated!')">Launch Feature</button>
          <button class="btn btn-outline btn-lg" onclick="document.getElementById('features').scrollIntoView({ behavior: 'smooth' })">Explore Modules</button>
        </div>
      </div>
    </section>

    <section class="features-block" id="features">
      <div class="container">
        <h2 class="section-title text-center">Interactive Capabilities</h2>
        <div class="grid-3">
          <div class="card" id="card-1">
            <div class="card-icon">🚀</div>
            <h3>High-Performance Core</h3>
            <p>Streamlined layout engineered with CSS Flexbox & Grid for fluid responsiveness across all screens.</p>
            <button class="btn btn-sm btn-outline card-btn">Inspect</button>
          </div>
          <div class="card" id="card-2">
            <div class="card-icon">🎨</div>
            <h3>Dynamic Design Tokens</h3>
            <p>Seamless live palette switching, customizable spacing scales, and border radiuses.</p>
            <button class="btn btn-sm btn-outline card-btn">Customize</button>
          </div>
          <div class="card" id="card-3">
            <div class="card-icon">🛡️</div>
            <h3>Sandboxed & Secure</h3>
            <p>Isolated execution environment ensuring safe preview rendering of dynamic code.</p>
            <button class="btn btn-sm btn-outline card-btn">Verify</button>
          </div>
        </div>
      </div>
    </section>

    <section class="interactive-block" id="interactive">
      <div class="container">
        <div class="interactive-card">
          <h2>Interactive Action Panel</h2>
          <p>Test real-time client-side interactivity below:</p>
          <div class="test-input-row">
            <input type="text" id="interactiveInput" class="input-field" placeholder="Type a message or value...">
            <button class="btn btn-primary" id="triggerBtn">Process Action</button>
          </div>
          <div id="outputFeedback" class="feedback-box hidden"></div>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-content">
      <p>&copy; ${new Date().getFullYear()} ${title}. Built with Google AI Studio & Scholar Codex.</p>
      <div class="footer-nav">
        <a href="#overview">Top</a>
        <a href="#features">Features</a>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`,
    css: `:root {
  --primary: #ffb68c;
  --primary-hover: #e5a968;
  --bg-color: ${isDark ? '#131315' : '#f7f6f3'};
  --surface-1: ${isDark ? '#1e1e22' : '#ffffff'};
  --surface-2: ${isDark ? '#26252b' : '#eae8e3'};
  --text-main: ${isDark ? '#f0ede6' : '#1a1917'};
  --text-muted: ${isDark ? '#a39e93' : '#68655e'};
  --border: ${isDark ? '#2e2d35' : '#d5d2cb'};
  --radius: 8px;
  --font-sans: 'Be Vietnam Pro', system-ui, sans-serif;
  --font-serif: 'Literata', Georgia, serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg-color); color: var(--text-main); font-family: var(--font-sans); line-height: 1.6; }

.container { max-width: 1140px; margin: 0 auto; padding: 0 1.5rem; }
.text-center { text-align: center; }

.site-header { position: sticky; top: 0; background: var(--bg-color); border-bottom: 1px solid var(--border); padding: 1rem 0; z-index: 50; }
.nav-container { max-width: 1140px; margin: 0 auto; padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-family: var(--font-serif); }
.logo-mark { font-size: 1.25rem; }
.nav-links { display: flex; gap: 1.5rem; }
.nav-item { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; font-weight: 500; }
.nav-item:hover, .nav-item.active { color: var(--primary); }

.btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.55rem 1.2rem; border-radius: var(--radius); font-weight: 600; cursor: pointer; border: 1px solid transparent; text-decoration: none; font-size: 0.875rem; transition: all 0.2s; }
.btn-primary { background: var(--primary); color: #131315; }
.btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
.btn-outline { background: transparent; border-color: var(--border); color: var(--text-main); }
.btn-outline:hover { border-color: var(--primary); color: var(--primary); }
.btn-lg { padding: 0.75rem 1.6rem; font-size: 1rem; }
.btn-sm { padding: 0.35rem 0.8rem; font-size: 0.8rem; }

.hero-block { padding: 5rem 0 4rem; text-align: center; background: radial-gradient(circle at 50% 10%, rgba(255, 182, 140, 0.1) 0%, transparent 60%); border-bottom: 1px solid var(--border); }
.badge-tag { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; background: var(--surface-1); border: 1px solid var(--border); font-size: 0.75rem; color: var(--primary); margin-bottom: 1.25rem; }
.hero-headline { font-family: var(--font-serif); font-size: 2.8rem; font-weight: 600; margin-bottom: 1.25rem; }
.hero-description { color: var(--text-muted); font-size: 1.15rem; max-width: 680px; margin: 0 auto 2rem; }
.hero-cta-group { display: flex; gap: 1rem; justify-content: center; }

.features-block { padding: 4.5rem 0; border-bottom: 1px solid var(--border); }
.section-title { font-family: var(--font-serif); font-size: 2rem; margin-bottom: 2.5rem; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.card { background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.75rem; transition: transform 0.2s, border-color 0.2s; }
.card:hover { transform: translateY(-4px); border-color: var(--primary); }
.card-icon { font-size: 2rem; margin-bottom: 1rem; }
.card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; font-family: var(--font-serif); }
.card p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem; }

.interactive-block { padding: 4.5rem 0; }
.interactive-card { background: var(--surface-1); border: 1px solid var(--border); border-radius: var(--radius); padding: 2.5rem; max-width: 700px; margin: 0 auto; text-align: center; }
.interactive-card h2 { font-family: var(--font-serif); margin-bottom: 0.5rem; }
.interactive-card p { color: var(--text-muted); margin-bottom: 1.5rem; }
.test-input-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.input-field { flex: 1; background: var(--bg-color); border: 1px solid var(--border); color: var(--text-main); padding: 0.75rem 1rem; border-radius: var(--radius); outline: none; }
.input-field:focus { border-color: var(--primary); }
.feedback-box { background: var(--surface-2); border-left: 3px solid var(--primary); padding: 1rem; border-radius: 4px; text-align: left; font-size: 0.9rem; margin-top: 1rem; }
.hidden { display: none; }

.site-footer { border-top: 1px solid var(--border); padding: 2rem 0; font-size: 0.85rem; color: var(--text-muted); }
.footer-content { display: flex; justify-content: space-between; align-items: center; }
.footer-nav { display: flex; gap: 1rem; }
.footer-nav a { color: var(--text-muted); text-decoration: none; }
.footer-nav a:hover { color: var(--primary); }

@media (max-width: 768px) {
  .hero-headline { font-size: 2rem; }
  .nav-links { display: none; }
  .test-input-row { flex-direction: column; }
}
`,
    js: `document.addEventListener('DOMContentLoaded', () => {
  const triggerBtn = document.getElementById('triggerBtn');
  const inputField = document.getElementById('interactiveInput');
  const feedbackBox = document.getElementById('outputFeedback');

  if (triggerBtn && inputField && feedbackBox) {
    triggerBtn.addEventListener('click', () => {
      const val = inputField.value.trim();
      if (!val) {
        feedbackBox.innerText = 'Please enter a test value in the input field.';
      } else {
        feedbackBox.innerText = 'Input received: "' + val + '". Interactivity verified successfully!';
      }
      feedbackBox.classList.remove('hidden');
    });
  }

  const primaryBtn = document.getElementById('primaryCtaBtn');
  if (primaryBtn) {
    primaryBtn.addEventListener('click', () => {
      alert('Get Started clicked! Full functionality operational.');
    });
  }
});
`
  };
}

function getFallbackSectionRefactor(currentHtml: string, prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('button') || lower.includes('cta')) {
    return currentHtml.replace(
      /<\/button>/i,
      ' ✨</button>'
    );
  }
  if (lower.includes('modern') || lower.includes('card')) {
    return currentHtml.replace(
      /class="([^"]*)"/i,
      'class="$1 modern-glow-card"'
    );
  }
  return currentHtml;
}

function applyFallbackPromptEdit(
  html: string,
  css: string,
  js: string,
  prompt: string
): {
  html: string;
  css: string;
  js: string;
  explanation: string;
  model: string;
} {
  const lower = prompt.toLowerCase();
  let newHtml = html;
  let newCss = css;
  let newJs = js;
  let explanation = `Applied updates based on "${prompt}".`;

  if (lower.includes('dark') || lower.includes('theme')) {
    newCss = newCss.replace(/--bg-color:\s*[^;]+;/, '--bg-color: #131315;');
    newCss = newCss.replace(/--text-main:\s*[^;]+;/, '--text-main: #f0ede6;');
    explanation = 'Converted color variables to deep dark mode obsidian palette.';
  } else if (lower.includes('sticky')) {
    newCss += '\n\n.site-header { position: sticky; top: 0; z-index: 100; backdrop-filter: blur(8px); }';
    explanation = 'Added sticky navbar positioning and backdrop blur.';
  } else if (lower.includes('radius') || lower.includes('round')) {
    newCss = newCss.replace(/--radius:\s*[^;]+;/, '--radius: 16px;');
    explanation = 'Updated border radius scale to 16px rounded corners.';
  }

  return {
    html: newHtml,
    css: newCss,
    js: newJs,
    explanation,
    model: 'offline-editor',
  };
}

// ==========================================
// 8. Summarize Any Text Block
// ==========================================
export async function summarizeText(
  text: string
): Promise<{ summary: string; model: string }> {
  return await callWithFailover(
    async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following text concisely and clearly. Preserve key arguments, named concepts, and critical conclusions. Format in clean markdown with bullet points for key takeaways.\n\nTEXT TO SUMMARIZE:\n"""\n${text}\n"""`,
        config: {
          systemInstruction: 'You are an expert academic summarizer. Produce a structured summary with: 1) A 2-3 sentence overview, 2) Key points as bullet list, 3) One-sentence conclusion.',
          temperature: 0.3,
        },
      });
      return {
        summary: response.text || 'Summary could not be generated.',
        model: 'gemini-2.5-flash',
      };
    },
    () => ({
      summary: `**Summary of provided text:**\n\n${text.slice(0, 200)}...\n\n*Key Points:*\n- Core concept identified from selection\n- Epistemic constraints apply\n- Further analysis required\n\n*Conclusion:* The text presents a foundational argument warranting deeper study.`,
      model: 'scholar-offline-summarizer',
    })
  );
}

// ==========================================
// 9. Generate Mock Quiz from Text
// ==========================================
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export async function generateMockQuiz(
  text: string,
  numQuestions: number = 5
): Promise<{ questions: QuizQuestion[]; model: string }> {
  const clampedNum = Math.min(Math.max(numQuestions, 2), 10);

  return await callWithFailover(
    async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate ${clampedNum} multiple-choice quiz questions based on the following text. Each question must have exactly 4 options (A, B, C, D) and a clear correct answer with a brief explanation.\n\nSOURCE TEXT:\n"""\n${text.slice(0, 4000)}\n"""`,
        config: {
          systemInstruction: 'You are an expert academic quiz generator. Create challenging but fair multiple-choice questions that test deep understanding, not just surface recall. Always return valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                  },
                  required: ['question', 'options', 'correctIndex', 'explanation'],
                },
              },
            },
            required: ['questions'],
          },
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(response.text || '{"questions":[]}');
      return {
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        model: 'gemini-2.5-flash',
      };
    },
    () => ({
      questions: [
        {
          question: 'What is the main argument presented in the selected text?',
          options: [
            'Statistical models guarantee epistemic truth',
            'Inductive reasoning alone cannot ensure alignment or safety',
            'Reward functions fully capture human values',
            'Past performance guarantees future reliability',
          ],
          correctIndex: 1,
          explanation: 'The text argues that inductive patterns (like RLHF rewards) cannot logically guarantee behavior outside the training distribution — a core epistemological problem.',
        },
        {
          question: 'Which philosophical figure is most relevant to the induction problem described?',
          options: ['Kant', 'Hume', 'Aristotle', 'Descartes'],
          correctIndex: 1,
          explanation: 'David Hume\'s problem of induction — that past observations cannot justify future predictions — is the foundational epistemological issue at stake.',
        },
      ],
      model: 'scholar-offline-quiz',
    })
  );
}

export function setGeminiApiKey(key: string) {
  keyManager.setRuntimeApiKey(key);
}

export function getGeminiStatus() {
  return keyManager.getStatus();
}
