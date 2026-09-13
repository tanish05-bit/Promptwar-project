import React, { useState } from 'react';
import { Workbook } from '../types';

interface TopNavProps {
  workbooks: Workbook[];
  currentWorkbookId: string;
  onSelectWorkbook: (id: string) => void;
  onNewNotebook: () => void;
  onToggleSidebar: () => void;
  onOpenUserProfile?: () => void;
  onOpenLiveTranscriber?: () => void;
  isMobile: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  workbooks,
  currentWorkbookId,
  onSelectWorkbook,
  onNewNotebook,
  onToggleSidebar,
  onOpenUserProfile,
  onOpenLiveTranscriber,
  isMobile,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const activeWorkbook =
    workbooks.find((w) => w.id === currentWorkbookId || w.slug === currentWorkbookId) ||
    workbooks[0];

  const handleExport = (format: 'pdf' | 'markdown' | 'json') => {
    setExportOpen(false);
    window.location.href = `/api/export/${format}?workbookId=${activeWorkbook?.id || 'epistemology-ai'}`;
    setDownloadSuccess(`Exported as ${format.toUpperCase()}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#131315]/90 backdrop-blur-xl z-40 border-b border-[#2a2a2c]/60 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger or Notebook Tabs */}
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[#dbc1b4] hover:text-[#e4e2e4] hover:bg-[#1f1f21] transition-colors shrink-0"
          aria-label="Toggle navigation drawer"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Mobile current notebook badge */}
        <div className="lg:hidden flex items-center gap-1.5 bg-[#2a2a2c] px-2.5 py-1 rounded-md border border-[#554339]/30 shrink-0 truncate max-w-[200px]">
          <span className="material-symbols-outlined text-[#f9ba78] text-[15px] shrink-0">
            {activeWorkbook?.icon || 'neurology'}
          </span>
          <span className="font-label-sm text-[12px] text-[#f9ba78] truncate font-medium">
            {activeWorkbook?.name || 'Epistemology & AI'}
          </span>
        </div>

        {/* Desktop Notebook Tabs */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {workbooks.slice(0, 4).map((wb) => {
            const isActive = currentWorkbookId === wb.id || currentWorkbookId === wb.slug;
            return (
              <button
                key={wb.id}
                onClick={() => onSelectWorkbook(wb.id)}
                className={`px-3.5 py-1.5 rounded-lg font-title-md text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#2a2a2c] text-[#ffb68c] shadow-sm font-semibold'
                    : 'text-[#dbc1b4] hover:bg-[#1f1f21] hover:text-[#e4e2e4]'
                }`}
              >
                {wb.name}
              </button>
            );
          })}
          <button
            onClick={onNewNotebook}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1b1b1d] text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#1f1f21] transition-colors shrink-0 text-xs font-label-md ml-1"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>New Notebook</span>
          </button>
        </div>
      </div>

      {/* Right Tools & Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Gemini Sync Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1b1b1d] rounded-lg border border-[#2a2a2c]/40 text-[#8ed5b4]">
          <span className="material-symbols-outlined text-[16px]">cloud_done</span>
          <span className="hidden sm:inline font-label-sm text-[11px] text-[#dbc1b4]">
            Scribe v4.2 Gemini Synced
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8ed5b4] animate-pulse"></span>
        </div>

        {/* Notification Toast */}
        {downloadSuccess && (
          <div className="fixed top-18 right-6 bg-[#2a2a2c] border border-[#8ed5b4] text-[#8ed5b4] px-3 py-1.5 rounded text-xs font-label-sm shadow-xl z-50 animate-fade-in">
            ✓ {downloadSuccess}
          </div>
        )}

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f21] rounded-lg text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors border border-[#2a2a2c]/60 text-xs font-label-md"
            aria-label="Export notebook or research dossier"
          >
            <span className="material-symbols-outlined text-[16px] text-[#ffb68c]">
              file_download
            </span>
            <span className="hidden sm:inline">Export</span>
            <span className="material-symbols-outlined text-[14px] text-[#a38c80]">
              expand_more
            </span>
          </button>

          {exportOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2c] border border-[#554339]/40 rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-label-sm text-[#a38c80] border-b border-[#353437]">
                Export Research Dossier
              </div>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-3 py-2 text-xs font-label-md text-[#e4e2e4] hover:bg-[#353437] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[15px] text-[#ffb68c]">
                  description
                </span>
                <span>PDF Dossier (.txt)</span>
              </button>
              <button
                onClick={() => handleExport('markdown')}
                className="w-full text-left px-3 py-2 text-xs font-label-md text-[#e4e2e4] hover:bg-[#353437] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[15px] text-[#8ed5b4]">
                  article
                </span>
                <span>Markdown Source (.md)</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-2 text-xs font-label-md text-[#e4e2e4] hover:bg-[#353437] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[15px] text-[#f9ba78]">
                  code
                </span>
                <span>Canvas JSON Archive</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              if (onOpenUserProfile) {
                onOpenUserProfile();
              } else {
                setProfileOpen(!profileOpen);
              }
            }}
            className="w-8 h-8 rounded-full bg-[#ffb68c] flex items-center justify-center cursor-pointer shadow-inner hover:ring-2 hover:ring-[#d97736] transition-all"
            aria-label="User profile settings"
          >
            <span className="material-symbols-outlined text-[#532200] text-[18px]">person</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#2a2a2c] border border-[#554339]/40 rounded-lg shadow-2xl p-3 z-50">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#353437]">
                <div className="w-8 h-8 rounded-full bg-[#ffb68c] flex items-center justify-center text-[#532200] font-bold text-xs">
                  PV
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#e4e2e4] truncate">
                    Prof. Vance Research Lab
                  </span>
                  <span className="text-[10px] text-[#a38c80] truncate font-label-sm">
                    Physioanu06@gmail.com
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-xs text-[#dbc1b4]">
                <div className="flex justify-between py-1 font-label-sm text-[11px]">
                  <span>Active Retention</span>
                  <span className="text-[#8ed5b4] font-bold">94.2%</span>
                </div>
                <div className="flex justify-between py-1 font-label-sm text-[11px]">
                  <span>Grounding Model</span>
                  <span className="text-[#ffb68c]">Gemini 3.8 Flash</span>
                </div>
                <div className="flex justify-between py-1 font-label-sm text-[11px]">
                  <span>Spaced Interval</span>
                  <span>SuperMemo-2</span>
                </div>
                {onOpenUserProfile && (
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onOpenUserProfile();
                    }}
                    className="w-full mt-2 py-1.5 px-2 rounded bg-[#353437] hover:bg-[#ffb68c] hover:text-[#532200] text-xs font-label-md text-[#ffb68c] text-center transition-colors"
                  >
                    Open Profile & Key Routing
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
