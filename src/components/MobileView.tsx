import React, { useState } from 'react';
import { Note, StudyCard, SourceMedia, GeminiMessage } from '../types';
import { audioEngine, formatTime } from '../utils/audio';

interface MobileViewProps {
  note: Note;
  cards: StudyCard[];
  sources: SourceMedia[];
  activeCardIndex: number;
  onSelectCardIndex: (index: number) => void;
  onReviewCard: (cardId: string, rating: 'hard' | 'good' | 'mastered') => void;
  onRecordVoiceMemo: () => void;
  onAttachMedia: () => void;
  onOpenSourceDetails: (source: SourceMedia) => void;
  geminiMessages: GeminiMessage[];
  onSendMessage: (msg: string) => void;
  isGeneratingCard: boolean;
  onOpenSidebar: () => void;
  onExport: () => void;
  onOpenLiveTranscriber?: () => void;
  onOpenAIPromptNote?: () => void;
}

export const MobileView: React.FC<MobileViewProps> = ({
  note,
  cards,
  sources,
  activeCardIndex,
  onSelectCardIndex,
  onReviewCard,
  onRecordVoiceMemo,
  onAttachMedia,
  onOpenSourceDetails,
  geminiMessages,
  onSendMessage,
  isGeneratingCard,
  onOpenSidebar,
  onExport,
  onOpenLiveTranscriber,
  onOpenAIPromptNote,
}) => {
  const [activeTab, setActiveTab] = useState<'study' | 'manuscript' | 'gemini'>('study');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(42);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isNotesAccordionOpen, setIsNotesAccordionOpen] = useState(true);
  const [quickInput, setQuickInput] = useState('');

  const card = cards[activeCardIndex] || cards[0];
  const activeVoiceNote = note.voiceNotes?.[0];

  const toggleAudio = () => {
    if (isPlayingAudio) {
      audioEngine.pause();
      setIsPlayingAudio(false);
    } else {
      audioEngine.play(
        playbackSpeed,
        (currSec) => setAudioCurrentTime(Math.floor(currSec)),
        () => setIsPlayingAudio(false)
      );
      setIsPlayingAudio(true);
    }
  };

  const handleRating = (rating: 'hard' | 'good' | 'mastered') => {
    onReviewCard(card.id, rating);
    setIsFlipped(false);
    if (activeCardIndex < cards.length - 1) {
      onSelectCardIndex(activeCardIndex + 1);
    } else {
      onSelectCardIndex(0);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onSendMessage(quickInput.trim());
    setQuickInput('');
    setActiveTab('gemini');
  };

  return (
    <div className="w-full min-h-screen bg-[#131315] text-[#e4e2e4] flex flex-col pb-24">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-[#131315]/95 backdrop-blur-md px-4 py-3 border-b border-[#2a2a2c]/60 flex items-center justify-between">
        <button
          onClick={onOpenSidebar}
          className="w-8 h-8 flex items-center justify-center text-[#dbc1b4] rounded hover:bg-[#1f1f21]"
          aria-label="Open Codex Drawer"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2a2a2c] rounded-md border border-[#554339]/40">
          <span className="material-symbols-outlined text-[#f9ba78] text-[15px]">neurology</span>
          <span className="font-label-sm text-xs text-[#f9ba78] font-semibold">
            Epistemology &amp; AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8ed5b4] text-[18px]">
            cloud_done
          </span>
          <button
            onClick={onExport}
            className="w-8 h-8 flex items-center justify-center text-[#ffb68c] rounded hover:bg-[#1f1f21]"
            title="Export Dossier"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
          </button>
          <div className="w-7 h-7 rounded-full bg-[#ffb68c] flex items-center justify-center text-[#532200] font-bold text-xs">
            PV
          </div>
        </div>
      </header>

      {/* Subheader Title & Quick Action Strip */}
      <div className="px-4 py-2.5 bg-[#1b1b1d] border-b border-[#2a2a2c]/50 flex items-center justify-between">
        <div>
          <span className="font-label-sm text-[10px] uppercase text-[#a38c80] block">
            {note.chapter || 'CODEX CHAPTER 03'}
          </span>
          <h2 className="font-headline-md text-sm text-[#e4e2e4] font-bold truncate max-w-[210px]">
            {note.chapterNumber || '§ 03.4'} Inductive Gaps
          </h2>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {onOpenLiveTranscriber && (
            <button
              onClick={onOpenLiveTranscriber}
              className="p-1.5 bg-[#2a2a2c] text-[#ffb68c] rounded-lg border border-[#ffb68c]/30 flex items-center gap-1 text-[11px] font-label-sm"
              title="Stream live audio feed and transcribe in real-time"
            >
              <span className="material-symbols-outlined text-[15px]">graphic_eq</span>
              <span>Live</span>
            </button>
          )}
          {onOpenAIPromptNote && (
            <button
              onClick={onOpenAIPromptNote}
              className="p-1.5 bg-[#d97736] text-[#532200] font-semibold rounded-lg flex items-center gap-1 text-[11px] font-label-sm"
              title="Generate AI-powered note"
            >
              <span className="material-symbols-outlined text-[15px]">psychology</span>
              <span>+AI</span>
            </button>
          )}
          <button
            onClick={onRecordVoiceMemo}
            className="p-1.5 bg-[#93000a]/20 text-[#ffb4ab] rounded-lg border border-[#93000a]/30 flex items-center gap-1 text-[11px] font-label-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">mic</span>
            <span>Memo</span>
          </button>
          <button
            onClick={onAttachMedia}
            className="p-1.5 bg-[#1f1f21] text-[#dbc1b4] rounded-lg border border-[#2a2a2c] flex items-center gap-1 text-[11px] font-label-sm"
          >
            <span className="material-symbols-outlined text-[15px] text-[#ffb68c]">add</span>
            <span>File</span>
          </button>
        </div>
      </div>

      {/* Linear Scholarly Flow Meter */}
      <div className="px-4 py-2 bg-[#171719] border-b border-[#2a2a2c]/40 flex items-center justify-between text-[11px] font-label-sm">
        <div className="flex items-center gap-1 text-[#8ed5b4]">
          <span className="material-symbols-outlined text-[13px]">attachment</span>
          <span>Attach Source ({sources.length})</span>
        </div>
        <span className="text-[#353437]">→</span>
        <div className="flex items-center gap-1 text-[#8ed5b4]">
          <span className="material-symbols-outlined text-[13px]">neurology</span>
          <span>AI Grounded</span>
        </div>
        <span className="text-[#353437]">→</span>
        <div className="flex items-center gap-1 text-[#ffb68c] font-bold">
          <span className="material-symbols-outlined text-[13px]">bolt</span>
          <span>
            Card {String(activeCardIndex + 1).padStart(2, '0')}/{String(cards.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Mobile Tab View Content */}
      <main className="px-4 py-4 space-y-4">
        {activeTab === 'study' && (
          <>
            {/* Tactile Study Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full bg-[#1b1b1d] rounded-xl p-4 shadow-xl border border-[#353437] cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-[10px] text-[#ffb68c] uppercase tracking-wider font-semibold">
                  EPISTEMIC VULNERABILITY
                </span>
                <span className="font-label-sm text-[10px] text-[#8ed5b4] bg-[#8ed5b4]/10 px-2 py-0.5 rounded">
                  {card.conceptBadge}
                </span>
              </div>

              {!isFlipped ? (
                <div className="space-y-3">
                  <h3 className="font-headline-md text-lg text-[#e4e2e4] font-bold leading-snug">
                    {card.title}
                  </h3>
                  <p className="font-body-md text-xs text-[#dbc1b4] leading-relaxed">
                    {card.question}
                  </p>

                  <div className="relative w-full h-32 rounded-lg bg-[#0e0e10] overflow-hidden my-2 border border-[#2a2a2c]">
                    <img
                      src={
                        card.imageUrl ||
                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
                      }
                      alt="Archival codex grounding"
                      className="w-full h-full object-cover opacity-60 mix-blend-luminosity filter contrast-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b1d] via-[#1b1b1d]/40 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[#e4e2e4] font-label-sm text-[11px]">
                      <span className="material-symbols-outlined text-[13px] text-[#f9ba78]">
                        menu_book
                      </span>
                      <span>{card.quoteRef || 'Hume (1748) · Inquiry IV'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2c]/60 text-[#a38c80] text-xs font-label-sm">
                    <span className="flex items-center gap-1 text-[#ffb68c]">
                      <span className="material-symbols-outlined text-[15px]">touch_app</span>
                      Tap to reveal answer
                    </span>
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="font-label-sm text-[10px] text-[#8ed5b4] font-bold block uppercase">
                    Dialectical Solution
                  </span>
                  <h4 className="font-headline-md text-base text-[#ffb68c] font-bold">
                    {card.backTitle}
                  </h4>
                  <p className="font-body-md text-xs text-[#e4e2e4] leading-relaxed">
                    {card.backAnswer}
                  </p>

                  {card.coreAxiomCode && (
                    <div className="p-2 bg-[#131315] rounded text-[11px] font-code-snippet text-[#ffb68c] border border-[#2a2a2c]">
                      <code>{card.coreAxiomCode}</code>
                    </div>
                  )}

                  {/* Rating Buttons */}
                  <div
                    className="grid grid-cols-3 gap-2 pt-3 border-t border-[#2a2a2c]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleRating('hard')}
                      className="py-2 bg-[#1f1f21] text-[#ffb4ab] border border-[#93000a]/30 rounded font-label-md text-xs flex flex-col items-center"
                    >
                      <span className="font-bold">Hard</span>
                      <span className="text-[9px] text-[#dbc1b4]/60">1d</span>
                    </button>
                    <button
                      onClick={() => handleRating('good')}
                      className="py-2 bg-[#1f1f21] text-[#f9ba78] border border-[#673d03]/40 rounded font-label-md text-xs flex flex-col items-center"
                    >
                      <span className="font-bold">Good</span>
                      <span className="text-[9px] text-[#dbc1b4]/60">4d</span>
                    </button>
                    <button
                      onClick={() => handleRating('mastered')}
                      className="py-2 bg-[#1f1f21] text-[#8ed5b4] border border-[#589e7f]/40 rounded font-label-md text-xs flex flex-col items-center"
                    >
                      <span className="font-bold">Mastered</span>
                      <span className="text-[9px] text-[#dbc1b4]/60">9d</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible Main Notes & Audio Memo Dossier Accordion */}
            <div className="bg-[#1b1b1d] rounded-xl border border-[#2a2a2c]/60 overflow-hidden shadow-md">
              <button
                onClick={() => setIsNotesAccordionOpen(!isNotesAccordionOpen)}
                className="w-full p-3 bg-[#1f1f21] flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffb68c] text-[18px]">
                    description
                  </span>
                  <span className="font-headline-md text-xs font-bold text-[#e4e2e4]">
                    Main Notes &amp; Audio Memo
                  </span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#a38c80]">
                  {isNotesAccordionOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {isNotesAccordionOpen && (
                <div className="p-4 space-y-3">
                  <blockquote className="border-l-2 border-[#d97736] pl-3 py-1 italic font-headline-md text-xs text-[#dbc1b4]">
                    “When reinforcement learning from human feedback (RLHF) optimizes model outputs... it infers
                    benevolence strictly through repetition of rewards.”
                  </blockquote>

                  {/* Audio Player Module */}
                  <div className="p-3 bg-[#131315] rounded-lg border border-[#2a2a2c]">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-label-sm text-[11px] text-[#e4e2e4] truncate max-w-[170px]">
                        {activeVoiceNote?.filename || 'Prof_Vance_Seminar_Clip_01.wav'}
                      </span>
                      <span className="font-label-sm text-[10px] text-[#a38c80]">
                        {formatTime(audioCurrentTime)} / {activeVoiceNote?.duration || '01:42'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleAudio}
                        className="w-8 h-8 rounded-full bg-[#ffb68c] text-[#532200] flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isPlayingAudio ? 'pause' : 'play_arrow'}
                        </span>
                      </button>

                      {/* Waveform bars */}
                      <div className="flex-1 flex items-center gap-1 h-6">
                        {[10, 16, 22, 14, 20, 12, 18, 24, 16, 12, 20, 14, 18].map((h, idx) => (
                          <div
                            key={idx}
                            style={{ height: `${h}px` }}
                            className={`w-1 rounded ${
                              idx < (audioCurrentTime / 102) * 13
                                ? 'bg-[#ffb68c]'
                                : 'bg-[#353437]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Grounded Source Clips Horizontal Scroll */}
                  <div className="pt-2">
                    <span className="font-label-sm text-[10px] uppercase text-[#a38c80] block mb-1.5">
                      Grounded Source Clips
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {sources.map((src) => (
                        <div
                          key={src.id}
                          onClick={() => onOpenSourceDetails(src)}
                          className="px-2.5 py-1.5 bg-[#1f1f21] rounded-lg flex items-center gap-1.5 shrink-0 border border-[#2a2a2c] cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[#ffb68c] text-[14px]">
                            {src.icon}
                          </span>
                          <span className="font-label-sm text-[11px] text-[#e4e2e4]">
                            {src.name}
                          </span>
                        </div>
                      ))}
                      <button
                        onClick={onAttachMedia}
                        className="w-7 h-7 rounded-lg bg-[#2a2a2c] text-[#dbc1b4] flex items-center justify-center shrink-0 border border-[#353437]"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ambient Scholar Visual Banner */}
            <div className="p-3 bg-[#1f1f21] rounded-xl flex items-center justify-between border border-[#2a2a2c]/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8ed5b4] text-[20px]">
                  trending_up
                </span>
                <div>
                  <span className="font-label-sm text-[10px] uppercase text-[#a38c80] block">
                    Active Retention Cycle
                  </span>
                  <span className="font-headline-md text-xs text-[#e4e2e4] font-bold">
                    94.2% Epistemic Stability
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#8ed5b4] flex items-center justify-center font-label-sm text-[10px] text-[#8ed5b4] font-bold">
                94%
              </div>
            </div>
          </>
        )}

        {activeTab === 'manuscript' && (
          <div className="bg-[#1b1b1d] rounded-xl p-4 border border-[#2a2a2c] space-y-4">
            <h2 className="font-headline-lg text-lg text-[#e4e2e4] font-semibold">
              {note.title}
            </h2>
            <div className="font-headline-md text-sm text-[#dbc1b4] leading-relaxed whitespace-pre-wrap">
              {note.content}
            </div>
          </div>
        )}

        {activeTab === 'gemini' && (
          <div className="bg-[#1b1b1d] rounded-xl p-4 border border-[#2a2a2c] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#2a2a2c]">
              <span className="material-symbols-outlined text-[#ffb68c]">neurology</span>
              <h3 className="font-headline-md text-sm font-bold text-[#e4e2e4]">
                Gemini Dialectic Scribe
              </h3>
            </div>
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {geminiMessages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-lg text-xs ${
                    m.role === 'user' ? 'bg-[#1f1f21] border border-[#353437]' : 'bg-[#2a2a2c]'
                  }`}
                >
                  <span className="font-label-sm text-[10px] text-[#ffb68c] block mb-1 uppercase">
                    {m.role === 'user' ? 'Scholar' : 'Gemini'}
                  </span>
                  <p className="text-[#e4e2e4] leading-relaxed">{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Quick-Action Bar for Gemini Copilot */}
      <div className="fixed bottom-14 left-0 right-0 bg-[#1b1b1d]/95 backdrop-blur-md px-3 py-2 border-t border-[#2a2a2c]/60 z-30">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-2">
          <button
            onClick={() => onSendMessage("Explain Hume's Induction")}
            className="px-2 py-1 rounded-full bg-[#1f1f21] text-[#dbc1b4] font-label-sm text-[10px] whitespace-nowrap border border-[#2a2a2c]"
          >
            Explain Hume's Induction
          </button>
          <button
            onClick={() => onSendMessage('Test Me on This Card')}
            className="px-2 py-1 rounded-full bg-[#1f1f21] text-[#dbc1b4] font-label-sm text-[10px] whitespace-nowrap border border-[#2a2a2c]"
          >
            Test Me on This Card
          </button>
          <button
            onClick={() => onSendMessage('Extract Next Concept')}
            className="px-2 py-1 rounded-full bg-[#1f1f21] text-[#dbc1b4] font-label-sm text-[10px] whitespace-nowrap border border-[#2a2a2c]"
          >
            Extract Next Concept
          </button>
        </div>

        <form onSubmit={handleQuickSubmit} className="relative flex items-center">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Ask Gemini about this note or attached sources..."
            className="w-full bg-[#131315] text-[#e4e2e4] text-xs px-3 py-1.5 pr-8 rounded-lg border border-[#2a2a2c] focus:outline-none focus:border-[#ffb68c]"
          />
          <button
            type="submit"
            className="absolute right-1 w-6 h-6 rounded bg-[#d97736] text-[#532200] flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
          </button>
        </form>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-[#131315] border-t border-[#2a2a2c]/80 flex items-center justify-around z-30">
        <button
          onClick={() => setActiveTab('study')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'study' ? 'text-[#ffb68c]' : 'text-[#a38c80]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
          <span className="font-label-sm text-[10px]">Study Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('manuscript')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'manuscript' ? 'text-[#ffb68c]' : 'text-[#a38c80]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span className="font-label-sm text-[10px]">Sources &amp; Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('gemini')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'gemini' ? 'text-[#ffb68c]' : 'text-[#a38c80]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">neurology</span>
          <span className="font-label-sm text-[10px]">Gemini AI</span>
        </button>
      </nav>
    </div>
  );
};
