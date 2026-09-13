import React, { useState, useRef, useEffect } from 'react';

export interface StickyNoteItem {
  id: string;
  title: string;
  text: string;
  x: number;
  y: number;
  color: 'amber' | 'gold' | 'emerald' | 'rose' | 'indigo';
  isMinimized: boolean;
}

interface DraggableStickyNoteProps {
  note: StickyNoteItem;
  onUpdate: (id: string, updates: Partial<StickyNoteItem>) => void;
  onDelete: (id: string) => void;
  onBringToFront?: (id: string) => void;
}

const COLOR_MAP = {
  gold: {
    bg: 'bg-[#282216]',
    border: 'border-[#ffb68c]/60',
    headerBg: 'bg-[#3b2e1b]',
    headerText: 'text-[#ffb68c]',
    textareaText: 'text-[#f5ebd8]',
    accent: '#ffb68c',
  },
  amber: {
    bg: 'bg-[#2b1e17]',
    border: 'border-[#d97736]/60',
    headerBg: 'bg-[#422616]',
    headerText: 'text-[#f9ba78]',
    textareaText: 'text-[#f8ede6]',
    accent: '#d97736',
  },
  emerald: {
    bg: 'bg-[#152520]',
    border: 'border-[#8ed5b4]/60',
    headerBg: 'bg-[#1a382e]',
    headerText: 'text-[#8ed5b4]',
    textareaText: 'text-[#e6f7ef]',
    accent: '#8ed5b4',
  },
  rose: {
    bg: 'bg-[#29171f]',
    border: 'border-[#f28ba8]/60',
    headerBg: 'bg-[#401c2c]',
    headerText: 'text-[#f28ba8]',
    textareaText: 'text-[#faebf1]',
    accent: '#f28ba8',
  },
  indigo: {
    bg: 'bg-[#181a2e]',
    border: 'border-[#9fa8f5]/60',
    headerBg: 'bg-[#232747]',
    headerText: 'text-[#9fa8f5]',
    textareaText: 'text-[#edeefb]',
    accent: '#9fa8f5',
  },
};

export const DraggableStickyNote: React.FC<DraggableStickyNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  onBringToFront,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const theme = COLOR_MAP[note.color] || COLOR_MAP.gold;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'textarea' ||
        (e.target as HTMLElement).tagName.toLowerCase() === 'button' ||
        (e.target as HTMLElement).tagName.toLowerCase() === 'input') {
      return;
    }
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    });
    if (onBringToFront) onBringToFront(note.id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 280, e.clientX - dragOffset.x));
      const newY = Math.max(70, Math.min(window.innerHeight - 150, e.clientY - dragOffset.y));
      onUpdate(note.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, note.id, onUpdate]);

  return (
    <div
      style={{
        position: 'fixed',
        left: `${note.x}px`,
        top: `${note.y}px`,
        zIndex: isDragging ? 9999 : 50,
      }}
      className={`w-64 rounded-xl shadow-2xl border ${theme.border} ${theme.bg} backdrop-blur-md transition-shadow select-none ${
        isDragging ? 'shadow-2xl scale-[1.02]' : 'shadow-lg'
      }`}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        className={`px-3 py-2 ${theme.headerBg} rounded-t-xl flex items-center justify-between cursor-move border-b border-white/10`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="material-symbols-outlined text-[16px] text-white/60">drag_indicator</span>
          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdate(note.id, { title: e.target.value })}
            className={`bg-transparent text-xs font-semibold ${theme.headerText} focus:outline-none truncate w-28`}
            placeholder="Sticky Note"
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Color Switcher */}
          <div className="flex items-center gap-1 mr-1">
            {(['gold', 'amber', 'emerald', 'rose', 'indigo'] as const).map((c) => (
              <button
                key={c}
                onClick={() => onUpdate(note.id, { color: c })}
                className={`w-2.5 h-2.5 rounded-full transition-transform ${
                  note.color === c ? 'scale-125 ring-1 ring-white' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    c === 'gold'
                      ? '#ffb68c'
                      : c === 'amber'
                      ? '#d97736'
                      : c === 'emerald'
                      ? '#8ed5b4'
                      : c === 'rose'
                      ? '#f28ba8'
                      : '#9fa8f5',
                }}
                title={`Set ${c}`}
              />
            ))}
          </div>

          <button
            onClick={() => onUpdate(note.id, { isMinimized: !note.isMinimized })}
            className="text-white/60 hover:text-white p-0.5"
            title={note.isMinimized ? 'Expand' : 'Minimize'}
          >
            <span className="material-symbols-outlined text-[15px]">
              {note.isMinimized ? 'unfold_more' : 'unfold_less'}
            </span>
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-white/60 hover:text-red-400 p-0.5"
            title="Delete sticky note"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>
      </div>

      {/* Body Area */}
      {!note.isMinimized && (
        <div className="p-2.5">
          <textarea
            value={note.text}
            onChange={(e) => onUpdate(note.id, { text: e.target.value })}
            placeholder="Type quick thought, scholarly citation, or prompt..."
            className={`w-full h-32 bg-transparent text-xs leading-relaxed ${theme.textareaText} resize-none focus:outline-none placeholder-white/30`}
            autoFocus={!note.text}
          />
          <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
            <span>{note.text.length} chars</span>
            <span>Draggable Box</span>
          </div>
        </div>
      )}
    </div>
  );
};
