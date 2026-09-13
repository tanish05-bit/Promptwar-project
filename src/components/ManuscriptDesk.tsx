import React, { useState, useEffect } from 'react';
import { Note, SourceMedia } from '../types';
import { audioEngine, formatTime } from '../utils/audio';

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
}) => {
  const [selectedText, setSelectedText] = useState("Hume's turkey expects grain...");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(42);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(note.title);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [contentValue, setContentValue] = useState(note.content);
  const [isEditingAnnotation, setIsEditingAnnotation] = useState(false);
  const [annotationValue, setAnnotationValue] = useState(note.scholarAnnotation?.text || '');
  const [activeCitationPopover, setActiveCitationPopover] = useState<string | null>(null);

  useEffect(() => {
    setTitleValue(note.title);
    setContentValue(note.content);
    setAnnotationValue(note.scholarAnnotation?.text || '');
  }, [note.id]);

  // Listen to text selection on the manuscript
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) {
      setSelectedText(selection.toString().trim());
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
    setIsEditingContent(false);
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

  const activeVoiceNote = note.voiceNotes?.[0];

  return (
    <section className="flex flex-col gap-4 w-full">
      {/* Manuscript Worktable Container */}
      <article className="bg-[#1b1b1d] rounded-xl p-5 lg:p-6 shadow-xl relative border border-[#2a2a2c]/60 overflow-hidden">
        {/* Overhead subtle rim illumination */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#ffb68c]/30 to-transparent"></div>

        {/* Inline Drafting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1f1f21] p-1.5 rounded-lg mb-5 border border-[#2a2a2c]/50">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => document.execCommand('bold')}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors font-bold text-xs"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => document.execCommand('italic')}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors italic text-xs font-serif"
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => {
                setIsEditingContent(true);
              }}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors text-xs font-semibold"
              title="Heading"
            >
              H2
            </button>
            <div className="w-px h-4 bg-[#353437] mx-1"></div>
            <button
              onClick={() => {
                setContentValue((prev) => prev + '\n\n> “Insert scholarly quote here.”\n');
                setIsEditingContent(true);
              }}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors"
              title="Blockquote"
            >
              <span className="material-symbols-outlined text-[15px]">format_quote</span>
            </button>
            <button
              onClick={() => {
                setContentValue((prev) => prev + '\n- Axiomatic Point 1\n- Axiomatic Point 2');
                setIsEditingContent(true);
              }}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors"
              title="Bulleted list"
            >
              <span className="material-symbols-outlined text-[15px]">format_list_bulleted</span>
            </button>
            <button
              onClick={() => {
                setContentValue((prev) => prev + '\n`P(Failure | Trial N) > ε`\n');
                setIsEditingContent(true);
              }}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors"
              title="Inline code"
            >
              <span className="material-symbols-outlined text-[15px]">code</span>
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter reference URL or DOI:');
                if (url) setContentValue((prev) => prev + ` [Citation: ${url}]`);
              }}
              className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors"
              title="Insert Link"
            >
              <span className="material-symbols-outlined text-[15px]">link</span>
            </button>
            <button
              onClick={() => setIsEditingAnnotation(!isEditingAnnotation)}
              className="w-7 h-7 flex items-center justify-center rounded text-[#ffb68c] hover:bg-[#2a2a2c] transition-colors"
              title="Marginalia Pen"
            >
              <span className="material-symbols-outlined text-[15px]">edit_note</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onAskGeminiPrompt("Extract a key citation excerpt from Russell '12 to clip into this note.");
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a2a2c] text-[#dbc1b4] hover:text-[#ffb68c] hover:bg-[#353437] transition-colors text-[11px] font-label-sm border border-[#353437]/60"
            >
              <span className="material-symbols-outlined text-[13px]">crop</span>
              <span>Source Clip</span>
            </button>
            <button
              onClick={onAttachMedia}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#2a2a2c] text-[#dbc1b4] hover:text-[#ffb68c] hover:bg-[#353437] transition-colors text-[11px] font-label-sm border border-[#353437]/60"
            >
              <span className="material-symbols-outlined text-[13px]">attach_file</span>
              <span>Attach Media</span>
            </button>
          </div>
        </div>

        {/* Essay Header Area */}
        <header className="mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#f9ba78] px-2 py-0.5 bg-[#673d03]/40 rounded border border-[#673d03]/60">
              {note.chapter || 'Codex Chapter 03'}
            </span>
            {note.noteType && (
              <span
                className={`font-label-sm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                  note.noteType === 'AI-generated content'
                    ? 'bg-[#2a1708] text-[#ffb68c] border-[#ffb68c]/40 font-semibold'
                    : note.noteType === 'voice note transcript'
                    ? 'bg-[#182b24] text-[#8ed5b4] border-[#8ed5b4]/40 font-semibold'
                    : 'bg-[#2a2a2c] text-[#dbc1b4] border-[#353437]'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">
                  {note.noteType === 'AI-generated content'
                    ? 'smart_toy'
                    : note.noteType === 'voice note transcript'
                    ? 'graphic_eq'
                    : 'description'}
                </span>
                <span>{note.noteType}</span>
              </span>
            )}
            <span className="font-label-sm text-[11px] text-[#a38c80]">
              {note.updatedAt || 'Updated 14 mins ago'}
            </span>
          </div>

          {note.generatedPrompt && (
            <div className="mb-2 px-3 py-1.5 rounded-lg bg-[#2a1708]/60 border border-[#ffb68c]/20 text-[11px] font-body-sm text-[#ffb68c] flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] shrink-0">prompt_suggestion</span>
              <span className="truncate">Prompt: "{note.generatedPrompt}"</span>
            </div>
          )}

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
            <span className="font-label-sm text-[11px] text-[#ffb68c] truncate">
              Selected: "{selectedText.length > 36 ? selectedText.slice(0, 34) + '...' : selectedText}"
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onGenerateCardFromSelection(selectedText)}
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
              <span>{isGeneratingCard ? 'Synthesizing...' : 'Ground into Activity Card'}</span>
            </button>

            <button
              onClick={() =>
                onAskGeminiPrompt(`Explain this concept from the manuscript: "${selectedText}"`)
              }
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1f1f21] text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#353437] font-label-sm text-xs transition-colors border border-[#353437]/50"
            >
              <span className="material-symbols-outlined text-[13px] text-[#f9ba78]">lightbulb</span>
              <span>Explain</span>
            </button>

            <button
              onClick={() =>
                onAskGeminiPrompt(
                  `Probe and challenge this premise with a rigorous philosophical counter-argument: "${selectedText}"`
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#1f1f21] text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#353437] font-label-sm text-xs transition-colors border border-[#353437]/50"
            >
              <span className="material-symbols-outlined text-[13px] text-[#8ed5b4]">quiz</span>
              <span>Challenge</span>
            </button>
          </div>
        </div>

        {/* Academic Essay Manuscript Body */}
        {isEditingContent ? (
          <div className="my-4">
            <textarea
              value={contentValue}
              onChange={(e) => setContentValue(e.target.value)}
              className="w-full h-64 bg-[#131315] text-[#e4e2e4] p-3 rounded-lg border border-[#ffb68c] font-body-lg text-sm leading-relaxed focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsEditingContent(false)}
                className="px-3 py-1 bg-[#2a2a2c] text-[#a38c80] hover:text-[#e4e2e4] rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContent}
                className="px-3 py-1 bg-[#d97736] text-[#532200] font-bold text-xs rounded"
              >
                Save Manuscript
              </button>
            </div>
          </div>
        ) : (
          <div
            onMouseUp={handleMouseUp}
            className="font-headline-md text-base lg:text-[17px] text-[#e4e2e4] leading-relaxed space-y-4 my-4 select-text"
          >
            <p>
              When reinforcement learning from human feedback (RLHF) optimizes model outputs for adherence, it
              reproduces what David Hume famously characterized as empirical custom. The machine does not deduce
              universal deontic ethics; rather, like the inductive observer in{' '}
              <button
                onClick={() =>
                  setActiveCitationPopover(
                    activeCitationPopover === 'cit-1' ? null : 'cit-1'
                  )
                }
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#2a2a2c] text-[#ffb68c] font-label-sm text-[11px] cursor-pointer hover:bg-[#d97736] hover:text-[#532200] transition-all group mx-1 border border-[#ffb68c]/30"
              >
                <span className="material-symbols-outlined text-[13px] mr-0.5">menu_book</span>
                Russell '12 · Ch.6 §2
              </button>
              , it infers benevolence strictly through repetition of rewards.
            </p>

            {/* Citation Excerpt Card Popover */}
            {activeCitationPopover === 'cit-1' && (
              <div className="p-3 bg-[#2a2a2c] rounded-lg border border-[#ffb68c]/40 text-xs shadow-xl animate-fade-in font-body-md text-[#dbc1b4]">
                <div className="flex items-center justify-between text-[#ffb68c] font-label-sm text-[11px] mb-1">
                  <span>BERTRAND RUSSELL (1912) · PROBLEMS OF PHILOSOPHY</span>
                  <button onClick={() => setActiveCitationPopover(null)}>✕</button>
                </div>
                <p className="italic text-[#e4e2e4]">
                  “The turkey found that, on his first morning at the farm, he was fed at 9 a.m. However, being a
                  good inductivist, he collected a vast number of observations under diverse weather conditions...
                  Yet at last, on Christmas Eve, the turkey was slaughtered.”
                </p>
              </div>
            )}

            <blockquote className="pl-4 border-l-2 border-[#d97736] bg-[#1f1f21]/60 p-3 rounded-r-lg italic text-[#dbc1b4] font-headline-md text-base">
              “The man who has fed the chicken every day throughout its life at last wrings its neck instead,
              showing that more refined views as to the uniformity of nature would have been useful to the bird.”
            </blockquote>

            <p>
              In modern frontier prompt architecture, benchmark saturation presents an analogous crisis. A prompt
              tested against 10,000 synthetic evaluations builds high inductive confidence{' '}
              <button
                onClick={() => {
                  togglePlayAudio();
                  setActiveCitationPopover(
                    activeCitationPopover === 'cit-2' ? null : 'cit-2'
                  );
                }}
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#2a2a2c] text-[#8ed5b4] font-label-sm text-[11px] cursor-pointer hover:bg-[#8ed5b4] hover:text-[#003826] transition-all mx-1 border border-[#8ed5b4]/30"
              >
                <span className="material-symbols-outlined text-[13px] mr-0.5">graphic_eq</span>
                Tape 24:15
              </button>
              . Yet, when deployed into adversarial open environments, zero-shot distribution shifts render
              statistical habits completely brittle. The model has internalized neither safety nor reason, but
              simply the expectation of continuous grain.{' '}
              <button
                onClick={() =>
                  setActiveCitationPopover(
                    activeCitationPopover === 'cit-3' ? null : 'cit-3'
                  )
                }
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#2a2a2c] text-[#f9ba78] font-label-sm text-[11px] cursor-pointer hover:bg-[#f9ba78] hover:text-[#492900] transition-all mx-1 border border-[#f9ba78]/30"
              >
                <span className="material-symbols-outlined text-[13px] mr-0.5">description</span>
                Lec 03 · p.12
              </button>
            </p>

            {/* Citation 3 Excerpt Popover */}
            {activeCitationPopover === 'cit-3' && (
              <div className="p-3 bg-[#2a2a2c] rounded-lg border border-[#f9ba78]/40 text-xs shadow-xl animate-fade-in font-body-md text-[#dbc1b4]">
                <div className="flex items-center justify-between text-[#f9ba78] font-label-sm text-[11px] mb-1">
                  <span>PROF. VANCE · LECTURE 03 SLIDE 12</span>
                  <button onClick={() => setActiveCitationPopover(null)}>✕</button>
                </div>
                <p className="italic text-[#e4e2e4]">
                  “David Hume’s induction problem applied to RLHF reveals an inescapable telemetry trap: rewarding
                  compliance merely measures past alignment to proxy metrics, never moral or rational comprehension.”
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
                • Recorded during Morning Colloquium
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
              <button
                onClick={() => {
                  const noteText = prompt('Add field note to voice memo:');
                  if (noteText) {
                    setContentValue((prev) => prev + `\n\n*Voice Memo Note:* ${noteText}`);
                    onUpdateNote(note.id, { content: contentValue + `\n\n*Voice Memo Note:* ${noteText}` });
                  }
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffb68c]/10 text-[#ffb68c] hover:bg-[#ffb68c]/20 font-label-sm text-[10px] transition-colors"
              >
                <span className="material-symbols-outlined text-[12px]">add</span> New Note
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
                        isPassed
                          ? 'bg-[#ffb68c]'
                          : 'bg-[#353437] group-hover:bg-[#a38c80]'
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
    </section>
  );
};
