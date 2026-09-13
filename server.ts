import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import JSZip from 'jszip';
import {
  generateDialecticResponse,
  generateStudyCardFromSelection,
  generateAIContent,
  transcribeAudioFeed,
  generateWebsiteFromImage,
  regenerateWebsiteSection,
  editWebsiteWithPrompt,
  keyManager,
} from './server/gemini';


const app = express();
const PORT = 3000;

// CORS configuration for robust decoupled API operations
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing with generous limit for audio and document payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check API
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Scholar Codex Study Desk',
    timestamp: new Date().toISOString(),
    geminiKeyManager: keyManager.getStatus(),
  });
});

// ==========================================
// 1. USER MANAGEMENT & AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const profile = db.getUserProfile();
  if (email && email.trim()) {
    db.updateUserProfile({ email: email.trim() });
  }
  res.json({
    token: `scholar_token_${Date.now()}`,
    user: db.getUserProfile(),
    message: 'Authenticated successfully into Scholar Codex workspace',
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, institution } = req.body;
  const updated = db.updateUserProfile({
    name: name || 'Scholar Researcher',
    email: email || 'researcher@codex.org',
    role: role || 'Visiting Fellow',
    institution: institution || 'Faculty of Epistemology',
  });
  res.status(201).json({
    token: `scholar_token_${Date.now()}`,
    user: updated,
    message: 'Scholar account established',
  });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Session closed securely' });
});

app.get('/api/user/profile', (_req: Request, res: Response) => {
  res.json(db.getUserProfile());
});

app.put('/api/user/profile', (req: Request, res: Response) => {
  const updated = db.updateUserProfile(req.body);
  res.json(updated);
});

// ==========================================
// 2. WORKBOOK CRUD OPERATIONS
// ==========================================

app.get('/api/workbooks', (_req: Request, res: Response) => {
  res.json(db.getWorkbooks());
});

app.get('/api/workbooks/:id', (req: Request, res: Response) => {
  const wb = db.getWorkbookById(req.params.id);
  if (!wb) return res.status(404).json({ error: 'Workbook not found' });
  res.json(wb);
});

