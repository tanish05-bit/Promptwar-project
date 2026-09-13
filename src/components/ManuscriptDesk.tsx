import React, { useState, useEffect, useRef } from 'react';
import { Note, SourceMedia } from '../types';
import { audioEngine, formatTime } from '../utils/audio';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ManuscriptDeskProps {
  note: Note;
  sources: SourceMedia[];
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  onGenerateCardFromSelection: (selectionText: string) => void;
  onAskGeminiPrompt: (prompt: string) => void;
  onSelectCitation: (citationId: string) => void;
  onOpenSourceDetails: (source: SourceMedia) => void;
  onAttachMedia: () => void;
  isGeneratingCard?: boolean;
  onNoteCreated?: (newNote: Note) => void;
  onAddStickyNote?: () => void;
}

export const ManuscriptDesk: React.FC<ManuscriptDeskProps> = ({
  note,
  sources,
  onUpdateNote,
  onGenerateCardFromSelection,
  onAskGeminiPrompt,
  onSelectCitation,
  onOpenSourceDetails,
  onAttachMedia,
  isGeneratingCard,
  onNoteCreated,
  onAddStickyNote,
}) => {
  const [selectedText, setSelectedText] = useState("Hume's turkey expects grain...");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(42);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(note.title);
  const [contentValue, setContentValue] = useState(note.content);
  const [activeTab, setActiveTab] = useState<'editor' | 'reading'>('editor');
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [annotationValue, setAnnotationValue] = useState(note.scholarAnnotation?.text || '');
  const [activeCitationPopover, setActiveCitationPopover] = useState<string | null>(null);

  // AI Feature States
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<{ summary: string; keyTakeaways: string[]; model: string } | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // File Import State
  const [isImporting, setIsImporting] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitleValue(note.title);
    setContentValue(note.content);
    setAnnotationValue(note.scholarAnnotation?.text || '');
  }, [note.id]);

  // Track text selection
  const handleSelectionCheck = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleTextareaSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (end - start > 5) {
        const text = textareaRef.current.value.substring(start, end);
        setSelectedText(text.trim());
      }
    }
  };

  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      audioEngine.pause();
      setIsPlayingAudio(false);
    } else {
      audioEngine.play(
        playbackSpeed,
        (currSec) => setCurrentTime(Math.floor(currSec)),
        () => setIsPlayingAudio(false)
      );
      setIsPlayingAudio(true);
    }
  };

  const handleSpeedToggle = () => {
    const nextSpeed = playbackSpeed === 1.0 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 1.0;
    setPlaybackSpeed(nextSpeed);
    if (isPlayingAudio) {
      audioEngine.pause();
      audioEngine.play(
        nextSpeed,
        (currSec) => setCurrentTime(Math.floor(currSec)),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (titleValue !== note.title) {
      onUpdateNote(note.id, { title: titleValue });
    }
  };

  const handleSaveContent = () => {
    if (contentValue !== note.content) {
      onUpdateNote(note.id, { content: contentValue });
    }
  };

  const handleSaveAnnotation = () => {
    setIsEditingAnnotation(false);
    onUpdateNote(note.id, {
      scholarAnnotation: {
        reference: note.scholarAnnotation?.reference || 'Ref: Hume Treatise I.III.VI',
        text: annotationValue,
      },
    });
  };

  // 1. AI Summarize Action
  const handleSummarize = async () => {
    const targetText = selectedText.length > 20 ? selectedText : contentValue;
    if (!targetText.trim()) return;

    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: targetText, noteId: note.id }),
      });
      const data = await res.json();
      setSummaryResult({
        summary: data.summary || 'Summary generated.',
        keyTakeaways: data.keyTakeaways || [],
        model: data.model || 'gemini-2.5-flash',
      });
      setIsSummaryModalOpen(true);
    } catch (err) {
      console.error('Failed to summarize:', err);
      alert('Unable to generate summary. Please check your network or API status.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // 2. AI Mock Quiz Action
  const handleGenerateQuiz = async () => {
    const targetText = selectedText.length > 20 ? selectedText : contentValue;
    if (!targetText.trim()) return;

    setIsGeneratingQuiz(true);
    setUserAnswers({});
    setIsQuizSubmitted(false);
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: targetText, numQuestions: 4 }),
      });
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuizQuestions(data.questions);
        setIsQuizModalOpen(true);
      } else {
        alert('Quiz generation returned no questions. Please try again.');
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      alert('Quiz service temporarily unavailable.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // 3. File Import Action
  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatusMessage(`Importing ${file.name}...`);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileText = event.target?.result as string;
      try {
        const res = await fetch('/api/import/text-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workbookId: note.workbookId,
            filename: file.name,
            content: fileText,
            mimeType: file.type || 'text/plain',
          }),
        });
        const result = await res.json();
        if (result.success && result.note) {
          // If a note created callback is available, notify parent
          if (onNoteCreated) {
            onNoteCreated(result.note);
          } else {
            // Append or update current note
            setContentValue((prev) => `${prev}\n\n# --- IMPORTED: ${file.name} ---\n${fileText}`);
            onUpdateNote(note.id, { content: `${contentValue}\n\n# --- IMPORTED: ${file.name} ---\n${fileText}` });
          }
          setImportStatusMessage(`Imported ${file.name} successfully!`);
          setTimeout(() => setImportStatusMessage(null), 3000);
        } else {
          alert('Failed to import file: ' + (result.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Import upload error:', err);
        alert('Error uploading file to server.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setIsImporting(false);
      alert('Error reading the selected file.');
    };
    reader.readAsText(file);
  };

  // 4. File Export Action
  const handleExportZip = () => {
    window.location.href = `/api/export/notes-zip?workbookId=${note.workbookId}`;
  };

  // Formatting helpers for the textarea
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = textarea.value.substring(start, end) || 'text';
    const newText = textarea.value.substring(0, start) + prefix + sel + suffix + textarea.value.substring(end);
    setContentValue(newText);
    onUpdateNote(note.id, { content: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + sel.length);
    }, 0);
  };

  const wordCount = contentValue.trim() ? contentValue.trim().split(/\s+/).length : 0;
  const activeVoiceNote = note.voiceNotes?.[0];

  return (
    <section className="flex flex-col gap-4 w-full" onMouseUp={handleSelectionCheck}>
      {/* Hidden file input for file import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".txt,.md,.markdown,.json,.js,.ts,.py,.html,.css"
      />

      {/* Manuscript Worktable Container */}
      <article className="bg-[#1b1b1d] rounded-xl p-5 lg:p-6 shadow-xl relative border border-[#2a2a2c]/60 overflow-hidden">
        {/* Overhead subtle rim illumination */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffb68c]/30 to-transparent"></div>

        {/* Inline Drafting & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1f1f21] p-1.5 rounded-lg mb-4 border border-[#2a2a2c]/50">
          {/* Left: Formatting tools */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => insertFormatting('**', '**')}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors font-bold text-xs"
              title="Bold (**text**)"
            >
              B
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors italic text-xs font-serif"
              title="Italic (*text*)"
            >
              I
            </button>
            <button
              onClick={() => insertFormatting('## ')}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors text-xs font-semibold"
              title="Heading (## )"
            >
              H2
            </button>
            <button
              onClick={() => insertFormatting('\n> “', '”\n')}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors"
              title="Scholarly Quote"
            >
              <span className="material-symbols-outlined text-[15px]">format_quote</span>
            </button>
            <button
              onClick={() => insertFormatting('`', '`')}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors text-xs font-mono"
              title="Inline Code (`code`)"
            >
              &lt;/&gt;
            </button>

            <div className="w-px h-4 bg-[#353437] mx-1"></div>

            {/* Mode Switch: Direct typing editor vs Reading view */}
            <div className="flex items-center bg-[#131315] p-0.5 rounded border border-[#353437]/60">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-[#2a2a2c] text-[#ffb68c] font-semibold'
                    : 'text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">edit_note</span>
                <span>Type Notes</span>
              </button>
              <button
                onClick={() => setActiveTab('reading')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeTab === 'reading'
                    ? 'bg-[#2a2a2c] text-[#ffb68c] font-semibold'
                    : 'text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">menu_book</span>
                <span>Reading View</span>
              </button>
            </div>
          </div>

          {/* Right: File Import, Export & Sticky Note controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {onAddStickyNote && (
              <button
                onClick={onAddStickyNote}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#ffb68c]/15 text-[#ffb68c] hover:bg-[#ffb68c]/25 text-xs font-medium transition-colors border border-[#ffb68c]/30"
                title="Add a movable sticky note on your workspace"
              >
                <span className="material-symbols-outlined text-[14px]">sticky_note_2</span>
                <span>+ Sticky Note</span>
              </button>
            )}

            <button
              onClick={handleTriggerImport}
              disabled={isImporting}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2a2a2c] text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#353437] text-xs font-medium transition-colors border border-[#353437]"
              title="Import .txt, .md, or code files"
            >
              <span className="material-symbols-outlined text-[14px] text-[#8ed5b4]">upload_file</span>
              <span>{isImporting ? 'Importing...' : 'Import File'}</span>
            </button>

            <button
              onClick={handleExportZip}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2a2a2c] text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#353437] text-xs font-medium transition-colors border border-[#353437]"
              title="Export all notes and study cards as a ZIP archive"
            >
              <span className="material-symbols-outlined text-[14px] text-[#ffb68c]">download</span>
              <span>Export ZIP</span>
            </button>
          </div>
        </div>

        {/* Import Notification Banner */}
        {importStatusMessage && (
          <div className="mb-3 px-3 py-1.5 bg-[#8ed5b4]/20 border border-[#8ed5b4]/40 rounded-lg text-xs text-[#8ed5b4] flex items-center justify-between animate-fade-in">
            <span>{importStatusMessage}</span>
            <button onClick={() => setImportStatusMessage(null)}>✕</button>
          </div>
        )}

        {/* Manuscript Title Header */}
        <header className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-[#35271d] text-[#ffb68c] font-label-sm text-[10px] uppercase font-bold tracking-wider border border-[#ffb68c]/20">
              {note.noteType || 'Manuscript'}
            </span>
            <span className="text-[11px] text-[#a38c80]">
              {wordCount} words • Last updated {new Date(note.updatedAt || Date.now()).toLocaleTimeString()}
            </span>
          </div>

          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="font-headline-lg text-2xl lg:text-3xl text-[#e4e2e4] font-semibold tracking-tight bg-[#131315] px-2 py-1 rounded border border-[#ffb68c] w-full focus:outline-none"
              />
              <button
                onClick={handleSaveTitle}
                className="px-3 py-1 bg-[#d97736] text-[#532200] font-bold text-xs rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="group flex items-start justify-between gap-2">
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="font-headline-lg text-2xl lg:text-3xl text-[#e4e2e4] font-semibold tracking-tight cursor-text hover:text-[#ffb68c] transition-colors leading-tight"
                title="Click to edit title"
              >
                {note.title}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 text-[#a38c80] hover:text-[#ffb68c] p-1 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>
          )}
        </header>

        {/* Floating Contextual Scribe Selection Action Pill */}
        <div className="my-3 p-2 bg-[#2a2a2c] rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-[#353437]">
          <div className="flex items-center gap-2 px-1 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#ffb68c] shrink-0 animate-ping"></span>
            <span className="font-label-sm text-[11px] text-[#ffb68c] truncate max-w-xs md:max-w-md">
              Focus: "{selectedText.length > 40 ? selectedText.slice(0, 38) + '...' : selectedText}"
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Ground into Activity Card */}
            <button
              onClick={() => onGenerateCardFromSelection(selectedText || contentValue.slice(0, 200))}
              disabled={isGeneratingCard}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#d97736] text-[#532200] font-label-sm text-xs font-semibold hover:bg-[#f9ba78] transition-all active:scale-95 shadow-sm disabled:opacity-50"
              id="trigger-gen-card"
            >
              <span
                className={`material-symbols-outlined text-[14px] ${
                  isGeneratingCard ? 'animate-spin' : ''
                }`}
              >
                {isGeneratingCard ? 'refresh' : 'auto_awesome'}
              </span>
              <span>{isGeneratingCard ? 'Synthesizing...' : 'Create Study Card'}</span>
            </button>

            {/* Summarize Button */}
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1f1f21] text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#353437] font-label-sm text-xs transition-colors border border-[#353437]/50 disabled:opacity-50"
              title="Summarize selected text or entire note"
            >
              <span className={`material-symbols-outlined text-[13px] text-[#ffb68c] ${isSummarizing ? 'animate-spin' : ''}`}>
                {isSummarizing ? 'sync' : 'summarize'}
              </span>
              <span>{isSummarizing ? 'Summarizing...' : 'Summarize'}</span>
            </button>

            {/* Mock Quiz Button */}
            <button
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1f1f21] text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#353437] font-label-sm text-xs transition-colors border border-[#353437]/50 disabled:opacity-50"
              title="Generate an interactive multiple choice quiz"
            >
              <span className={`material-symbols-outlined text-[13px] text-[#8ed5b4] ${isGeneratingQuiz ? 'animate-spin' : ''}`}>
                {isGeneratingQuiz ? 'sync' : 'school'}
              </span>
              <span>{isGeneratingQuiz ? 'Generating...' : 'Mock Quiz'}</span>
            </button>

            {/* Explain Prompt */}
            <button
              onClick={() =>
                onAskGeminiPrompt(`Explain this concept from the manuscript: "${selectedText || contentValue.slice(0, 200)}"`)
              }
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1f1f21] text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#353437] font-label-sm text-xs transition-colors border border-[#353437]/50"
            >
              <span className="material-symbols-outlined text-[13px] text-[#f9ba78]">lightbulb</span>
              <span>Explain</span>
            </button>

            {/* Challenge Prompt */}
            <button
              onClick={() =>
                onAskGeminiPrompt(
                  `Probe and challenge this premise with a rigorous philosophical counter-argument: "${selectedText || contentValue.slice(0, 200)}"`
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1f1f21] text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#353437] font-label-sm text-xs transition-colors border border-[#353437]/50"
            >
              <span className="material-symbols-outlined text-[13px] text-[#f28ba8]">quiz</span>
              <span>Challenge</span>
            </button>
          </div>
        </div>

        {/* Note Body Area: Direct Editor vs Reading View */}
        {activeTab === 'editor' ? (
          <div className="my-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-[#a38c80] px-1">
              <span>Type your notes, quotes, or code directly below. Selection enables instant AI actions.</span>
              <button
                onClick={handleSaveContent}
                className="px-2.5 py-0.5 bg-[#d97736] text-[#532200] font-bold text-xs rounded hover:bg-[#f9ba78] transition-colors"
              >
                Save Notes
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={contentValue}
              onChange={(e) => {
                setContentValue(e.target.value);
              }}
              onBlur={handleSaveContent}
              onSelect={handleTextareaSelect}
              rows={12}
              placeholder="Begin typing scholarly notes, citations, or formulas here..."
              className="w-full bg-[#131315] text-[#e4e2e4] p-4 rounded-xl border border-[#353437] focus:border-[#ffb68c] font-mono text-sm leading-relaxed focus:outline-none transition-colors shadow-inner"
            />
          </div>
        ) : (
          <div
            onMouseUp={handleSelectionCheck}
            className="font-headline-md text-base lg:text-[17px] text-[#e4e2e4] leading-relaxed space-y-4 my-4 select-text p-3 bg-[#131315]/40 rounded-xl border border-[#2a2a2c]/50"
          >
            {contentValue ? (
              contentValue.split('\n\n').map((para, idx) => (
                <p key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-[#a38c80] italic">
                No note content yet. Switch to "Type Notes" tab above to start writing.
              </p>
            )}

            {/* Citation Anchor Samples */}
            <div className="pt-2 border-t border-[#2a2a2c]/60 flex items-center gap-2 flex-wrap text-xs text-[#a38c80]">
              <span>Citations:</span>
              <button
                onClick={() =>
                  setActiveCitationPopover(activeCitationPopover === 'cit-1' ? null : 'cit-1')
                }
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#2a2a2c] text-[#ffb68c] font-label-sm text-[11px] hover:bg-[#d97736] hover:text-[#532200] transition-all border border-[#ffb68c]/30"
              >
                <span className="material-symbols-outlined text-[13px] mr-0.5">menu_book</span>
                Russell '12 · Ch.6 §2
              </button>
              <button
                onClick={() => {
                  togglePlayAudio();
                  setActiveCitationPopover(activeCitationPopover === 'cit-2' ? null : 'cit-2');
                }}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#2a2a2c] text-[#8ed5b4] font-label-sm text-[11px] hover:bg-[#8ed5b4] hover:text-[#003826] transition-all border border-[#8ed5b4]/30"
              >
                <span className="material-symbols-outlined text-[13px] mr-0.5">graphic_eq</span>
                Tape 24:15
              </button>
            </div>

            {/* Popover Excerpt */}
            {activeCitationPopover === 'cit-1' && (
              <div className="p-3 bg-[#2a2a2c] rounded-lg border border-[#ffb68c]/40 text-xs shadow-xl animate-fade-in font-body-md text-[#dbc1b4]">
                <div className="flex items-center justify-between text-[#ffb68c] font-label-sm text-[11px] mb-1">
                  <span>BERTRAND RUSSELL (1912) · PROBLEMS OF PHILOSOPHY</span>
                  <button onClick={() => setActiveCitationPopover(null)}>✕</button>
                </div>
                <p className="italic text-[#e4e2e4]">
                  “The turkey found that, on his first morning at the farm, he was fed at 9 a.m... Yet at last, on Christmas Eve, the turkey was slaughtered.”
                </p>
              </div>
            )}
          </div>
        )}

        {/* Embedded Voice Note Player Module */}
        <div className="mt-6 p-4 bg-[#1f1f21] rounded-xl shadow-md border border-[#2a2a2c]/60">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[#ffb68c] text-[18px]">mic</span>
              <span className="font-label-md text-xs text-[#e4e2e4] font-semibold truncate">
                {activeVoiceNote?.filename || 'Prof_Vance_Seminar_Clip_01.wav'}
              </span>
              <span className="font-label-sm text-[11px] text-[#a38c80] hidden sm:inline">
                • Synchronized Colloquium Recording
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSpeedToggle}
                className="px-2 py-0.5 rounded bg-[#2a2a2c] text-[#a38c80] hover:text-[#ffb68c] font-label-sm text-[10px] transition-colors"
              >
                {playbackSpeed.toFixed(1)}x
              </button>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`px-2 py-0.5 rounded font-label-sm text-[10px] transition-colors ${
                  showTranscript ? 'bg-[#d97736] text-[#532200]' : 'bg-[#2a2a2c] text-[#a38c80] hover:text-[#ffb68c]'
                }`}
              >
                Transcript
              </button>
            </div>
          </div>

          {/* Transcript Viewer Drawer */}
          {showTranscript && (
            <div className="p-3 my-2 bg-[#131315] rounded border border-[#2a2a2c] text-xs text-[#dbc1b4] font-body-md leading-relaxed animate-fade-in">
              <span className="text-[#ffb68c] font-label-sm text-[10px] block mb-1 uppercase">
                Synchronized Transcript
              </span>
              "{activeVoiceNote?.transcript || 'When you consider prompt templates tested across thousands of iterations, remember Hume\'s warning: repetition of past observations cannot yield epistemic certainty about future safety without structural constraints.'}"
            </div>
          )}

          {/* Audio Waveform Graphic & Controls */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={togglePlayAudio}
              className="w-10 h-10 rounded-full bg-[#ffb68c] text-[#532200] flex items-center justify-center shrink-0 hover:bg-[#f9ba78] transition-transform active:scale-95 shadow-md cursor-pointer"
              id="play-pause-btn"
              aria-label={isPlayingAudio ? 'Pause audio memo' : 'Play audio memo'}
            >
              <span className="material-symbols-outlined text-[22px]">
                {isPlayingAudio ? 'pause' : 'play_arrow'}
              </span>
            </button>

            {/* Stylized Animated Waveform Bars */}
            <div
              className="flex-1 flex items-center gap-1 h-8 cursor-pointer group px-2 bg-[#131315]/50 rounded"
              onClick={() => {
                const nextT = (currentTime + 20) % 102;
                audioEngine.seek(nextT);
                setCurrentTime(nextT);
              }}
              title="Click to seek along timeline"
            >
              {[12, 20, 28, 16, 24, 30, 14, 22, 26, 24, 16, 26, 18, 12, 22, 16, 10, 20, 28, 14, 22, 16, 10].map(
                (h, idx) => {
                  const isPassed = (idx / 23) * 102 <= currentTime;
                  const animHeight = isPlayingAudio && isPassed ? `${(h * 1.3) % 30 + 6}px` : `${h}px`;
                  return (
                    <div
                      key={idx}
                      style={{ height: animHeight }}
                      className={`w-1 rounded transition-all duration-150 ${
                        isPassed ? 'bg-[#ffb68c]' : 'bg-[#353437] group-hover:bg-[#a38c80]'
                      }`}
                    />
                  );
                }
              )}
            </div>

            <span className="font-label-sm text-xs text-[#a38c80] font-medium shrink-0">
              {formatTime(currentTime)} / {activeVoiceNote?.duration || '01:42'}
            </span>
          </div>
        </div>

        {/* Attached Sources Bottom Tray */}
        <div className="mt-6 pt-4 border-t border-[#2a2a2c]/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#a38c80]">
              Attached Study Media &amp; Clip Index ({sources.length})
            </span>
            <button
              onClick={onAttachMedia}
              className="font-label-sm text-[11px] text-[#ffb68c] hover:underline cursor-pointer"
            >
              Manage All Files
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {sources.map((src) => (
              <div
                key={src.id}
                onClick={() => onOpenSourceDetails(src)}
                className="p-2.5 bg-[#1f1f21] rounded-lg flex items-center gap-2.5 hover:bg-[#2a2a2c] transition-colors cursor-pointer group border border-[#2a2a2c]/40"
              >
                <div className="w-8 h-8 rounded bg-[#ffb68c]/10 flex items-center justify-center text-[#ffb68c] group-hover:scale-105 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[16px]">
                    {src.icon || 'description'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-md text-xs text-[#e4e2e4] font-medium truncate">
                    {src.name}
                  </span>
                  <span className="font-label-sm text-[10px] text-[#8ed5b4] truncate">
                    {src.metadataTag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Archival Field Marginalia Note */}
      <div className="p-4 bg-[#2b2823] rounded-xl flex items-start gap-3 shadow-md border border-[#554339]/50">
        <span className="material-symbols-outlined text-[#ffb68c] text-[20px] mt-0.5 shrink-0">
          sticky_note_2
        </span>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="font-label-md text-xs text-[#ffb68c] font-bold">
              SCHOLAR FIELD ANNOTATION
            </span>
            <span className="font-label-sm text-[11px] text-[#a38c80]">
              {note.scholarAnnotation?.reference || 'Ref: Hume Treatise I.III.VI'}
            </span>
          </div>

          {isEditingAnnotation ? (
            <div className="mt-2">
              <textarea
                value={annotationValue}
                onChange={(e) => setAnnotationValue(e.target.value)}
                className="w-full bg-[#131315] text-[#e5a968] p-2 rounded border border-[#ffb68c] text-xs font-body-md focus:outline-none"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => setIsEditingAnnotation(false)}
                  className="px-2 py-0.5 bg-[#1f1f21] text-[#a38c80] rounded text-[11px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAnnotation}
                  className="px-2 py-0.5 bg-[#d97736] text-[#532200] font-bold rounded text-[11px]"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => setIsEditingAnnotation(true)}
              className="font-body-md text-xs text-[#e5a968] mt-1 leading-relaxed cursor-text hover:text-[#ffdbc9] transition-colors"
              title="Click to edit annotation"
            >
              {note.scholarAnnotation?.text}
            </p>
          )}
        </div>
      </div>

      {/* 5. Summarize Result Modal */}
      {isSummaryModalOpen && summaryResult && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1e1e20] border border-[#ffb68c]/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a2a2c] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb68c] text-[22px]">auto_awesome</span>
                <h2 className="text-lg font-bold text-[#e4e2e4]">Gemini Scholar Summary</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#ffb68c]/15 text-[#ffb68c] px-2 py-0.5 rounded font-mono">
                  {summaryResult.model}
                </span>
                <button
                  onClick={() => setIsSummaryModalOpen(false)}
                  className="text-[#a38c80] hover:text-[#e4e2e4] p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm text-[#dbc1b4]">
              <div className="p-3 bg-[#141416] rounded-xl border border-[#2a2a2c]">
                <h4 className="text-xs uppercase tracking-wider text-[#ffb68c] font-semibold mb-1">Executive Summary</h4>
                <p className="leading-relaxed text-[#e4e2e4]">{summaryResult.summary}</p>
              </div>

              {summaryResult.keyTakeaways && summaryResult.keyTakeaways.length > 0 && (
                <div className="p-3 bg-[#141416] rounded-xl border border-[#2a2a2c]">
                  <h4 className="text-xs uppercase tracking-wider text-[#8ed5b4] font-semibold mb-2">Key Takeaways</h4>
                  <ul className="space-y-1.5 list-disc list-inside text-xs leading-relaxed">
                    {summaryResult.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="text-[#dbc1b4]">
                        <span className="text-[#e4e2e4]">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2a2a2c]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${summaryResult.summary}\n\nTakeaways:\n${summaryResult.keyTakeaways.map((t) => `• ${t}`).join('\n')}`
                  );
                  alert('Summary copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-[#2a2a2c] text-[#e4e2e4] hover:bg-[#353437] rounded-lg text-xs font-medium"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => {
                  const addition = `\n\n### AI Summary Digest\n${summaryResult.summary}\n\n**Takeaways:**\n${summaryResult.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n`;
                  setContentValue((prev) => prev + addition);
                  onUpdateNote(note.id, { content: contentValue + addition });
                  setIsSummaryModalOpen(false);
                }}
                className="px-3.5 py-1.5 bg-[#d97736] text-[#532200] font-bold rounded-lg text-xs hover:bg-[#f9ba78]"
              >
                Insert into Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Mock Quiz Modal */}
      {isQuizModalOpen && quizQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1e1e20] border border-[#8ed5b4]/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a2a2c] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8ed5b4] text-[22px]">school</span>
                <h2 className="text-lg font-bold text-[#e4e2e4]">Interactive Mock Quiz</h2>
              </div>
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="text-[#a38c80] hover:text-[#e4e2e4] p-1"
              >
                ✕
              </button>
            </div>

            {/* Score Banner when submitted */}
            {isQuizSubmitted && (
              <div className="p-3 rounded-xl bg-[#14231e] border border-[#8ed5b4]/50 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-[#8ed5b4]">Quiz Completed</span>
                  <h3 className="text-sm font-semibold text-[#e4e2e4]">
                    Your Score:{' '}
                    {
                      quizQuestions.filter((q, idx) => userAnswers[idx] === q.correctIndex).length
                    }{' '}
                    / {quizQuestions.length} (
                    {Math.round(
                      (quizQuestions.filter((q, idx) => userAnswers[idx] === q.correctIndex).length /
                        quizQuestions.length) *
                        100
                    )}
                    %)
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setIsQuizSubmitted(false);
                  }}
                  className="px-3 py-1 bg-[#8ed5b4] text-[#003826] font-bold text-xs rounded"
                >
                  Retake
                </button>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {quizQuestions.map((q, qIdx) => {
                const isAnswered = userAnswers[qIdx] !== undefined;
                const isCorrect = userAnswers[qIdx] === q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    className={`p-4 rounded-xl border transition-all ${
                      isQuizSubmitted
                        ? isCorrect
                          ? 'bg-[#14231e]/50 border-[#8ed5b4]/40'
                          : 'bg-[#29171f]/50 border-[#f28ba8]/40'
                        : 'bg-[#141416] border-[#2a2a2c]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#e4e2e4] mb-3">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[qIdx] === oIdx;
                        let optionStyle = 'bg-[#1f1f21] border-[#2a2a2c] text-[#dbc1b4] hover:bg-[#2a2a2c]';

                        if (isQuizSubmitted) {
                          if (oIdx === q.correctIndex) {
                            optionStyle = 'bg-[#1a382e] border-[#8ed5b4] text-[#8ed5b4] font-semibold';
                          } else if (isSelected) {
                            optionStyle = 'bg-[#401c2c] border-[#f28ba8] text-[#f28ba8]';
                          }
                        } else if (isSelected) {
                          optionStyle = 'bg-[#3b2e1b] border-[#ffb68c] text-[#ffb68c] font-semibold';
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            disabled={isQuizSubmitted}
                            onClick={() => setUserAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                            className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition-all ${optionStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] shrink-0 font-bold">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {isQuizSubmitted && (
                      <div className="mt-3 pt-2 border-t border-white/10 text-xs text-[#a38c80]">
                        <span className="text-[#8ed5b4] font-semibold">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2c]">
              <span className="text-xs text-[#a38c80]">
                {Object.keys(userAnswers).length} of {quizQuestions.length} answered
              </span>

              <div className="flex items-center gap-2">
                {!isQuizSubmitted ? (
                  <button
                    onClick={() => setIsQuizSubmitted(true)}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="px-4 py-1.5 bg-[#8ed5b4] text-[#003826] font-bold rounded-lg text-xs hover:bg-[#a6e5ca] disabled:opacity-50"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setIsQuizModalOpen(false)}
                    className="px-4 py-1.5 bg-[#2a2a2c] text-[#e4e2e4] rounded-lg text-xs font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
