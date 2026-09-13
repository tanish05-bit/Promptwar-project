import React, { useState, useEffect } from 'react';
import { StudyCard } from '../types';

interface StudyCardDeckProps {
  cards: StudyCard[];
  activeCardIndex: number;
  onSelectCardIndex: (index: number) => void;
  onReviewCard: (cardId: string, rating: 'hard' | 'good' | 'mastered') => void;
  onTogglePinCard: (cardId: string) => void;
  onAddNewCardModal: () => void;
}

export const StudyCardDeck: React.FC<StudyCardDeckProps> = ({
  cards,
  activeCardIndex,
  onSelectCardIndex,
  onReviewCard,
  onTogglePinCard,
  onAddNewCardModal,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const card = cards[activeCardIndex] || cards[0];

  // Reset flip when card index changes
  useEffect(() => {
    setIsFlipped(false);
  }, [activeCardIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space' || e.key === ' ' || e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        if (activeCardIndex < cards.length - 1) {
          onSelectCardIndex(activeCardIndex + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeCardIndex > 0) {
          onSelectCardIndex(activeCardIndex - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCardIndex, cards.length, onSelectCardIndex]);

  if (!card) {
    return (
      <div className="p-6 bg-[#2a2a2c] rounded-xl text-center text-[#dbc1b4]">
        <p>No study cards created yet.</p>
        <button
          onClick={onAddNewCardModal}
          className="mt-3 px-3 py-1.5 bg-[#d97736] text-[#532200] rounded font-bold text-xs"
        >
          Create First Card
        </button>
      </div>
    );
  }

  const handleNext = () => {
    if (activeCardIndex < cards.length - 1) {
      onSelectCardIndex(activeCardIndex + 1);
    } else {
      onSelectCardIndex(0); // wrap around
    }
  };

  const handlePrev = () => {
    if (activeCardIndex > 0) {
      onSelectCardIndex(activeCardIndex - 1);
    } else {
      onSelectCardIndex(cards.length - 1);
    }
  };

  const handleRating = (rating: 'hard' | 'good' | 'mastered') => {
    onReviewCard(card.id, rating);
    setTimeout(() => {
      handleNext();
    }, 250);
  };

  return (
    <section className="bg-[#2a2a2c] rounded-xl p-4 lg:p-5 shadow-2xl relative border border-[#353437] flex flex-col justify-between">
      {/* Tab & Concept Tracker Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ffb68c] animate-pulse"></span>
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#ffb68c] font-semibold">
            Active Study Stack
          </span>
          <span className="font-label-sm text-[11px] text-[#a38c80]">
            • Card {String(activeCardIndex + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded font-label-sm text-[10px] font-semibold uppercase tracking-wider ${
              card.conceptBadge === 'MASTERED'
                ? 'bg-[#8ed5b4]/20 text-[#8ed5b4] border border-[#8ed5b4]/40'
                : card.conceptBadge === 'IN REVIEW'
                ? 'bg-[#f9ba78]/20 text-[#f9ba78] border border-[#f9ba78]/40'
                : 'bg-[#1b1b1d] text-[#ffb68c] border border-[#554339]/40'
            }`}
          >
            {card.conceptBadge}
          </span>

          <button
            onClick={() => onTogglePinCard(card.id)}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
              card.isPinned
                ? 'text-[#ffb68c]'
                : 'text-[#a38c80] hover:text-[#ffb68c]'
            }`}
            title={card.isPinned ? 'Unpin card' : 'Pin card to desk'}
          >
            <span className="material-symbols-outlined text-[16px]">push_pin</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[360px] cursor-pointer relative group select-none transition-all duration-300"
        id="study-card"
        tabIndex={0}
      >
        {/* Ambient top amber highlight strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#ffb68c]/30 via-[#d97736] to-[#f9ba78]/30 rounded-t-xl"></div>

        {!isFlipped ? (
          /* FRONT SIDE */
          <div
            className="w-full h-full bg-[#1b1b1d] rounded-b-xl p-4 lg:p-5 flex flex-col justify-between shadow-lg border-x border-b border-[#353437] transition-all animate-fade-in"
            id="card-front"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] text-[#a38c80] uppercase tracking-wider">
                  Epistemic Vulnerability
                </span>
                <span className="font-label-sm text-[11px] text-[#8ed5b4] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">psychology</span>
                  High Yield
                </span>
              </div>

              <h2 className="font-headline-md text-xl lg:text-2xl text-[#e4e2e4] font-bold leading-snug">
                {card.title}
              </h2>

              <p className="font-body-md text-sm text-[#dbc1b4] leading-relaxed">
                {card.question}
              </p>

              {/* Archival Grounding Snapshot Photo */}
              <div className="relative w-full h-28 rounded-lg bg-[#0e0e10] overflow-hidden shadow-inner my-2 border border-[#2a2a2c]/60">
                <img
                  src={
                    card.imageUrl ||
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
                  }
                  alt="Archival codex grounding"
                  className="w-full h-full object-cover opacity-60 mix-blend-luminosity filter contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b1d] via-[#1b1b1d]/40 to-transparent"></div>
                <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5 text-[#e4e2e4] font-label-sm text-xs">
                  <span className="material-symbols-outlined text-[14px] text-[#f9ba78]">
                    menu_book
                  </span>
                  <span>{card.quoteRef || 'Hume (1748) · Inquiry IV'}</span>
                </div>
              </div>

              {/* Grounding Source Ribbon */}
              <div className="p-2 bg-[#1f1f21] rounded-lg flex items-center gap-2 border border-[#2a2a2c]/50">
                <span className="material-symbols-outlined text-[#ffb68c] text-[15px] shrink-0">
                  neurology
                </span>
                <span className="font-label-sm text-[11px] text-[#dbc1b4] truncate">
                  {card.groundingSource}
                </span>
              </div>
            </div>

            {/* Flip Trigger Cue */}
            <div className="mt-4 pt-2 flex items-center justify-between bg-[#1f1f21]/50 px-3 py-1.5 rounded-lg border border-[#2a2a2c]/40 text-[#a38c80]">
              <div className="flex items-center gap-1.5 text-xs font-label-sm">
                <span className="material-symbols-outlined text-[15px] text-[#ffb68c]">
                  touch_app
                </span>
                <span>
                  Tap card or press{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#353437] text-[#e4e2e4] text-[10px]">
                    Space
                  </kbd>{' '}
                  to reveal
                </span>
              </div>
              <span className="material-symbols-outlined text-[#ffb68c] text-[16px] group-hover:rotate-180 transition-transform duration-300">
                sync
              </span>
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div
            className="w-full h-full bg-[#1f1f21] rounded-b-xl p-4 lg:p-5 flex flex-col justify-between shadow-lg border-x border-b border-[#353437] transition-all animate-fade-in"
            id="card-back"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-[11px] text-[#8ed5b4] font-bold uppercase tracking-wider bg-[#8ed5b4]/10 px-2 py-0.5 rounded">
                  Dialectical Solution
                </span>
                <span className="font-label-sm text-[11px] text-[#a38c80]">
                  Verified Truth
                </span>
              </div>

              <h3 className="font-headline-md text-lg lg:text-xl text-[#ffb68c] font-bold">
                {card.backTitle}
              </h3>

              <p className="font-body-md text-sm text-[#e4e2e4] leading-relaxed">
                {card.backAnswer}
              </p>

              {/* Pedagogical Axiom */}
              {card.pedagogicalAxiom && (
                <div className="p-2.5 bg-[#0e0e10] rounded text-[#e5a968] text-xs font-body-sm border border-[#554339]/40">
                  <strong className="font-semibold text-[#f9ba78]">
                    Pedagogical Axiom:{' '}
                  </strong>
                  {card.pedagogicalAxiom}
                </div>
              )}

              {/* Core Axiom Formula */}
              {card.coreAxiomCode && (
                <div className="p-2 bg-[#131315] rounded-lg text-[#dbc1b4] font-code-snippet text-xs border border-[#2a2a2c]">
                  <span className="text-[#f9ba78] font-medium mr-1.5">Core Axiom:</span>
                  <code className="text-[#ffb68c]">{card.coreAxiomCode}</code>
                </div>
              )}
            </div>

            {/* Retention & Self-Rating Scoring Controls */}
            <div
              className="mt-4 pt-3 border-t border-[#2a2a2c]/60"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2 text-xs font-label-sm text-[#a38c80]">
                <span>Epistemic Self-Rating:</span>
                <span>Interval: {card.intervalDays}d</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRating('hard')}
                  className="h-10 rounded bg-[#1b1b1d] hover:bg-[#93000a]/20 text-[#ffb4ab] font-label-md text-xs flex items-center justify-center gap-1 active:scale-95 transition-all border border-[#93000a]/30"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
                  <span>Hard</span>
                  <span className="text-[#dbc1b4]/60 text-[10px]">1d</span>
                </button>

                <button
                  onClick={() => handleRating('good')}
                  className="h-10 rounded bg-[#1b1b1d] hover:bg-[#673d03]/20 text-[#f9ba78] font-label-md text-xs flex items-center justify-center gap-1 active:scale-95 transition-all border border-[#673d03]/40"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f9ba78]"></span>
                  <span>Good</span>
                  <span className="text-[#dbc1b4]/60 text-[10px]">4d</span>
                </button>

                <button
                  onClick={() => handleRating('mastered')}
                  className="h-10 rounded bg-[#1b1b1d] hover:bg-[#589e7f]/20 text-[#8ed5b4] font-label-md text-xs flex items-center justify-center gap-1 active:scale-95 transition-all border border-[#589e7f]/40"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8ed5b4]"></span>
                  <span>Mastered</span>
                  <span className="text-[#dbc1b4]/60 text-[10px]">9d</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next / Prev Controls & Dots */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="inline-flex items-center gap-1 text-[#a38c80] hover:text-[#e4e2e4] font-label-sm text-xs transition-colors p-1"
          aria-label="Previous study card"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5">
          {cards.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => onSelectCardIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === activeCardIndex
                  ? 'w-5 bg-[#ffb68c]'
                  : 'w-2 bg-[#353437] hover:bg-[#a38c80]'
              }`}
              title={`Card ${idx + 1}: ${c.title}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#d97736] text-[#532200] font-label-sm text-xs font-semibold hover:bg-[#f9ba78] transition-all active:scale-95 shadow-sm"
          aria-label="Next study card"
        >
          <span>Next Card</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </section>
  );
};