app.post('/api/workbooks', (req: Request, res: Response) => {
  const { name, icon, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const newWb = db.createWorkbook({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    icon: icon || 'menu_book',
    chapterCount: 1,
    noteCount: 0,
    mastery: 0,
    description: description || 'Curated notebook archive.',
  });
  res.status(201).json(newWb);
});

app.put('/api/workbooks/:id', (req: Request, res: Response) => {
  const updated = db.updateWorkbook(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Workbook not found' });
  res.json(updated);
});

app.delete('/api/workbooks/:id', (req: Request, res: Response) => {
  const success = db.deleteWorkbook(req.params.id);
  if (!success) return res.status(404).json({ error: 'Workbook not found' });
  res.json({ success: true });
});

// ==========================================
// 3. NOTE CRUD OPERATIONS
// ==========================================

app.get('/api/notes', (req: Request, res: Response) => {
  const workbookId = req.query.workbookId as string | undefined;
  res.json(db.getNotes(workbookId));
});

app.get('/api/notes/:id', (req: Request, res: Response) => {
  const note = db.getNoteById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.post('/api/notes', (req: Request, res: Response) => {
  const {
    workbookId,
    title,
    content,
    chapter,
    chapterNumber,
    scholarAnnotation,
    noteType,
    generatedPrompt,
    tags,
  } = req.body;

  if (!workbookId || !title) {
    return res.status(400).json({ error: 'workbookId and title are required' });
  }

  const newNote = db.createNote({
    workbookId,
    title,
    content: content || '',
    chapter: chapter || 'CODEX CHAPTER 04',
    chapterNumber: chapterNumber || '§ 04.1',
    noteType: noteType || 'text note',
    generatedPrompt: generatedPrompt || '',
    tags: tags || ['Study Desk'],
    scholarAnnotation,
  });

  res.status(201).json(newNote);
});

app.put('/api/notes/:id', (req: Request, res: Response) => {
  const updated = db.updateNote(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Note not found' });
  res.json(updated);
});

app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const success = db.deleteNote(req.params.id);
  if (!success) return res.status(404).json({ error: 'Note not found' });
  res.json({ success: true });
});

app.post('/api/notes/:id/voice-note', (req: Request, res: Response) => {
  const { filename, duration, durationSeconds, recordedAt, transcript, audioUrl } = req.body;
  const vn = db.addVoiceNoteToNote(req.params.id, {
    filename: filename || 'Scholar_Recorded_Memo.wav',
    duration: duration || '01:15',
    durationSeconds: durationSeconds || 75,
    recordedAt: recordedAt || 'Desk Session',
    transcript: transcript || 'Recorded research audio memo.',
    audioUrl,
  });
  if (!vn) return res.status(404).json({ error: 'Note not found' });
  res.status(201).json(vn);
});

// ==========================================
// 4. STUDY CARD OPERATIONS
// ==========================================

app.get('/api/cards', (req: Request, res: Response) => {
  const workbookId = req.query.workbookId as string | undefined;
  res.json(db.getCards(workbookId));
});

app.post('/api/cards', (req: Request, res: Response) => {
  const { workbookId, title } = req.body;
  if (!workbookId || !title) {
    return res.status(400).json({ error: 'workbookId and title are required' });
  }
  const newCard = db.createCard(req.body);
  res.status(201).json(newCard);
});

app.put('/api/cards/:id', (req: Request, res: Response) => {
  const updated = db.updateCard(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Card not found' });
  res.json(updated);
});

app.post('/api/cards/:id/review', (req: Request, res: Response) => {
  const { rating } = req.body; // 'hard' | 'good' | 'mastered' | 'easy'
  const reviewed = db.reviewCard(req.params.id, rating || 'good');
  if (!reviewed) return res.status(404).json({ error: 'Card not found' });
  res.json(reviewed);
});

// ==========================================
// 5. FILE UPLOAD & SOURCES CRUD
// ==========================================

app.get('/api/sources', (req: Request, res: Response) => {
  const workbookId = req.query.workbookId as string | undefined;
  res.json(db.getSources(workbookId));
});

app.post('/api/upload', (req: Request, res: Response) => {
  const { workbookId, name, type, size, excerpt, details } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'File name is required' });
  }

  const effectiveType = type || (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.webm') ? 'audio' : name.endsWith('.png') || name.endsWith('.jpg') ? 'image' : 'pdf');
  const icon = effectiveType === 'audio' ? 'graphic_eq' : effectiveType === 'image' ? 'image' : 'picture_as_pdf';

  const newSource = db.addSource({
    workbookId: workbookId || 'epistemology-ai',
    name,
    type: effectiveType,
    icon,
    metadataTag: `Indexed (${size || 'Uploaded'})`,
    size: size || '1.2 MB',
    uploadDate: 'Today',
    excerpt: excerpt || 'Uploaded archival media document.',
    details: details || `Attached via Scholar Upload Portal at ${new Date().toLocaleTimeString()}`,
  });

  res.status(201).json({
    success: true,
    source: newSource,
    message: `File "${name}" uploaded and indexed into the codex archive.`,
  });
});

app.post('/api/sources', (req: Request, res: Response) => {
  const { workbookId, name, type, icon, metadataTag, size, excerpt, details } = req.body;
  if (!workbookId || !name) {
    return res.status(400).json({ error: 'workbookId and name are required' });
  }
  const newSource = db.addSource({
    workbookId,
    name,
    type: type || 'pdf',
    icon: icon || (type === 'audio' ? 'graphic_eq' : type === 'image' ? 'image' : 'picture_as_pdf'),
    metadataTag: metadataTag || 'Uploaded',
    size: size || '1.5 MB',
    uploadDate: 'Today',
    excerpt: excerpt || 'Uploaded source document.',
    details: details || '',
  });
  res.status(201).json(newSource);
});

app.delete('/api/sources/:id', (req: Request, res: Response) => {
  const success = db.deleteSource(req.params.id);
  if (!success) return res.status(404).json({ error: 'Source not found' });
  res.json({ success: true });
});

// ==========================================
// 6. AI SERVICE INTERACTIONS (GEMINI API)
// ==========================================

app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json(keyManager.getStatus());
});

