import React from 'react';
import { Workbook } from '../types';

interface SidebarProps {
  workbooks: Workbook[];
  currentWorkbookId: string;
  onSelectWorkbook: (id: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onNewNotebook: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workbooks,
  currentWorkbookId,
  onSelectWorkbook,
  isOpenMobile,
  onCloseMobile,
  onNewNotebook,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#1b1b1d] z-50 flex flex-col py-6 px-4 border-r border-[#2a2a2c]/60 transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d97736] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[#532200] text-[18px]">
                terminal
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-base text-[#ffb68c] font-bold tracking-tight">
                PROMPT WARS
              </span>
              <span className="font-label-sm text-[11px] text-[#dbc1b4]/70">
                DESK ARCHIVE v4.2
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-[#dbc1b4] hover:text-[#e4e2e4]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Section Label */}
        <div className="px-2 mb-2 flex items-center justify-between">
          <span className="font-label-sm text-[11px] text-[#a38c80] uppercase tracking-wider">
            Curated Codices
          </span>
          <button
            onClick={onNewNotebook}
            className="text-[#a38c80] hover:text-[#ffb68c] transition-colors p-1"
            title="Create New Codex"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          {workbooks.map((wb) => {
            const isActive = currentWorkbookId === wb.id || currentWorkbookId === wb.slug;
            return (
              <button
                key={wb.id}
                onClick={() => {
                  onSelectWorkbook(wb.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-[#2a2a2c] text-[#ffb68c] font-semibold shadow-sm'
                    : 'text-[#dbc1b4] hover:bg-[#1f1f21] hover:text-[#e4e2e4]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-[#f9ba78]">
                    {wb.icon}
                  </span>
                  <span className="font-body-md text-sm truncate">{wb.name}</span>
                </div>
                {wb.mastery > 0 && (
                  <span className="font-label-sm text-[10px] text-[#8ed5b4] ml-2 shrink-0">
                    {wb.mastery}%
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status indicator bottom */}
        <div className="pt-4 mt-auto border-t border-[#2a2a2c]/60 flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 bg-[#1f1f21] rounded-lg border border-[#2a2a2c]/40">
            <span className="font-label-sm text-[11px] text-[#a38c80]">STATUS</span>
            <span className="inline-flex items-center gap-1.5 font-label-sm text-[11px] text-[#8ed5b4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8ed5b4] animate-pulse"></span>
              Online
            </span>
          </div>
          <div className="text-[10px] text-[#a38c80]/60 text-center font-label-sm">
            Grounded in Gemini 3.8 Flash
          </div>
        </div>
      </aside>
    </>
  );
};
