import React, { useState, useEffect, useRef } from 'react';
import {
  WebsiteProject,
  DesignSettings,
  PreviewDevice,
  CodeEditorTab,
  SelectedSection,
  HistoryState,
  ProjectAsset,
} from '../types';

interface WebsiteStudioProps {
  project: WebsiteProject;
  workbookId: string;
  onUpdateProject: (updated: Partial<WebsiteProject>) => Promise<void>;
  onOpenImageToWebModal: () => void;
  onOpenExportModal: () => void;
  onOpenAssetModal: () => void;
  onSwitchToDesk: () => void;
  showToast: (msg: string) => void;
}

export const WebsiteStudio: React.FC<WebsiteStudioProps> = ({
  project,
  workbookId,
  onUpdateProject,
  onOpenImageToWebModal,
  onOpenExportModal,
  onOpenAssetModal,
  onSwitchToDesk,
  showToast,
}) => {
  // Active Project Code & Settings
  const [htmlCode, setHtmlCode] = useState(project.html);
  const [cssCode, setCssCode] = useState(project.css);
  const [jsCode, setJsCode] = useState(project.js);
  const [designSettings, setDesignSettings] = useState<DesignSettings>(project.designSettings);

  // UI state
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [customFrameWidth, setCustomFrameWidth] = useState<number>(1200);
  const [isResizingFrame, setIsResizingFrame] = useState<boolean>(false);
  const [editorTab, setEditorTab] = useState<CodeEditorTab>('html');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true);
  const [isDesignControlsOpen, setIsDesignControlsOpen] = useState<boolean>(true);
  const [isAdvancedDesignOpen, setIsAdvancedDesignOpen] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<SelectedSection | null>(null);
  const [isInspectMode, setIsInspectMode] = useState<boolean>(false);

  // AI Modification states
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [sectionPrompt, setSectionPrompt] = useState<string>('');
  const [isRegeneratingSection, setIsRegeneratingSection] = useState<boolean>(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState<boolean>(false);

  // History for Undo / Redo
  const [historyStack, setHistoryStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if project prop changes
  useEffect(() => {
    setHtmlCode(project.html);
    setCssCode(project.css);
    setJsCode(project.js);
    setDesignSettings(project.designSettings);
  }, [project.id]);

  // Push to history before mutating
  const pushHistory = (description: string) => {
    setHistoryStack((prev) => [
      ...prev.slice(-25),
      {
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        designSettings: { ...designSettings },
        description,
      },
    ]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const lastState = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [
      ...prev,
      {
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        designSettings: { ...designSettings },
        description: 'Before Undo',
      },
    ]);
    setHtmlCode(lastState.html);
    setCssCode(lastState.css);
    setJsCode(lastState.js);
    setDesignSettings(lastState.designSettings);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    showToast(`Undo: ${lastState.description}`);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [
      ...prev,
      {
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        designSettings: { ...designSettings },
        description: 'Before Redo',
      },
    ]);
    setHtmlCode(nextState.html);
    setCssCode(nextState.css);
    setJsCode(nextState.js);
    setDesignSettings(nextState.designSettings);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    showToast('Redo successful');
  };

  // Debounced Auto-Save
  useEffect(() => {
    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await onUpdateProject({
          html: htmlCode,
          css: cssCode,
          js: jsCode,
          designSettings,
        });
        setSaveStatus('saved');
      } catch (err) {
        setSaveStatus('unsaved');
        console.error('Auto-save error:', err);
      }
    }, 1200);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [htmlCode, cssCode, jsCode, designSettings]);

  // Construct Sandboxed Preview Document
  const updateIframeContent = () => {
    if (!iframeRef.current) return;
    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;

    // Inject Design Settings as CSS Variable Overrides
    const dynamicOverrides = `
      :root {
        --primary: ${designSettings.primaryColor} !important;
        --bg-color: ${designSettings.backgroundColor} !important;
        --surface-1: ${designSettings.surfaceColor} !important;
        --text-main: ${designSettings.textColor} !important;
        --accent: ${designSettings.accentColor} !important;
        --font-body: '${designSettings.fontFamily}', system-ui, sans-serif !important;
        --radius: ${designSettings.borderRadius}px !important;
      }
      body {
        font-size: ${designSettings.baseFontSize}px !important;
      }
      .container, .nav-container, .section-container, .hero-container {
        max-width: ${designSettings.containerMaxWidth}px !important;
      }
      ${isInspectMode ? `
        *:hover {
          outline: 2px dashed #ffb68c !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
        }
      ` : ''}
    `;

    // Script to communicate selected element back to parent window
    const inspectorScript = `
      <script>
        document.addEventListener('click', function(e) {
          if (${isInspectMode}) {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target;
            const rect = target.getBoundingClientRect();
            window.parent.postMessage({
              type: 'ELEMENT_SELECTED',
              tag: target.tagName.toLowerCase(),
              selector: target.className ? '.' + target.className.split(' ').join('.') : target.tagName.toLowerCase(),
              outerHtml: target.outerHTML,
              textContent: target.textContent ? target.textContent.slice(0, 100) : '',
              boundingBox: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
              }
            }, '*');
          }
        }, true);
      </script>
    `;

    let compiledDoc = htmlCode;
    // Inject custom CSS into head or style tag
    if (compiledDoc.includes('</head>')) {
      compiledDoc = compiledDoc.replace(
        '</head>',
        `<style>${cssCode}\n${dynamicOverrides}</style>${inspectorScript}</head>`
      );
    } else {
      compiledDoc = `<style>${cssCode}\n${dynamicOverrides}</style>${inspectorScript}` + compiledDoc;
    }

    // Inject JS before closing body
    if (compiledDoc.includes('</body>')) {
      compiledDoc = compiledDoc.replace('</body>', `<script>${jsCode}</script></body>`);
    } else {
      compiledDoc += `<script>${jsCode}</script>`;
    }

    iframeDoc.open();
    iframeDoc.write(compiledDoc);
    iframeDoc.close();
  };

  // Re-render preview on code or design settings update
  useEffect(() => {
    updateIframeContent();
  }, [htmlCode, cssCode, jsCode, designSettings, isInspectMode]);

  // Listen to postMessage from sandboxed iframe for Element Inspector
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ELEMENT_SELECTED') {
        setSelectedSection({
          tag: event.data.tag,
          selector: event.data.selector,
          outerHtml: event.data.outerHtml,
          textContent: event.data.textContent,
          boundingBox: event.data.boundingBox,
        });
        showToast(`Selected component: <${event.data.tag}>`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Frame width calculation based on device mode
  const getFrameWidth = () => {
    switch (previewDevice) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      case 'desktop':
        return 1200;
      case 'responsive':
      default:
        return customFrameWidth;
    }
  };

  // Movable Element Operations (Move Section Up / Down in HTML)
  const handleMoveSection = (direction: 'up' | 'down') => {
    if (!selectedSection) return;
    pushHistory(`Move section ${direction}`);

    // Parse HTML string to DOM, reorder element, and serialize back
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlCode, 'text/html');
    const elements = Array.from(doc.querySelectorAll(selectedSection.tag));
    const targetEl = elements.find((el) => el.outerHTML === selectedSection.outerHtml) || doc.querySelector(selectedSection.selector);

    if (targetEl && targetEl.parentElement) {
      const parent = targetEl.parentElement;
      if (direction === 'up' && targetEl.previousElementSibling) {
        parent.insertBefore(targetEl, targetEl.previousElementSibling);
      } else if (direction === 'down' && targetEl.nextElementSibling) {
        parent.insertBefore(targetEl.nextElementSibling, targetEl);
      }
      const newHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
      setHtmlCode(newHtml);
      showToast(`Component moved ${direction}`);
    } else {
      showToast('Could not locate element in DOM hierarchy');
    }
  };

  const handleDeleteSelectedSection = () => {
    if (!selectedSection) return;
    pushHistory('Delete component');
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlCode, 'text/html');
    const targetEl = doc.querySelector(selectedSection.selector) || Array.from(doc.querySelectorAll(selectedSection.tag)).find((el) => el.outerHTML === selectedSection.outerHtml);

    if (targetEl) {
      targetEl.remove();
      const newHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
      setHtmlCode(newHtml);
      setSelectedSection(null);
      showToast('Component removed');
    }
  };

  // AI Section-Specific Regeneration
  const handleRegenerateSectionSubmit = async () => {
    if (!selectedSection || !sectionPrompt.trim()) return;
    setIsRegeneratingSection(true);
    pushHistory(`Regenerate section: ${sectionPrompt}`);
    showToast('Synthesizing section update with Gemini...');

    try {
      const res = await fetch('/api/ai/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullHtml: htmlCode,
          selectedSectionHtml: selectedSection.outerHtml,
          prompt: sectionPrompt.trim(),
        }),
      });

      const data = await res.json();
      if (data && data.updatedSectionHtml) {
        const newHtml = htmlCode.replace(selectedSection.outerHtml, data.updatedSectionHtml);
        setHtmlCode(newHtml);
        setIsSectionModalOpen(false);
        setSectionPrompt('');
        setSelectedSection(null);
        showToast('Component regenerated successfully!');
      } else {
        throw new Error(data.error || 'Failed to update section');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Section update failed: ' + (err?.message || 'Server error'));
    } finally {
      setIsRegeneratingSection(false);
    }
  };

  // AI Prompt-based Website Edit
  const handleAiEditSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiProcessing(true);
    pushHistory(`Prompt edit: ${aiPrompt.slice(0, 30)}`);
    showToast('Applying natural language edit with Gemini...');

    try {
      const res = await fetch('/api/ai/edit-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: htmlCode,
          css: cssCode,
          js: jsCode,
          prompt: aiPrompt.trim(),
        }),
      });

      const data = await res.json();
      if (data && data.html) {
        setHtmlCode(data.html);
        if (data.css) setCssCode(data.css);
        if (data.js) setJsCode(data.js);
        setAiPrompt('');
        showToast(data.explanation || 'Website updated successfully!');
      } else {
        throw new Error(data.error || 'Failed to edit website');
      }
    } catch (err: any) {
      console.error(err);
      showToast('AI edit failed: ' + (err?.message || 'Server error'));
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-5rem)] bg-[#131315] text-[#e4e2e4]">
      {/* 1. Top Studio Toolbar */}
      <header className="sticky top-16 z-30 bg-[#1e1e22] border-b border-[#2e2d35] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Mode Title, Undo/Redo & Save Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToDesk}
            className="flex items-center gap-1 text-xs text-[#a38c80] hover:text-[#ffb68c] px-2 py-1 rounded bg-[#26252b] border border-[#2e2d35] transition-colors"
            title="Return to Manuscript Scribe Desk"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Manuscript Desk</span>
          </button>

          <div className="h-4 w-px bg-[#353437]"></div>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffb68c] text-[18px]">web</span>
            <span className="font-serif font-semibold text-sm tracking-tight text-[#f0ede6]">
              {project.title}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#26252b] text-[#ffb68c] border border-[#ffb68c]/30">
              v{project.version}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              className="p-1 rounded text-[#a38c80] hover:text-[#f0ede6] hover:bg-[#26252b] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <span className="material-symbols-outlined text-[17px]">undo</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1 rounded text-[#a38c80] hover:text-[#f0ede6] hover:bg-[#26252b] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <span className="material-symbols-outlined text-[17px]">redo</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#a38c80]">
            {saveStatus === 'saving' ? (
              <span className="text-[#f9ba78] flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f9ba78] animate-ping"></span>
                Saving...
              </span>
            ) : saveStatus === 'saved' ? (
              <span className="text-[#8ed5b4] flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8ed5b4]"></span>
                Saved
              </span>
            ) : (
              <span className="text-[#a38c80]">Unsaved changes</span>
            )}
          </span>
        </div>

        {/* Center: Device Presets & Resizer indicator */}
        <div className="flex items-center gap-1 bg-[#161618] p-0.5 rounded-lg border border-[#2e2d35]">
          <button
            onClick={() => setPreviewDevice('desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              previewDevice === 'desktop'
                ? 'bg-[#26252b] text-[#ffb68c] font-semibold border border-[#3a3942]'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
            title="Desktop view (1200px)"
          >
            <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setPreviewDevice('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              previewDevice === 'tablet'
                ? 'bg-[#26252b] text-[#ffb68c] font-semibold border border-[#3a3942]'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
            title="Tablet view (768px)"
          >
            <span className="material-symbols-outlined text-[15px]">tablet_mac</span>
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setPreviewDevice('mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              previewDevice === 'mobile'
                ? 'bg-[#26252b] text-[#ffb68c] font-semibold border border-[#3a3942]'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
            title="Mobile Android / iOS view (375px)"
          >
            <span className="material-symbols-outlined text-[15px]">smartphone</span>
            <span className="hidden sm:inline">Mobile</span>
          </button>
          <button
            onClick={() => setPreviewDevice('responsive')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              previewDevice === 'responsive'
                ? 'bg-[#26252b] text-[#ffb68c] font-semibold border border-[#3a3942]'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
            title="Fluid Resizable view"
          >
            <span className="material-symbols-outlined text-[15px]">drag_indicator</span>
            <span className="hidden sm:inline">{getFrameWidth()}px</span>
          </button>

          <div className="h-4 w-px bg-[#353437] mx-1"></div>

          {/* Visual Element Selection Toggle */}
          <button
            onClick={() => {
              setIsInspectMode(!isInspectMode);
              if (!isInspectMode) {
                showToast('Inspect mode: Click any element in preview to select it');
              }
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              isInspectMode
                ? 'bg-[#d97736] text-[#161618] font-semibold'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
            title="Inspect & Select Component"
          >
            <span className="material-symbols-outlined text-[15px]">ads_click</span>
            <span className="hidden md:inline">Inspect Element</span>
          </button>
        </div>

        {/* Right: Code/Preview Toggles, Asset Library, New from Image, Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              isEditorOpen
                ? 'bg-[#26252b] border-[#ffb68c]/50 text-[#ffb68c]'
                : 'bg-transparent border-[#2e2d35] text-[#a38c80] hover:text-[#f0ede6]'
            }`}
            title="Toggle Live Code Editor"
          >
            <span className="material-symbols-outlined text-[15px]">code</span>
            <span className="hidden md:inline">Code Editor</span>
          </button>

          <button
            onClick={() => setIsDesignControlsOpen(!isDesignControlsOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              isDesignControlsOpen
                ? 'bg-[#26252b] border-[#ffb68c]/50 text-[#ffb68c]'
                : 'bg-transparent border-[#2e2d35] text-[#a38c80] hover:text-[#f0ede6]'
            }`}
            title="Toggle Design Settings"
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span className="hidden md:inline">Design</span>
          </button>

          <button
            onClick={onOpenAssetModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-[#26252b] text-[#dbc1b4] hover:text-[#ffb68c] border border-[#2e2d35] transition-colors"
            title="Manage extracted and uploaded assets"
          >
            <span className="material-symbols-outlined text-[15px]">photo_library</span>
            <span className="hidden lg:inline">Assets</span>
          </button>

          <button
            onClick={onOpenImageToWebModal}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-[#242426] text-[#ffb68c] hover:bg-[#353437] border border-[#ffb68c]/40 transition-all shadow-sm"
            title="Convert an image or screenshot into a website with AI"
          >
            <span className="material-symbols-outlined text-[15px]">add_photo_alternate</span>
            <span>+ From Image</span>
          </button>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold bg-[#d97736] text-[#161618] hover:bg-[#e5a968] transition-all shadow-md"
            title="Export website as ZIP, HTML/CSS/JS, or GitHub repository"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* 2. Main Studio Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden relative">
        {/* Left / Bottom: Live Tri-Pane Code Editor */}
        {isEditorOpen && (
          <div className="w-full lg:w-96 xl:w-[440px] flex-shrink-0 bg-[#161618] border-r border-[#2e2d35] flex flex-col z-10 max-h-[45vh] lg:max-h-none">
            {/* Editor Tab Navigation */}
            <div className="flex items-center justify-between bg-[#1e1e22] border-b border-[#2e2d35] px-3 py-1.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditorTab('html')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    editorTab === 'html'
                      ? 'bg-[#26252b] text-[#ffb68c] font-semibold border-b-2 border-[#d97736]'
                      : 'text-[#a38c80] hover:text-[#f0ede6]'
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setEditorTab('css')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    editorTab === 'css'
                      ? 'bg-[#26252b] text-[#ffb68c] font-semibold border-b-2 border-[#d97736]'
                      : 'text-[#a38c80] hover:text-[#f0ede6]'
                  }`}
                >
                  CSS
                </button>
                <button
                  onClick={() => setEditorTab('js')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    editorTab === 'js'
                      ? 'bg-[#26252b] text-[#ffb68c] font-semibold border-b-2 border-[#d97736]'
                      : 'text-[#a38c80] hover:text-[#f0ede6]'
                  }`}
                >
                  JavaScript
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (editorTab === 'html') {
                      navigator.clipboard.writeText(htmlCode);
                    } else if (editorTab === 'css') {
                      navigator.clipboard.writeText(cssCode);
                    } else {
                      navigator.clipboard.writeText(jsCode);
                    }
                    showToast(`Copied ${editorTab.toUpperCase()} to clipboard`);
                  }}
                  className="p-1 text-[#a38c80] hover:text-[#ffb68c] rounded transition-colors"
                  title="Copy code"
                >
                  <span className="material-symbols-outlined text-[15px]">content_copy</span>
                </button>

                <button
                  onClick={() => {
                    pushHistory('Reset code to initial state');
                    setHtmlCode(project.html);
                    setCssCode(project.css);
                    setJsCode(project.js);
                    showToast('Code restored to initial project baseline');
                  }}
                  className="p-1 text-[#a38c80] hover:text-[#ffb4ab] rounded transition-colors"
                  title="Reset code"
                >
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                </button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="flex-1 p-3 overflow-auto flex flex-col font-mono text-xs">
              {editorTab === 'html' && (
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full flex-1 bg-[#131315] text-[#f0ede6] p-3 rounded border border-[#2e2d35] font-mono text-xs leading-relaxed resize-none focus:outline-none focus:border-[#d97736]"
                  spellCheck={false}
                  placeholder="Enter HTML5 code..."
                />
              )}
              {editorTab === 'css' && (
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="w-full flex-1 bg-[#131315] text-[#f0ede6] p-3 rounded border border-[#2e2d35] font-mono text-xs leading-relaxed resize-none focus:outline-none focus:border-[#d97736]"
                  spellCheck={false}
                  placeholder="Enter modern CSS code..."
                />
              )}
              {editorTab === 'js' && (
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="w-full flex-1 bg-[#131315] text-[#f0ede6] p-3 rounded border border-[#2e2d35] font-mono text-xs leading-relaxed resize-none focus:outline-none focus:border-[#d97736]"
                  spellCheck={false}
                  placeholder="Enter vanilla JavaScript code..."
                />
              )}
            </div>

            {/* Editor Footer Status */}
            <div className="bg-[#1e1e22] border-t border-[#2e2d35] px-3 py-1 flex items-center justify-between text-[11px] font-mono text-[#a38c80]">
              <span>Lines: {(editorTab === 'html' ? htmlCode : editorTab === 'css' ? cssCode : jsCode).split('\n').length}</span>
              <span className="text-[#8ed5b4]">UTF-8 • Valid Syntax</span>
            </div>
          </div>
        )}

        {/* Center: Sandboxed Live Preview Stage */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0e0e10] p-4 lg:p-6 overflow-auto items-center justify-start relative">
          {/* Active Element Inspector Float Toolbar */}
          {selectedSection && (
            <div className="w-full max-w-4xl mb-3 bg-[#1e1e22] border border-[#ffb68c] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xl animate-fade-in z-20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb68c] text-[18px]">select_all</span>
                <div>
                  <span className="font-mono text-xs text-[#ffb68c] font-bold">
                    &lt;{selectedSection.tag}&gt;
                  </span>
                  <span className="text-[11px] text-[#a38c80] ml-2 truncate max-w-xs inline-block">
                    {selectedSection.textContent || selectedSection.selector}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsSectionModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#d97736] text-[#161618] text-xs font-semibold hover:bg-[#e5a968] transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  <span>Regenerate with AI</span>
                </button>

                <button
                  onClick={() => handleMoveSection('up')}
                  className="p-1 rounded bg-[#26252b] text-[#a38c80] hover:text-[#f0ede6] border border-[#2e2d35]"
                  title="Move section up"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                </button>
                <button
                  onClick={() => handleMoveSection('down')}
                  className="p-1 rounded bg-[#26252b] text-[#a38c80] hover:text-[#f0ede6] border border-[#2e2d35]"
                  title="Move section down"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                </button>

                <button
                  onClick={handleDeleteSelectedSection}
                  className="p-1 rounded bg-[#26252b] text-[#ffb4ab] hover:bg-[#93000a]/50 border border-[#2e2d35]"
                  title="Delete element"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>

                <button
                  onClick={() => setSelectedSection(null)}
                  className="p-1 rounded text-[#a38c80] hover:text-[#f0ede6]"
                  title="Deselect"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>
          )}

          {/* Sandboxed Preview Frame Container */}
          <div
            className="transition-all duration-200 ease-out bg-[#131315] rounded-xl border border-[#2e2d35] shadow-2xl overflow-hidden flex flex-col h-[75vh] w-full"
            style={{
              maxWidth: `${getFrameWidth()}px`,
            }}
          >
            {/* Simulated Browser Bar */}
            <div className="bg-[#1e1e22] border-b border-[#2e2d35] px-3 py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#353437]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#353437]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#353437]"></span>
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-[#131315] px-3 py-0.5 rounded text-[11px] font-mono text-[#a38c80] text-center truncate border border-[#2e2d35]">
                https://preview.scholar-codex.internal/{project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
              </div>
              <div className="flex items-center gap-1 text-[#a38c80]">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                <span className="text-[10px] font-mono">Isolated Sandbox</span>
              </div>
            </div>

            {/* Iframe Viewport */}
            <iframe
              ref={iframeRef}
              title="Generated Website Live Preview"
              sandbox="allow-scripts allow-modals"
              className="w-full flex-1 border-0 bg-transparent"
            />
          </div>

          {/* Natural Language Prompt-Based Website Editing Bar */}
          <div className="w-full max-w-4xl mt-4">
            <form
              onSubmit={handleAiEditSubmit}
              className="bg-[#1e1e22] border border-[#2e2d35] rounded-xl p-2 flex items-center gap-2 shadow-lg focus-within:border-[#ffb68c] transition-colors"
            >
              <span className="material-symbols-outlined text-[#ffb68c] text-[20px] ml-2">
                auto_awesome
              </span>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask AI to modify website (e.g., 'Make navbar sticky and add a smooth dark gradient hero')..."
                className="flex-1 bg-transparent border-0 text-xs text-[#f0ede6] placeholder-[#a38c80] focus:outline-none"
                disabled={isAiProcessing}
              />
              <button
                type="submit"
                disabled={isAiProcessing || !aiPrompt.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#d97736] text-[#161618] text-xs font-semibold hover:bg-[#e5a968] disabled:opacity-40 transition-all"
              >
                {isAiProcessing ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-[#161618] border-t-transparent rounded-full animate-spin"></span>
                    <span>Modifying...</span>
                  </>
                ) : (
                  <>
                    <span>Apply Edit</span>
                    <span className="material-symbols-outlined text-[14px]">send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Visual Design Controls Drawer */}
        {isDesignControlsOpen && (
          <aside className="w-full lg:w-80 flex-shrink-0 bg-[#161618] border-l border-[#2e2d35] p-4 flex flex-col gap-4 overflow-y-auto max-h-[40vh] lg:max-h-none">
            <div className="flex items-center justify-between border-b border-[#2e2d35] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f0ede6]">
                <span className="material-symbols-outlined text-[#ffb68c] text-[16px]">palette</span>
                <span>Design Controls</span>
              </div>
              <button
                onClick={() => setIsAdvancedDesignOpen(!isAdvancedDesignOpen)}
                className="text-[11px] font-mono text-[#ffb68c] hover:underline"
              >
                {isAdvancedDesignOpen ? 'Basic Mode' : 'Advanced Mode'}
              </button>
            </div>

            {/* Colors Section */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-[#a38c80] uppercase tracking-wider">
                Palette & Colors
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-[#a38c80] mb-1">Primary Color</label>
                  <div className="flex items-center gap-2 bg-[#1e1e22] p-1 rounded border border-[#2e2d35]">
                    <input
                      type="color"
                      value={designSettings.primaryColor}
                      onChange={(e) =>
                        setDesignSettings({ ...designSettings, primaryColor: e.target.value })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[10px]">{designSettings.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#a38c80] mb-1">Background</label>
                  <div className="flex items-center gap-2 bg-[#1e1e22] p-1 rounded border border-[#2e2d35]">
                    <input
                      type="color"
                      value={designSettings.backgroundColor}
                      onChange={(e) =>
                        setDesignSettings({ ...designSettings, backgroundColor: e.target.value })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[10px]">{designSettings.backgroundColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#a38c80] mb-1">Surface Color</label>
                  <div className="flex items-center gap-2 bg-[#1e1e22] p-1 rounded border border-[#2e2d35]">
                    <input
                      type="color"
                      value={designSettings.surfaceColor}
                      onChange={(e) =>
                        setDesignSettings({ ...designSettings, surfaceColor: e.target.value })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[10px]">{designSettings.surfaceColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#a38c80] mb-1">Accent Color</label>
                  <div className="flex items-center gap-2 bg-[#1e1e22] p-1 rounded border border-[#2e2d35]">
                    <input
                      type="color"
                      value={designSettings.accentColor}
                      onChange={(e) =>
                        setDesignSettings({ ...designSettings, accentColor: e.target.value })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-[10px]">{designSettings.accentColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-3 pt-2 border-t border-[#2e2d35]">
              <span className="text-[11px] font-mono text-[#a38c80] uppercase tracking-wider">
                Typography
              </span>
              <div>
                <label className="block text-[11px] text-[#a38c80] mb-1">Font Family</label>
                <select
                  value={designSettings.fontFamily}
                  onChange={(e) =>
                    setDesignSettings({ ...designSettings, fontFamily: e.target.value })
                  }
                  className="w-full bg-[#1e1e22] text-[#f0ede6] text-xs p-2 rounded border border-[#2e2d35] focus:outline-none focus:border-[#ffb68c]"
                >
                  <option value="Be Vietnam Pro">Be Vietnam Pro (Humanist Sans)</option>
                  <option value="Literata">Literata (Archival Serif)</option>
                  <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
                  <option value="Inter">Inter (Modern Clean)</option>
                  <option value="Playfair Display">Playfair Display (Editorial)</option>
                  <option value="Roboto">Roboto (Standard)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#a38c80] mb-1">
                  <span>Base Font Size</span>
                  <span className="font-mono text-[#ffb68c]">{designSettings.baseFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="22"
                  value={designSettings.baseFontSize}
                  onChange={(e) =>
                    setDesignSettings({
                      ...designSettings,
                      baseFontSize: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#d97736]"
                />
              </div>
            </div>

            {/* Layout, Spacing & Borders */}
            <div className="space-y-3 pt-2 border-t border-[#2e2d35]">
              <span className="text-[11px] font-mono text-[#a38c80] uppercase tracking-wider">
                Shape & Layout
              </span>

              <div>
                <div className="flex justify-between text-[11px] text-[#a38c80] mb-1">
                  <span>Corner Radius</span>
                  <span className="font-mono text-[#ffb68c]">{designSettings.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={designSettings.borderRadius}
                  onChange={(e) =>
                    setDesignSettings({
                      ...designSettings,
                      borderRadius: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-[#d97736]"
                />
              </div>

              {isAdvancedDesignOpen && (
                <>
                  <div>
                    <div className="flex justify-between text-[11px] text-[#a38c80] mb-1">
                      <span>Max Container Width</span>
                      <span className="font-mono text-[#ffb68c]">{designSettings.containerMaxWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="800"
                      max="1440"
                      step="40"
                      value={designSettings.containerMaxWidth}
                      onChange={(e) =>
                        setDesignSettings({
                          ...designSettings,
                          containerMaxWidth: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-[#d97736]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-[#a38c80] mb-1">
                      <span>Grid Spacing Scale</span>
                      <span className="font-mono text-[#ffb68c]">{designSettings.spacingUnit}px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={designSettings.spacingUnit}
                      onChange={(e) =>
                        setDesignSettings({
                          ...designSettings,
                          spacingUnit: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-[#d97736]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-[#2e2d35]">
              <span className="text-[11px] font-mono text-[#a38c80] uppercase tracking-wider block mb-2">
                Curated Presets
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => {
                    pushHistory('Apply Obsidian Amber preset');
                    setDesignSettings({
                      ...designSettings,
                      primaryColor: '#ffb68c',
                      backgroundColor: '#131315',
                      surfaceColor: '#1e1e22',
                      textColor: '#f0ede6',
                      accentColor: '#8ed5b4',
                      borderRadius: 8,
                    });
                    showToast('Preset: Obsidian Amber');
                  }}
                  className="p-1.5 rounded bg-[#1e1e22] text-[#ffb68c] border border-[#2e2d35] hover:border-[#ffb68c] text-[11px]"
                >
                  Obsidian Amber
                </button>
                <button
                  onClick={() => {
                    pushHistory('Apply Parchment Light preset');
                    setDesignSettings({
                      ...designSettings,
                      primaryColor: '#d97736',
                      backgroundColor: '#f7f6f3',
                      surfaceColor: '#ffffff',
                      textColor: '#1a1917',
                      accentColor: '#4d9375',
                      borderRadius: 6,
                    });
                    showToast('Preset: Parchment Light');
                  }}
                  className="p-1.5 rounded bg-[#eae8e3] text-[#1a1917] border border-[#d5d2cb] hover:border-[#d97736] text-[11px]"
                >
                  Parchment Light
                </button>
                <button
                  onClick={() => {
                    pushHistory('Apply Midnight Indigo preset');
                    setDesignSettings({
                      ...designSettings,
                      primaryColor: '#6b8afd',
                      backgroundColor: '#0e111a',
                      surfaceColor: '#161b26',
                      textColor: '#eef2ff',
                      accentColor: '#a78bfa',
                      borderRadius: 12,
                    });
                    showToast('Preset: Midnight Indigo');
                  }}
                  className="p-1.5 rounded bg-[#161b26] text-[#6b8afd] border border-[#2e374d] hover:border-[#6b8afd] text-[11px]"
                >
                  Midnight Indigo
                </button>
                <button
                  onClick={() => {
                    pushHistory('Apply Emerald Scholar preset');
                    setDesignSettings({
                      ...designSettings,
                      primaryColor: '#8ed5b4',
                      backgroundColor: '#0c1612',
                      surfaceColor: '#14241e',
                      textColor: '#e6f7f0',
                      accentColor: '#f9ba78',
                      borderRadius: 8,
                    });
                    showToast('Preset: Emerald Scholar');
                  }}
                  className="p-1.5 rounded bg-[#14241e] text-[#8ed5b4] border border-[#1f382e] hover:border-[#8ed5b4] text-[11px]"
                >
                  Emerald Scholar
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 3. Section Regeneration Modal */}
      {isSectionModalOpen && selectedSection && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1b1b1d] border border-[#ffb68c] rounded-xl max-w-lg w-full p-5 shadow-2xl animate-fade-in flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#2e2d35] pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ffb68c]">auto_awesome</span>
                <h3 className="font-serif font-semibold text-sm">
                  Regenerate &lt;{selectedSection.tag}&gt; Section
                </h3>
              </div>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="text-[#a38c80] hover:text-[#f0ede6]"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#131315] p-2.5 rounded border border-[#2e2d35] font-mono text-[11px] text-[#a38c80] max-h-32 overflow-y-auto">
              {selectedSection.outerHtml.slice(0, 300)}...
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f0ede6] mb-1.5">
                Instruction for this component:
              </label>
              <textarea
                value={sectionPrompt}
                onChange={(e) => setSectionPrompt(e.target.value)}
                placeholder="e.g., 'Make this card modern with a gradient badge and glowing action button'..."
                className="w-full bg-[#131315] text-[#f0ede6] p-3 rounded border border-[#2e2d35] text-xs focus:outline-none focus:border-[#ffb68c] resize-none h-24"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e2d35]">
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs text-[#a38c80] hover:text-[#f0ede6]"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerateSectionSubmit}
                disabled={isRegeneratingSection || !sectionPrompt.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#d97736] text-[#161618] text-xs font-semibold hover:bg-[#e5a968] disabled:opacity-40"
              >
                {isRegeneratingSection ? (
                  <>
                    <span className="w-3 h-3 border-2 border-[#161618] border-t-transparent rounded-full animate-spin"></span>
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <span>Regenerate Component</span>
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