app.post('/api/ai/set-key', (req: Request, res: Response) => {
  const { key } = req.body;
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'API key is required' });
  }
  keyManager.setRuntimeApiKey(key);
  res.json({ success: true, status: keyManager.getStatus() });
});

app.post('/api/ai/test', async (req: Request, res: Response) => {
  try {
    const testResult = await generateAIContent(req.body.prompt || 'Ping verification', undefined, 'Return a 1-sentence verification string.');
    res.json({ success: true, text: testResult.text, model: testResult.model });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Gemini test failed' });
  }
});

// A. General Prompt Endpoint returning AI-generated content & optionally storing as 'text note' or 'AI-generated content'
app.post('/api/ai/generate-content', async (req: Request, res: Response) => {
  const { prompt, context, systemInstruction, autoSaveAsNote, noteType, workbookId, title } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt string is required' });
  }

  try {
    const aiResult = await generateAIContent(prompt, context, systemInstruction);

    let savedNote = null;
    // By default, store this content as a 'text note' or 'AI-generated content' type in the database
    const shouldSave = autoSaveAsNote !== false;
    if (shouldSave) {
      const targetWorkbookId = workbookId || 'epistemology-ai';
      const storedNoteType = noteType === 'text note' ? 'text note' : 'AI-generated content';

      savedNote = db.createNote({
        workbookId: targetWorkbookId,
        title: title || `AI: ${prompt.slice(0, 45).trim()}...`,
        content: aiResult.text,
        chapter: 'AI SYNTHESIS LOG',
        chapterNumber: '§ AI-EXP',
        noteType: storedNoteType,
        generatedPrompt: prompt,
        tags: ['AI-Generated', 'Synthesis'],
        scholarAnnotation: {
          reference: 'Gemini 3.8 Flash Synthesis',
          text: `Synthesized from prompt: "${prompt.slice(0, 80)}" with auto quota rotation.`,
        },
      });
    }

    res.json({
      text: aiResult.text,
      model: aiResult.model,
      savedNote,
      quotaStatus: keyManager.getStatus(),
    });
  } catch (error: any) {
    console.error('AI content generation endpoint error:', error);
    res.status(500).json({
      error: 'Failed to generate AI content',
      details: error?.message || 'Server error',
    });
  }
});

// B. Live Real-Time Transcription of Any Audio Feed
app.post('/api/ai/transcribe-live-feed', async (req: Request, res: Response) => {
  const { audioBase64, mimeType, prompt, autoSaveAsNote, workbookId, title } = req.body;

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'audioBase64 string is required' });
  }

  try {
    const result = await transcribeAudioFeed(
      audioBase64,
      mimeType || 'audio/webm',
      prompt
    );

    let savedNote = null;
    if (autoSaveAsNote && result.transcription) {
      const targetWorkbookId = workbookId || 'epistemology-ai';
      savedNote = db.createNote({
        workbookId: targetWorkbookId,
        title: title || `Live Audio Transcript (${new Date().toLocaleTimeString()})`,
        content: result.transcription,
        chapter: 'AUDIO TRANSCRIPTION ARCHIVE',
        chapterNumber: '§ AUDIO-LIVE',
        noteType: 'voice note transcript',
        tags: ['Live Transcript', 'Audio Feed'],
        scholarAnnotation: {
          reference: result.confidence || 'Gemini Audio Transcribe',
          text: `Verbatim transcription captured live from audio feed.`,
        },
      });
    }

    res.json({
      transcription: result.transcription,
      confidence: result.confidence,
      savedNote,
      quotaStatus: keyManager.getStatus(),
    });
  } catch (err: any) {
    console.error('Audio transcription endpoint error:', err);
    res.status(500).json({
      error: 'Transcription service error',
      details: err?.message || 'Failed to transcribe audio feed',
    });
  }
});

