import React, { useState, useEffect, useRef } from 'react';
import { WebsiteProject } from '../types';

interface ImageToWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  workbookId: string;
  onWebsiteCreated: (project: WebsiteProject) => void;
  showToast: (msg: string) => void;
}

interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  prompt: string;
  description: string;
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'tpl-scholar',
    name: 'Scholar Codex Portal',
    category: 'Research & Archival',
    icon: 'menu_book',
    prompt: 'Create an archival scholarly study portal with epistemic dialectic terminal, interactive flashcards, audio memo player, and deep dark-amber obsidian theme.',
    description: 'Leather-bound obsidian aesthetic with Literata typography, study stacks, and formal inquiry panels.',
  },
  {
    id: 'tpl-saas',
    name: 'Modern AI SaaS Landing',
    category: 'Product & SaaS',
    icon: 'rocket_launch',
    prompt: 'Create a modern frontier AI product landing page with sticky blur navbar, dynamic gradient hero, 3-tier pricing cards, customer testimonials, and interactive demo widget.',
    description: 'High-conversion product showcase with sleek dark mode, glowing accents, and interactive feature tabs.',
  },
  {
    id: 'tpl-dashboard',
    name: 'Analytic Codex Bench',
    category: 'Dashboard & Metrics',
    icon: 'analytics',
    prompt: 'Create an analytics and research dashboard with metric stats cards, data tables, filter pills, real-time activity stream, and search bar.',
    description: 'Clean data-dense workbench layout with metric callouts, charts simulation, and status badges.',
  },
  {
    id: 'tpl-portfolio',
    name: 'Academic Portfolio & Papers',
    category: 'Academic & Vitae',
    icon: 'school',
    prompt: 'Create a university fellow or researcher portfolio with publications list, curriculum vitae section, colloquium schedule, and contact dialog.',
    description: 'Refined editorial typography with PDF download links, paper abstracts, and seminar timeline.',
  },
];

