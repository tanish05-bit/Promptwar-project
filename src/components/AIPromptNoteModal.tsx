import React, { useState, useEffect } from 'react';
import { Workbook, Note } from '../types';

interface AIPromptNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbooks: Workbook[];
  currentWorkbookId: string;
  onNoteCreated: (note: Note) => void;
}

export const AIPromptNoteModal: React.FC<AIPromptNoteModalProps> = ({
  isOpen,
  onClose,
  workbooks,
  currentWorkbookId,
  onNoteCreated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [selectedWorkbookId, setSelectedWorkbookId] = useState(currentWorkbookId);
  const [noteType, setNoteType] = useState<'text note' | 'AI-generated content'>('AI-generated content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);

  useEffect(() => {
    setSelectedWorkbookId(currentWorkbookId);
  }, [currentWorkbookId]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/ai/quota-status')
        .then((res) => res.json())
        .then((data) => setQuotaStatus(data))
        .catch(() => {});
    }
  }, [isOpen]);

  const handleGenerateAndSave = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          title: title.trim() || `AI Synthesis: ${prompt.slice(0, 38)}...`,
          workbookId: selectedWorkbookId,
          noteType: noteType,
          autoSaveAsNote: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setGeneratedResult(data.text);
      if (data.savedNote) {
        onNoteCreated(data.savedNote);
      }
      if (data.quotaStatus) {
        setQuotaStatus(data.quotaStatus);
      }
    } catch (err: any) {
      console.error('Error generating AI note:', err);
      setErrorMsg(err.message || 'Failed to synthesize content with Gemini AI');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b1b1d] border border-[#ffb68c]/30 rounded-2xl p-6 max-w-xl w-full shadow-2xl animate-fade-in text-[#e4e2e4] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2c] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2a1708] border border-[#ffb68c]/30 flex items-center justify-center text-[#ffb68c]">
              <span className="material-symbols-outlined text-[24px]">psychology</span>
            </div>
            <div>
              <h3 className="font-headline-md text-xl text-[#ffb68c] font-bold">
                Synthesize AI Manuscript Note
              </h3>
              <p className="text-xs text-[#a38c80]">
                Direct prompt execution via Gemini 3.8 Flash with auto quota rotation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#242426] hover:bg-[#353437] flex items-center justify-center text-[#a38c80] hover:text-[#e4e2e4] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Quota Status Pill */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-[#131315] border border-[#2a2a2c] flex items-center justify-between text-xs font-label-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7ddba3]" />
            <span className="text-[#dbc1b4]">Active Gemini Key:</span>
            <span className="text-[#ffb68c] font-semibold">
              {quotaStatus?.activeKeyLabel || 'User Provided API Key'}
            </span>
          </div>
          <span className="text-[11px] text-[#a38c80]">Secured via Server Backend</span>
        </div>

        {/* Form Controls */}
        <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
          <div>
            <label className="block text-[11px] font-label-sm uppercase text-[#a38c80] mb-1">
              Target Codex Workbook
            </label>
            <select
              value={selectedWorkbookId}
              onChange={(e) => setSelectedWorkbookId(e.target.value)}
              className="w-full bg-[#131315] border border-[#2a2a2c] text-xs font-label-md text-[#e4e2e4] px-3 py-2 rounded-lg focus:outline-none focus:border-[#ffb68c]"
            >
              {workbooks.map((wb) => (
                <option key={wb.id} value={wb.id}>
                  {wb.name} ({wb.noteCount} notes)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-label-sm uppercase text-[#a38c80] mb-1">
              Note Classification Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNoteType('AI-generated content')}
                className={`px-3 py-2 rounded-lg border text-xs font-label-md flex items-center gap-2 transition-colors ${
                  noteType === 'AI-generated content'
                    ? 'border-[#ffb68c] bg-[#2a1708] text-[#ffb68c]'
                    : 'border-[#2a2a2c] bg-[#131315] text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                <span>'AI-generated content'</span>
              </button>
              <button
                type="button"
                onClick={() => setNoteType('text note')}
                className={`px-3 py-2 rounded-lg border text-xs font-label-md flex items-center gap-2 transition-colors ${
                  noteType === 'text note'
                    ? 'border-[#ffb68c] bg-[#2a1708] text-[#ffb68c]'
                    : 'border-[#2a2a2c] bg-[#131315] text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>'text note'</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-label-sm uppercase text-[#a38c80] mb-1">
              Manuscript Note Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. § 04.5 Dialectical Invariants in Non-Convex Optimization"
              className="w-full bg-[#131315] border border-[#2a2a2c] text-xs font-label-md text-[#e4e2e4] px-3 py-2 rounded-lg focus:outline-none focus:border-[#ffb68c]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-label-sm uppercase text-[#a38c80] mb-1">
              User Prompt / Epistemic Query *
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Enter your scholarly prompt or research inquiry. For example: 'Synthesize Hume's problem of induction with modern RLHF reward shaping, formalizing the inductive gap in out-of-distribution evaluations.'"
              className="w-full bg-[#131315] border border-[#2a2a2c] text-xs font-body-md text-[#e4e2e4] p-3 rounded-lg focus:outline-none focus:border-[#ffb68c] resize-none leading-relaxed"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#3d0005] border border-[#ffb4ab]/30 text-[#ffb4ab] text-xs font-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="p-3 rounded-lg bg-[#143320] border border-[#7ddba3]/30 text-xs text-[#e4e2e4]">
              <div className="flex items-center gap-1.5 text-[#7ddba3] font-label-md font-bold mb-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Successfully Synthesized & Stored in Database!</span>
              </div>
              <p className="line-clamp-3 text-[#dbc1b4] text-[11px] font-body-sm italic">
                {generatedResult}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#2a2a2c] flex items-center justify-between gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-label-md text-[#a38c80] hover:text-[#e4e2e4]"
          >
            Close
          </button>
          <button
            onClick={handleGenerateAndSave}
            disabled={isGenerating || !prompt.trim()}
            className="px-5 py-2.5 bg-[#d97736] hover:bg-[#f9ba78] text-[#532200] font-label-md font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#532200] border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing & Storing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">neurology</span>
                <span>Generate & Store Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