// C. Dialectic Chat
app.get('/api/chat', (_req: Request, res: Response) => {
  res.json(db.getChatHistory());
});

app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const { message, noteContext, workbookId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Record user message
  const userMsg = db.addChatMessage({
    role: 'user',
    content: message,
    actionType: 'socratic',
  });

  const sources = db.getSources(workbookId).map((s) => `${s.name}: ${s.excerpt}`);

  const { text, citationRef } = await generateDialecticResponse({
    userMessage: message,
    noteContext: noteContext || '',
    groundedSources: sources,
  });

  const modelMsg = db.addChatMessage({
    role: 'model',
    content: text,
    sourceRef: citationRef,
    actionType: 'socratic',
  });

  res.json({
    userMsg,
    modelMsg,
    quotaStatus: keyManager.getStatus(),
  });
});

// D. Study Card Generation from Highlight
app.post('/api/gemini/generate-card', async (req: Request, res: Response) => {
  const { textSelection, noteTitle, workbookId, noteId } = req.body;
  if (!textSelection) {
    return res.status(400).json({ error: 'textSelection is required' });
  }

  const generated = await generateStudyCardFromSelection(
    textSelection,
    noteTitle || 'Manuscript Note'
  );

  const newCard = db.createCard({
    workbookId: workbookId || 'epistemology-ai',
    noteId,
    title: generated.title,
    question: generated.question,
    conceptBadge: generated.conceptBadge,
    backTitle: generated.backTitle,
    backAnswer: generated.backAnswer,
    pedagogicalAxiom: generated.pedagogicalAxiom,
    coreAxiomCode: generated.coreAxiomCode,
    groundingSource: generated.groundingSource,
    quoteRef: generated.quoteRef,
  });

  // Also log in dialectic chat
  db.addChatMessage({
    role: 'model',
    content: `Synthesized new Activity Study Card #${newCard.cardNumber}: "${newCard.title}". Grounded in: "${textSelection.slice(0, 60)}..."`,
    actionType: 'card_created',
  });

  res.status(201).json({
    card: newCard,
    quotaStatus: keyManager.getStatus(),
  });
});

// E. Quota & Key Switching Status
app.get('/api/ai/quota-status', (_req: Request, res: Response) => {
  res.json(keyManager.getStatus());
});

app.post('/api/ai/switch-key', (_req: Request, res: Response) => {
  const result = keyManager.switchKeyManually();
  res.json({
    message: `Switched active Gemini key slot to: ${result.activeLabel}`,
    status: keyManager.getStatus(),
  });
});

// ==========================================
// 7. WEBSITE STUDIO & AI CODE GENERATION
// ==========================================