export const ImageToWebModal: React.FC<ImageToWebModalProps> = ({
  isOpen,
  onClose,
  workbookId,
  onWebsiteCreated,
  showToast,
}) => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Clipboard Paste Listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            processImageFile(blob, 'pasted_screenshot.png');
            showToast('Pasted image from clipboard');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const processImageFile = (file: File, fallbackName?: string) => {
    // Validate format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showToast('Unsupported format. Please upload JPG, PNG, or WebP.');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit.');
      return;
    }

    setImageFileName(file.name || fallbackName || 'uploaded_image.png');
    setImageFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset: TemplatePreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    showToast(`Applied preset: ${preset.name}`);
  };

  const handleClearImage = () => {
    setImageBase64(null);
    setImageFileName('');
    setImageFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateWebsite = async () => {
    if (!imageBase64 && !prompt.trim()) {
      showToast('Please upload an image, select a template, or enter prompt instructions.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analyzing visual layout & component hierarchy...');

    try {
      setTimeout(() => {
        setGenerationStep('Extracting color palette & responsive typography...');
      }, 900);

      setTimeout(() => {
        setGenerationStep('Synthesizing semantic HTML5 & modern CSS3...');
      }, 1900);

      setTimeout(() => {
        setGenerationStep('Compiling interactive client-side JavaScript...');
      }, 2900);

      const res = await fetch('/api/ai/image-to-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64 || undefined,
          mimeType: imageMimeType,
          prompt: prompt || 'Convert this visual design into a complete, modern, responsive website.',
          workbookId,
          title: imageFileName ? `Website from ${imageFileName.slice(0, 20)}` : 'Synthesized Web Studio Project',
        }),
      });

      const data = await res.json();
      if (data && data.project) {
        showToast('Website created successfully! Loading in Studio...');
        onWebsiteCreated(data.project);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to generate website');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Generation failed: ' + (err?.message || 'Server error'));
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1b1b1d] border border-[#2e2d35] rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e2d35] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ffb68c] text-[22px]">
              auto_awesome
            </span>
            <div>
              <h2 className="font-serif font-semibold text-base text-[#f0ede6]">
                AI Image → Website Conversion Engine
              </h2>
              <p className="text-xs text-[#a38c80]">
                Drop any UI mockup, screenshot, wireframe, or sketch to generate functional code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#a38c80] hover:text-[#f0ede6] p-1 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div>
          <label className="block text-xs font-semibold text-[#dbc1b4] mb-1.5">
            1. Upload or Paste Prototype / Screenshot (or press Ctrl+V)
          </label>

          {imageBase64 ? (
            <div className="bg-[#131315] border border-[#ffb68c]/50 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={imageBase64}
                  alt="Mockup Preview"
                  className="w-16 h-16 object-cover rounded-lg border border-[#2e2d35]"
                />
                <div className="truncate">
                  <div className="font-mono text-xs text-[#f0ede6] font-semibold truncate">
                    {imageFileName}
                  </div>
                  <div className="text-[11px] text-[#a38c80] flex items-center gap-2 mt-0.5">
                    <span>{imageFileSize}</span>
                    <span>•</span>
                    <span className="text-[#8ed5b4]">Ready for AI analysis</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs rounded bg-[#26252b] text-[#dbc1b4] hover:text-[#ffb68c] border border-[#2e2d35]"
                >
                  Change
                </button>
                <button
                  onClick={handleClearImage}
                  className="px-2.5 py-1 text-xs rounded bg-[#26252b] text-[#ffb4ab] hover:bg-[#93000a]/40 border border-[#2e2d35]"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragOver
                  ? 'border-[#ffb68c] bg-[#ffb68c]/5'
                  : 'border-[#2e2d35] hover:border-[#a38c80] bg-[#131315]'
              }`}
            >
              <span className="material-symbols-outlined text-[#ffb68c] text-[36px]">
                add_photo_alternate
              </span>
              <div className="text-xs text-[#f0ede6] font-medium">
                Drag and drop your UI screenshot, wireframe, or mockup here
              </div>
              <div className="text-[11px] text-[#a38c80]">
                or <span className="text-[#ffb68c] underline">browse file</span> • PNG, JPG, WebP supported (Up to 10MB)
              </div>
              <div className="mt-1 text-[10px] font-mono text-[#a38c80] bg-[#1e1e22] px-2 py-0.5 rounded border border-[#2e2d35]">
                💡 Tip: Press Ctrl + V anywhere to paste an image directly from clipboard
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processImageFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>

        {/* Starter Inspiration Presets */}
        <div>
          <label className="block text-xs font-semibold text-[#dbc1b4] mb-1.5">
            2. Or Choose a Scholarly / Product Preset Template
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TEMPLATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  selectedPresetId === preset.id
                    ? 'bg-[#26252b] border-[#ffb68c] shadow-md'
                    : 'bg-[#131315] border-[#2e2d35] hover:border-[#a38c80]'
                }`}
              >
                <span className="material-symbols-outlined text-[#ffb68c] text-[20px] mt-0.5">
                  {preset.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#f0ede6] truncate">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-[#a38c80] line-clamp-2 mt-0.5">
                    {preset.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Instructions */}
        <div>
          <label className="block text-xs font-semibold text-[#dbc1b4] mb-1.5">
            3. Custom AI Prompt Instructions (Optional)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Make it fully responsive, include dark/light toggle, add modern card hover shadows and interactive filter buttons'..."
            className="w-full bg-[#131315] text-[#f0ede6] p-3 rounded-xl border border-[#2e2d35] text-xs focus:outline-none focus:border-[#ffb68c] resize-none h-20"
          />
        </div>

        {/* Generation Progress Indicator */}
        {isGenerating && (
          <div className="bg-[#131315] border border-[#ffb68c]/40 rounded-xl p-4 flex flex-col gap-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#ffb68c] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ffb68c] animate-ping"></span>
                Generating Production Website...
              </span>
              <span className="text-[#a38c80]">Gemini Multimodal Vision</span>
            </div>
            <div className="w-full bg-[#26252b] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#d97736] via-[#ffb68c] to-[#8ed5b4] h-full w-3/4 animate-pulse"></div>
            </div>
            <div className="text-[11px] text-[#dbc1b4] italic mt-1">
              {generationStep || 'Analyzing visual tokens and generating code...'}
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2e2d35]">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg text-xs text-[#a38c80] hover:text-[#f0ede6] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerateWebsite}
            disabled={isGenerating || (!imageBase64 && !prompt.trim())}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#d97736] text-[#161618] text-xs font-semibold hover:bg-[#e5a968] disabled:opacity-40 transition-all shadow-lg"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#161618] border-t-transparent rounded-full animate-spin"></span>
                <span>Generating Website...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Generate Interactive Website</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
