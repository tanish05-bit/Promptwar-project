import React, { useState } from 'react';
import { SourceMedia } from '../types';

interface SourceViewerModalProps {
  source: SourceMedia | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSource?: (id: string) => void;
  onAddNewSource?: (source: Omit<SourceMedia, 'id'>) => void;
  isAddMode?: boolean;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  source,
  isOpen,
  onClose,
  onDeleteSource,
  onAddNewSource,
  isAddMode,
}) => {
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<'pdf' | 'audio' | 'image'>('pdf');
  const [newSourceTag, setNewSourceTag] = useState('Ch. 4 §1 parsed');
  const [newSourceExcerpt, setNewSourceExcerpt] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !onAddNewSource) return;

    onAddNewSource({
      workbookId: 'epistemology-ai',
      name: newSourceName.trim(),
      type: newSourceType,
      icon: newSourceType === 'audio' ? 'graphic_eq' : newSourceType === 'image' ? 'image' : 'picture_as_pdf',
      metadataTag: newSourceTag,
      size: '2.1 MB',
      uploadDate: 'Just now',
      excerpt: newSourceExcerpt || 'New grounded academic citation source.',
      details: 'Indexed directly into the Scholar Codex research vault.',
    });

    setNewSourceName('');
    setNewSourceExcerpt('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b1b1d] border border-[#353437] rounded-xl p-6 max-w-lg w-full shadow-2xl animate-fade-in text-[#e4e2e4]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb68c] text-[22px]">
              {isAddMode ? 'upload_file' : source?.icon || 'description'}
            </span>
            <h3 className="font-headline-md text-lg text-[#ffb68c] font-bold">
              {isAddMode ? 'Attach New Study Source' : source?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#a38c80] hover:text-[#e4e2e4] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {isAddMode ? (
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-body-md">
            <div>
              <label className="block font-label-sm uppercase text-[#a38c80] mb-1">
                Document / Media Title
              </label>
              <input
                type="text"
                required
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="e.g. Hume_Treatise_Book_1.pdf"
                className="w-full bg-[#131315] border border-[#2a2a2c] text-[#e4e2e4] px-3 py-2 rounded focus:outline-none focus:border-[#ffb68c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-label-sm uppercase text-[#a38c80] mb-1">
                  Source Type
                </label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value as any)}
                  className="w-full bg-[#131315] border border-[#2a2a2c] text-[#e4e2e4] px-3 py-2 rounded focus:outline-none focus:border-[#ffb68c]"
                >
                  <option value="pdf">PDF Dossier</option>
                  <option value="audio">Audio Tape / Memo</option>
                  <option value="image">Scanned Manuscript Image</option>
                </select>
              </div>
              <div>
                <label className="block font-label-sm uppercase text-[#a38c80] mb-1">
                  Index Tag
                </label>
                <input
                  type="text"
                  value={newSourceTag}
                  onChange={(e) => setNewSourceTag(e.target.value)}
                  placeholder="e.g. Indexed (14:20)"
                  className="w-full bg-[#131315] border border-[#2a2a2c] text-[#e4e2e4] px-3 py-2 rounded focus:outline-none focus:border-[#ffb68c]"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-sm uppercase text-[#a38c80] mb-1">
                Key Thesis Excerpt / OCR Text
              </label>
              <textarea
                rows={4}
                value={newSourceExcerpt}
                onChange={(e) => setNewSourceExcerpt(e.target.value)}
                placeholder="Paste verbatim excerpt or notes here..."
                className="w-full bg-[#131315] border border-[#2a2a2c] text-[#e4e2e4] p-3 rounded focus:outline-none focus:border-[#ffb68c]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a2c]">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-label-md text-[#a38c80] hover:text-[#e4e2e4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#d97736] hover:bg-[#f9ba78] text-[#532200] font-label-md font-semibold rounded shadow-md"
              >
                Attach to Codex
              </button>
            </div>
          </form>
        ) : (
          source && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#131315] p-3 rounded-lg border border-[#2a2a2c] font-label-sm text-xs">
                <div>
                  <span className="text-[#a38c80]">TYPE: </span>
                  <span className="text-[#ffb68c] uppercase font-bold">{source.type}</span>
                </div>
                <div>
                  <span className="text-[#a38c80]">INDEX: </span>
                  <span className="text-[#8ed5b4]">{source.metadataTag}</span>
                </div>
                <div>
                  <span className="text-[#a38c80]">SIZE: </span>
                  <span className="text-[#e4e2e4]">{source.size}</span>
                </div>
              </div>

              <div>
                <span className="block font-label-sm uppercase text-[#a38c80] text-[10px] mb-1">
                  Primary Text Excerpt
                </span>
                <div className="p-3 bg-[#131315] rounded border border-[#2a2a2c] font-headline-md italic text-sm text-[#dbc1b4] leading-relaxed">
                  “{source.excerpt}”
                </div>
              </div>

              {source.details && (
                <div>
                  <span className="block font-label-sm uppercase text-[#a38c80] text-[10px] mb-1">
                    Archival Grounding Metadata
                  </span>
                  <p className="text-xs text-[#a38c80] font-body-md leading-relaxed">
                    {source.details}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2c]">
                {onDeleteSource && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${source.name}" from workspace?`)) {
                        onDeleteSource(source.id);
                        onClose();
                      }
                    }}
                    className="text-[#ffb4ab] hover:text-[#ffdad6] text-xs font-label-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">delete</span>
                    <span>Detach Source</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-[#2a2a2c] hover:bg-[#353437] text-[#e4e2e4] font-label-sm text-xs rounded ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
