import React, { useState } from 'react';

interface NewWorkbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; icon: string; description: string }) => void;
}

export const NewWorkbookModal: React.FC<NewWorkbookModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('neurology');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      icon,
      description: description.trim() || 'New research codex archive.',
    });
    setName('');
    setDescription('');
    onClose();
  };

  const icons = [
    { name: 'neurology', label: 'Epistemology' },
    { name: 'account_tree', label: 'Algorithms' },
    { name: 'functions', label: 'Mathematics' },
    { name: 'swords', label: 'Benchmarks' },
    { name: 'history_edu', label: 'Ledger' },
    { name: 'psychology', label: 'Cognition' },
    { name: 'menu_book', label: 'Philosophy' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b1b1d] border border-[#ffb68c]/40 rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in text-[#e4e2e4]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2c]">
          <h3 className="font-headline-md text-lg text-[#ffb68c] font-bold">
            Create Curated Codex
          </h3>
          <button onClick={onClose} className="text-[#a38c80] hover:text-[#e4e2e4]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body-md">
          <div>
            <label className="block font-label-sm uppercase text-[#a38c80] mb-1">
              Codex Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Epistemic Guardrails & Safety"
              className="w-full bg-[#131315] border border-[#2a2a2c] text-[#e4e2e4] px-3 py-2 rounded focus:outline-none focus:border-[#ffb68c]"
            />
          </div>

          <div>
            <label className="block font-label-sm uppercase text-[#a38c80] mb-1">
              Select Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {icons.map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setIcon(ic.name)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-label-sm transition-all ${
                    icon === ic.name
                      ? 'bg-[#d97736] text-[#532200] border-[#ffb68c] font-bold'
                      : 'bg-[#1f1f21] text-[#a38c80] border-[#2a2a2c] hover:text-[#e4e2e4]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{ic.name}</span>
                  <span>{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-label-sm uppercase text-[#a38c80] mb-1">
              Research Thesis &amp; Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the research questions and epistemic bounds..."
              className="w-full bg-[#131315] border border-[#2a2a2c] text-[#e4e2e4] p-2.5 rounded focus:outline-none focus:border-[#ffb68c]"
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
              Initialize Codex
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
