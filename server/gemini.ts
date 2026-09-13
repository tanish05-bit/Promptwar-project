import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI, Type } from "@google/genai";

interface KeySlot {
  key: string;
  label: string;
  isExhausted: boolean;
  exhaustedAt: number | null;
}

class GeminiKeyManager {
  private slots: KeySlot[] = [];
  private activeIndex: number = 0;
  private quotaFailoverCount: number = 0;
  private lastSwitchedAt: string = 'Initialization';

  constructor() {
    this.refreshKeys();
  }

  refreshKeys() {
    const keys: KeySlot[] = [];
    // User-provided API key from .env
    const userKey = process.env.USER_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (userKey && userKey.trim()) {
      keys.push({
        key: userKey.trim(),
        label: 'User Provided API Key',
        isExhausted: false,
        exhaustedAt: null,
      });
    }

    // Secondary / system fallback key if available and different
    const sysKey = process.env.GEMINI_API_KEY;
    if (sysKey && sysKey.trim() && !keys.some(k => k.key === sysKey.trim())) {
      keys.push({
        key: sysKey.trim(),
        label: 'System Environment Key',
        isExhausted: false,
        exhaustedAt: null,
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
        model: 'gemini-3.8-flash',
        contents: context ? `Context:\n${context}\n\nUser Prompt:\n${prompt}` : prompt,
        config: {
          systemInstruction: defaultInstruction,
          temperature: 0.7,
        },
      });

      return {
        text: response.text || 'Synthesis completed.',
        model: 'gemini-3.8-flash',
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
          model: 'gemini-3.8-flash',
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
        model: 'gemini-3.8-flash',
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
        model: 'gemini-3.8-flash',
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