// Projects CRUD
app.get('/api/projects', (req: Request, res: Response) => {
  const workbookId = req.query.workbookId as string | undefined;
  res.json(db.getProjects(workbookId));
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { workbookId, title, description, html, css, js, designSettings, assets } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const created = db.createProject({
    workbookId: workbookId || 'epistemology-ai',
    title,
    description: description || 'Generated web studio project.',
    html: html || '<!DOCTYPE html><html><body><h1>New Project</h1></body></html>',
    css: css || 'body { font-family: sans-serif; }',
    js: js || '',
    designSettings: designSettings || {
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
    assets: assets || [],
  });
  res.status(201).json(created);
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  const updated = db.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  res.json(updated);
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const success = db.deleteProject(req.params.id);
  if (!success) return res.status(404).json({ error: 'Project not found' });
  res.json({ success: true });
});

// Image to Website Generation
app.post('/api/ai/image-to-website', async (req: Request, res: Response) => {
  const { imageBase64, mimeType, prompt, workbookId, title } = req.body;

  try {
    const result = await generateWebsiteFromImage({
      imageBase64,
      mimeType,
      prompt,
    });

    const project = db.createProject({
      workbookId: workbookId || 'epistemology-ai',
      title: title || result.title,
      description: prompt ? `Generated from: "${prompt.slice(0, 80)}"` : 'Synthesized from visual mockup.',
      html: result.html,
      css: result.css,
      js: result.js,
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
      assets: [],
    });

    res.status(201).json({
      project,
      model: result.model,
      quotaStatus: keyManager.getStatus(),
    });
  } catch (err: any) {
    console.error('Image-to-website error:', err);
    res.status(500).json({
      error: 'Failed to generate website from image',
      details: err?.message || 'Server error',
    });
  }
});

// Regenerate Selected Section
app.post('/api/ai/regenerate-section', async (req: Request, res: Response) => {
  const { fullHtml, selectedSectionHtml, prompt } = req.body;
  if (!selectedSectionHtml || !prompt) {
    return res.status(400).json({ error: 'selectedSectionHtml and prompt are required' });
  }

  try {
    const result = await regenerateWebsiteSection({
      fullHtml: fullHtml || '',
      selectedSectionHtml,
      prompt,
    });

    res.json({
      updatedSectionHtml: result.updatedSectionHtml,
      model: result.model,
      quotaStatus: keyManager.getStatus(),
    });
  } catch (err: any) {
    console.error('Section regeneration error:', err);
    res.status(500).json({
      error: 'Failed to regenerate section',
      details: err?.message || 'Server error',
    });
  }
});

// Prompt-based Website Edit
app.post('/api/ai/edit-website', async (req: Request, res: Response) => {
  const { html, css, js, prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  try {
    const result = await editWebsiteWithPrompt({
      html: html || '',
      css: css || '',
      js: js || '',
      prompt,
    });

    res.json({
      html: result.html,
      css: result.css,
      js: result.js,
      explanation: result.explanation,
      model: result.model,
      quotaStatus: keyManager.getStatus(),
    });
  } catch (err: any) {
    console.error('Edit website error:', err);
    res.status(500).json({
      error: 'Failed to edit website with prompt',
      details: err?.message || 'Server error',
    });
  }
});

// Export Project as ZIP
app.post('/api/export/zip', async (req: Request, res: Response) => {
  const { title, html, css, js, readme } = req.body;
  try {
    const zip = new JSZip();
    const safeTitle = (title || 'scholar-web-project').toLowerCase().replace(/[^a-z0-9]+/g, '-');

    zip.file('index.html', html || '<!DOCTYPE html><html><body></body></html>');
    zip.file('style.css', css || '');
    zip.file('script.js', js || '');
    zip.file(
      'README.md',
      readme || `# ${title || 'Scholar Codex Project'}\n\nGenerated with Google AI Studio & Scholar Codex.\n\n## Getting Started\nOpen \`index.html\` in any modern browser.`
    );

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.zip"`);
    res.send(content);
  } catch (err: any) {
    console.error('ZIP generation error:', err);
    res.status(500).json({ error: 'Failed to create ZIP package' });
  }
});

// GitHub Export Integration
app.post('/api/export/github', (req: Request, res: Response) => {
  const { repoName, description, isPrivate, html, css, js } = req.body;
  const safeName = (repoName || 'my-scholar-website').toLowerCase().replace(/[^a-z0-9-_]/g, '-');

  const files = [
    { path: 'index.html', content: html },
    { path: 'style.css', content: css },
    { path: 'script.js', content: js },
    {
      path: 'README.md',
      content: `# ${safeName}\n\n${description || 'Web project created with Google AI Studio & Scholar Codex.'}\n\n## Deployment\nHost instantly on GitHub Pages, Vercel, or Netlify.`,
    },
  ];

  res.json({
    success: true,
    repository: safeName,
    visibility: isPrivate ? 'private' : 'public',
    filesPrepared: files.length,
    instructions: [
      `git init`,
      `git remote add origin https://github.com/username/${safeName}.git`,
      `git add .`,
      `git commit -m "Initial commit from Scholar Codex Website Studio"`,
      `git push -u origin main`
    ],
    message: `Repository package "${safeName}" prepared for export.`,
  });
});

// Assets Management
app.get('/api/assets', (_req: Request, res: Response) => {
  res.json(db.getAssets());
});

app.post('/api/assets', (req: Request, res: Response) => {
  const { name, url, type, size, associatedSection } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'name and url are required' });
  const asset = db.addAsset({
    name,
    url,
    type: type || 'image',
    size: size || '150 KB',
    associatedSection,
  });
  res.status(201).json(asset);
});

