import React from 'react';
import { ViewLayoutMode, SourceMedia, AppWorkspaceMode } from '../types';

interface WorkspaceRibbonProps {
  breadcrumb: string;
  viewMode: ViewLayoutMode;
  onChangeViewMode: (mode: ViewLayoutMode) => void;
  workspaceMode?: AppWorkspaceMode;
  onChangeWorkspaceMode?: (mode: AppWorkspaceMode) => void;
  onOpenImageToWeb?: () => void;
  sources: SourceMedia[];
  onOpenAddSource: () => void;
  masteryRate: number;
  onRecordMemo: () => void;
  onOpenAIPromptNote?: () => void;
  onOpenLiveTranscriber?: () => void;
  onOpenCloudSettings?: () => void;
  isRecording?: boolean;
  onAddStickyNote?: () => void;
}

export const WorkspaceRibbon: React.FC<WorkspaceRibbonProps> = ({
  breadcrumb,
  viewMode,
  onChangeViewMode,
  workspaceMode = 'desk',
  onChangeWorkspaceMode,
  onOpenImageToWeb,
  sources,
  onOpenAddSource,
  masteryRate,
  onRecordMemo,
  onOpenAIPromptNote,
  onOpenLiveTranscriber,
  onOpenCloudSettings,
  isRecording,
  onAddStickyNote,
}) => {
  return (
    <div className="w-full bg-[#1b1b1d] rounded-xl px-4 py-3 mb-4 shadow-md border border-[#2a2a2c]/50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Workspace Mode Switcher & Breadcrumb */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Primary Desk vs Website Studio Switcher */}
          {onChangeWorkspaceMode && (
            <div className="flex items-center bg-[#141416] p-0.5 rounded-lg border border-[#353437]">
              <button
                onClick={() => onChangeWorkspaceMode('desk')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  workspaceMode === 'desk'
                    ? 'bg-[#2a2a2c] text-[#ffb68c] font-semibold shadow-sm border border-[#ffb68c]/30'
                    : 'text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
                title="Manuscript Note-taking & Study Desk"
              >
                <span className="material-symbols-outlined text-[15px]">edit_note</span>
                <span>Manuscript Desk</span>
              </button>
              <button
                onClick={() => onChangeWorkspaceMode('website-studio')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  workspaceMode === 'website-studio'
                    ? 'bg-[#2a2a2c] text-[#ffb68c] font-semibold shadow-sm border border-[#ffb68c]/30'
                    : 'text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
                title="AI Image-to-Website Live Studio"
              >
                <span className="material-symbols-outlined text-[15px] text-[#ffb68c]">
                  web
                </span>
                <span>AI Website Studio</span>
                <span className="text-[9px] bg-[#d97736] text-[#161618] px-1 py-0.2 rounded font-bold uppercase">
                  Studio
                </span>
              </button>
            </div>
          )}

          <div className="hidden sm:block h-4 w-px bg-[#353437]"></div>

          <div className="flex items-center gap-1.5 text-xs font-label-sm">
            <span className="text-[#a38c80] tracking-wider">CODEX</span>
            <span className="text-[#554339]">/</span>
            <span className="text-[#ffb68c] font-medium tracking-tight uppercase">
              {breadcrumb}
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-[#353437]"></div>

          {/* View Modes for Desk */}
          {workspaceMode === 'desk' && (
            <div className="flex items-center bg-[#1f1f21] p-0.5 rounded-lg border border-[#2a2a2c]/60">
              <button
                onClick={() => onChangeViewMode('arranged')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-label-sm text-xs transition-all ${
                  viewMode === 'arranged'
                    ? 'bg-[#2a2a2c] text-[#ffb68c] shadow-sm font-semibold'
                    : 'text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">table_restaurant</span>
                <span>Arranged Desk</span>
              </button>
              <button
                onClick={() => onChangeViewMode('folio')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-label-sm text-xs transition-all ${
                  viewMode === 'folio'
                    ? 'bg-[#2a2a2c] text-[#ffb68c] shadow-sm font-semibold'
                    : 'text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                <span>Freeform Folio</span>
              </button>
              <button
                onClick={() => onChangeViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-label-sm text-xs transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#2a2a2c] text-[#ffb68c] shadow-sm font-semibold'
                    : 'text-[#a38c80] hover:text-[#e4e2e4]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">grid_4x4</span>
                <span>Grid Snap</span>
              </button>
            </div>
          )}
        </div>


        {/* Right: Sources, Progress Ring, Voice Memo Trigger */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Grounded Sources Pill */}
          <div className="flex items-center gap-1.5 bg-[#1f1f21] px-2.5 py-1 rounded-lg border border-[#2a2a2c]/50">
            <span className="material-symbols-outlined text-[#ffb68c] text-[16px]">
              attachment
            </span>
            <span className="font-label-sm text-xs text-[#e4e2e4] font-medium">
              {sources.length} Grounded Sources
            </span>
            <button
              onClick={onOpenAddSource}
              className="ml-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2a2a2c] text-[#dbc1b4] hover:text-[#ffb68c] hover:bg-[#353437] transition-colors text-[10px] font-label-sm"
              title="Add research PDF or audio clip"
            >
              <span className="material-symbols-outlined text-[12px]">upload_file</span>
              <span>+ Add File</span>
            </button>
          </div>

          {/* Mastery Ring Gauge */}
          <div className="flex items-center gap-2 bg-[#1f1f21] px-2.5 py-1 rounded-lg border border-[#2a2a2c]/50">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#353437]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                ></path>
                <path
                  className="text-[#8ed5b4]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${masteryRate}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                ></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[9px] text-[#a38c80] leading-tight uppercase">
                Mastery
              </span>
              <span className="font-label-sm text-xs text-[#8ed5b4] font-bold leading-tight">
                {masteryRate}%
              </span>
            </div>
          </div>

          {/* Live Audio Feed Transcriber */}
          {onOpenLiveTranscriber && (
            <button
              onClick={onOpenLiveTranscriber}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-md bg-[#242426] text-[#ffb68c] hover:bg-[#353437] border border-[#ffb68c]/30 transition-all shadow-sm"
              title="Stream live audio feed and transcribe in real-time with Gemini"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffb68c]">
                graphic_eq
              </span>
              <span>Live Audio Feed</span>
            </button>
          )}

          {/* AI Prompt Synthesizer Note Button */}
          {onOpenAIPromptNote && (
            <button
              onClick={onOpenAIPromptNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-md bg-[#d97736] hover:bg-[#f9ba78] text-[#532200] font-semibold transition-all shadow-sm"
              title="Generate AI-powered text note from prompt"
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>+ AI Note</span>
            </button>
          )}

          {/* Draggable Sticky Note Trigger */}
          {onAddStickyNote && (
            <button
              onClick={onAddStickyNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-md bg-[#242426] text-[#ffb68c] hover:bg-[#353437] border border-[#ffb68c]/30 transition-all shadow-sm"
              title="Add a draggable sticky note onto your workspace"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffb68c]">sticky_note_2</span>
              <span>+ Sticky Note</span>
            </button>
          )}

          {/* Quick Image-to-Website Trigger */}
          {onOpenImageToWeb && (
            <button
              onClick={onOpenImageToWeb}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-md bg-[#242426] text-[#ffb68c] hover:bg-[#353437] border border-[#ffb68c]/30 transition-all shadow-sm"
              title="Convert an image or screenshot into a functional website with AI"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffb68c]">
                add_photo_alternate
              </span>
              <span>+ Image to Website</span>
            </button>
          )}

          {/* Cloud & AI Engine Configuration Button */}
          {onOpenCloudSettings && (
            <button
              onClick={onOpenCloudSettings}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-md bg-[#242426] text-[#ffb68c] hover:bg-[#353437] border border-[#ffb68c]/30 transition-all shadow-sm"
              title="Configure Google Gemini and Firebase Cloud Services"
            >
              <span className="material-symbols-outlined text-[16px] text-[#ffb68c]">tune</span>
              <span>Cloud &amp; AI</span>
            </button>
          )}

          {/* Voice Memo Button */}
          <button
            onClick={onRecordMemo}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label-md transition-all shadow-sm ${
              isRecording
                ? 'bg-[#93000a] text-[#ffdad6] animate-pulse'
                : 'bg-[#2a2a2c] text-[#e4e2e4] hover:text-[#ffb68c] hover:bg-[#353437]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#ffb4ab]">mic</span>
            <span>{isRecording ? 'Recording...' : 'Record Memo'}</span>
          </button>
        </div>
      </div>

      {/* The 4-Step Synthesis Pipeline Tracker */}
      <div className="mt-3 pt-2 border-t border-[#2a2a2c]/40 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="flex items-center gap-1.5 bg-[#1f1f21] px-2.5 py-1.5 rounded border border-[#2a2a2c]/30">
          <span className="w-4 h-4 rounded-full bg-[#8ed5b4]/20 text-[#8ed5b4] flex items-center justify-center font-label-sm text-[10px] font-bold">
            1
          </span>
          <span className="font-label-sm text-[11px] text-[#8ed5b4] font-medium truncate">
            Attach Material
          </span>
          <span className="material-symbols-outlined text-[#8ed5b4] text-[14px] ml-auto shrink-0">
            check_circle
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1f1f21] px-2.5 py-1.5 rounded border border-[#2a2a2c]/30">
          <span className="w-4 h-4 rounded-full bg-[#8ed5b4]/20 text-[#8ed5b4] flex items-center justify-center font-label-sm text-[10px] font-bold">
            2
          </span>
          <span className="font-label-sm text-[11px] text-[#8ed5b4] font-medium truncate">
            AI Understands
          </span>
          <span className="material-symbols-outlined text-[#8ed5b4] text-[14px] ml-auto shrink-0">
            check_circle
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#2a2a2c] px-2.5 py-1.5 rounded border border-[#ffb68c]/30 shadow-sm">
          <span className="w-4 h-4 rounded-full bg-[#d97736] text-[#532200] flex items-center justify-center font-label-sm text-[10px] font-bold">
            3
          </span>
          <span className="font-label-sm text-[11px] text-[#ffb68c] font-semibold truncate">
            Activity Study Card
          </span>
          <span className="material-symbols-outlined text-[#ffb68c] text-[14px] ml-auto shrink-0">
            bolt
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1f1f21]/60 px-2.5 py-1.5 rounded border border-[#2a2a2c]/20">
          <span className="w-4 h-4 rounded-full bg-[#353437] text-[#a38c80] flex items-center justify-center font-label-sm text-[10px]">
            4
          </span>
          <span className="font-label-sm text-[11px] text-[#a38c80] truncate">
            Student Active Study
          </span>
          <span className="material-symbols-outlined text-[#a38c80] text-[14px] ml-auto shrink-0">
            timelapse
          </span>
        </div>
      </div>
    </div>
  );
};