app.delete('/api/assets/:id', (req: Request, res: Response) => {
  const success = db.deleteAsset(req.params.id);
  if (!success) return res.status(404).json({ error: 'Asset not found' });
  res.json({ success: true });
});

// ==========================================
// 8. PREFERENCES & EXPORT DOSSIER
// ==========================================


app.get('/api/preferences', (_req: Request, res: Response) => {
  res.json(db.getPreferences());
});

app.put('/api/preferences', (req: Request, res: Response) => {
  const updated = db.updatePreferences(req.body);
  res.json(updated);
});

app.get('/api/export/:format', (req: Request, res: Response) => {
  const { format } = req.params;
  const workbookId = (req.query.workbookId as string) || 'epistemology-ai';
  const wb = db.getWorkbookById(workbookId);
  const notes = db.getNotes(workbookId);
  const cards = db.getCards(workbookId);
  const sources = db.getSources(workbookId);

  if (format === 'markdown') {
    let md = `# SCHOLAR CODEX: ${wb?.name || 'Research Dossier'}\n\n`;
    md += `*Generated: ${new Date().toISOString()}*\n\n`;
    md += `## Overview\n${wb?.description}\n\n`;
    md += `## Notes & Manuscripts\n\n`;
    notes.forEach((n) => {
      md += `### ${n.title}\n*${n.chapter}* [Type: ${n.noteType || 'text note'}]\n\n${n.content}\n\n`;
      if (n.scholarAnnotation) {
        md += `> **Scholar Field Annotation (${n.scholarAnnotation.reference}):**\n> ${n.scholarAnnotation.text}\n\n`;
      }
    });
    md += `## Activity Study Stack (${cards.length} Cards)\n\n`;
    cards.forEach((c, idx) => {
      md += `#### Card ${idx + 1}: ${c.title}\n`;
      md += `- **Question**: ${c.question}\n`;
      md += `- **Answer**: ${c.backAnswer}\n`;
      md += `- **Axiom**: ${c.pedagogicalAxiom}\n`;
      md += `- **Formula**: \`${c.coreAxiomCode}\`\n\n`;
    });
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${wb?.slug || 'codex'}-dossier.md"`
    );
    return res.send(md);
  }

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${wb?.slug || 'codex'}-archive.json"`
    );
    return res.json({ workbook: wb, notes, cards, sources });
  }

  // Plain Text formatted
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${wb?.slug || 'codex'}-dossier.txt"`
  );
  let text = `====================================================================\n`;
  text += `PROMPT WARS / SCHOLAR CODEX RESEARCH DOSSIER v4.2\n`;
  text += `CODEX: ${wb?.name.toUpperCase()} (Mastery: ${wb?.mastery}%)\n`;
  text += `====================================================================\n\n`;
  notes.forEach((n) => {
    text += `TITLE: ${n.title} [Type: ${n.noteType || 'text note'}]\n`;
    text += `CHAPTER: ${n.chapter}\n\n`;
    text += `${n.content}\n\n`;
    text += `ANNOTATION [${n.scholarAnnotation?.reference}]:\n${n.scholarAnnotation?.text}\n\n`;
    text += `--------------------------------------------------------------------\n\n`;
  });
  return res.send(text);
});

// ==========================================
// 8. VITE MIDDLEWARE OR STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Scholar Codex full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
