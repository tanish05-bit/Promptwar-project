import React, { useState, useEffect } from 'react';
import {
  Workbook,
  Note,
  StudyCard,
  SourceMedia,
  GeminiMessage,
  ViewLayoutMode,
  ScholarPreferences,
  WebsiteProject,
  AppWorkspaceMode,
} from './types';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { WorkspaceRibbon } from './components/WorkspaceRibbon';
import { ManuscriptDesk } from './components/ManuscriptDesk';
import { StudyCardDeck } from './components/StudyCardDeck';
import { GeminiDialectic } from './components/GeminiDialectic';
import { AudioRecordModal } from './components/AudioRecordModal';
import { LiveAudioTranscriberModal } from './components/LiveAudioTranscriberModal';
import { AIPromptNoteModal } from './components/AIPromptNoteModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SourceViewerModal } from './components/SourceViewerModal';
import { NewWorkbookModal } from './components/NewWorkbookModal';
import { MobileView } from './components/MobileView';
import { WebsiteStudio } from './components/WebsiteStudio';
import { ImageToWebModal } from './components/ImageToWebModal';
import { ExportProjectModal } from './components/ExportProjectModal';
import { AssetManagerModal } from './components/AssetManagerModal';
import { CloudAndAISettingsModal } from './components/CloudAndAISettingsModal';
import { DraggableStickyNote, StickyNoteItem } from './components/DraggableStickyNote';

export default function App() {
  // State management
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [currentWorkbookId, setCurrentWorkbookId] = useState<string>('epistemology-ai');
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string>('note-hume-rlhf');
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [sources, setSources] = useState<SourceMedia[]>([]);

  // Draggable Sticky Notes State
  const [stickyNotes, setStickyNotes] = useState<StickyNoteItem[]>([
    {
      id: 'sticky-1',
      title: 'Epistemic Axiom',
      text: 'Induction cannot establish necessity: past repetition ≠ future law.',
      x: 140,
      y: 190,
      color: 'gold',
      isMinimized: false,
    },
  ]);

  const handleAddStickyNote = () => {
    const newId = `sticky-${Date.now()}`;
    const colors: Array<StickyNoteItem['color']> = ['gold', 'amber', 'emerald', 'rose', 'indigo'];
    const nextColor = colors[stickyNotes.length % colors.length];
    setStickyNotes((prev) => [
      ...prev,
      {
        id: newId,
        title: `Sticky Note #${prev.length + 1}`,
        text: '',
        x: Math.min(window.innerWidth - 300, 220 + (prev.length * 25) % 250),
        y: Math.min(window.innerHeight - 300, 180 + (prev.length * 25) % 200),
        color: nextColor,
        isMinimized: false,
      },
    ]);
    showToast('Draggable sticky note added');
  };
  const [geminiMessages, setGeminiMessages] = useState<GeminiMessage[]>([]);
  const [preferences, setPreferences] = useState<ScholarPreferences>({
    theme: 'dark',
    activeViewMode: 'arranged',
    studyDeckVisible: true,
    geminiCompanionExpanded: true,
    fontSize: 'normal',
    highYieldOnly: false,
  });

  // Website Studio State
  const [workspaceMode, setWorkspaceMode] = useState<AppWorkspaceMode>('desk');
  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj-codex-hub');

  // UI Modals State
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isLiveTranscriberOpen, setIsLiveTranscriberOpen] = useState(false);
  const [isAIPromptModalOpen, setIsAIPromptModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [selectedSourceForView, setSelectedSourceForView] = useState<SourceMedia | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isSourceAddMode, setIsSourceAddMode] = useState(false);
  const [isNewWorkbookModalOpen, setIsNewWorkbookModalOpen] = useState(false);
  const [isImageToWebModalOpen, setIsImageToWebModalOpen] = useState(false);
  const [isExportProjectModalOpen, setIsExportProjectModalOpen] = useState(false);
  const [isAssetManagerModalOpen, setIsAssetManagerModalOpen] = useState(false);
  const [isCloudSettingsOpen, setIsCloudSettingsOpen] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [isGeminiChatLoading, setIsGeminiChatLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);


  // Responsive window listener
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial data loading from Backend API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [wbRes, notesRes, cardsRes, sourcesRes, chatRes, prefRes, projRes] = await Promise.all([
          fetch('/api/workbooks').then((r) => r.json()),
          fetch('/api/notes').then((r) => r.json()),
          fetch('/api/cards').then((r) => r.json()),
          fetch('/api/sources').then((r) => r.json()),
          fetch('/api/chat').then((r) => r.json()),
          fetch('/api/preferences').then((r) => r.json()),
          fetch('/api/projects').then((r) => r.json()),
        ]);

        if (Array.isArray(wbRes)) setWorkbooks(wbRes);
        if (Array.isArray(notesRes)) {
          setNotes(notesRes);
          if (notesRes.length > 0) setCurrentNoteId(notesRes[0].id);
        }
        if (Array.isArray(cardsRes)) setCards(cardsRes);
        if (Array.isArray(sourcesRes)) setSources(sourcesRes);
        if (Array.isArray(chatRes)) setGeminiMessages(chatRes);
        if (prefRes && prefRes.theme) setPreferences(prefRes);
        if (Array.isArray(projRes) && projRes.length > 0) {
          setProjects(projRes);
          setActiveProjectId(projRes[0].id);
        }
      } catch (err) {
        console.error('Failed fetching data from server, using local fallback:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Filter or select items
  const activeWorkbook =
    workbooks.find((w) => w.id === currentWorkbookId || w.slug === currentWorkbookId) ||
    workbooks[0];

  const activeNote = notes.find((n) => n.id === currentNoteId) || notes[0];

  const activeProject =
    projects.find((p) => p.id === activeProjectId || p.workbookId === currentWorkbookId) ||
    projects[0];

  // Handlers
  const handleSelectWorkbook = async (id: string) => {
    setCurrentWorkbookId(id);
    try {
      const [notesRes, cardsRes, sourcesRes, projRes] = await Promise.all([
        fetch(`/api/notes?workbookId=${id}`).then((r) => r.json()),
        fetch(`/api/cards?workbookId=${id}`).then((r) => r.json()),
        fetch(`/api/sources?workbookId=${id}`).then((r) => r.json()),
        fetch(`/api/projects?workbookId=${id}`).then((r) => r.json()),
      ]);
      if (Array.isArray(notesRes) && notesRes.length > 0) {
        setNotes(notesRes);
        setCurrentNoteId(notesRes[0].id);
      }
      if (Array.isArray(cardsRes)) {
        setCards(cardsRes);
        setActiveCardIndex(0);
      }
      if (Array.isArray(sourcesRes)) setSources(sourcesRes);
      if (Array.isArray(projRes) && projRes.length > 0) {
        setProjects(projRes);
        setActiveProjectId(projRes[0].id);
      }
      showToast(`Switched to Codex: ${workbooks.find((w) => w.id === id)?.name || id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateActiveProject = async (updates: Partial<WebsiteProject>) => {
    if (!activeProject) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject.id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );

    try {
      await fetch(`/api/projects/${activeProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleWebsiteCreated = (newProject: WebsiteProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setWorkspaceMode('website-studio');
    showToast(`Loaded "${newProject.title}" in Website Studio`);
  };


  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    // Optimistic update
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, ...updates, updatedAt: 'Just now' } : n))
    );

    try {
      await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      showToast('Manuscript auto-saved');
    } catch (e) {
      console.error(e);
    }
  };

  const handleNoteCreated = (newNote: Note) => {
    setNotes((prev) => [newNote, ...prev]);
    setCurrentNoteId(newNote.id);
    showToast(`Saved note: "${newNote.title}"`);
    // Update workbook note count
    setWorkbooks((prev) =>
      prev.map((w) =>
        w.id === newNote.workbookId ? { ...w, noteCount: (w.noteCount || 0) + 1 } : w
      )
    );
  };

  const handleReviewCard = async (cardId: string, rating: 'hard' | 'good' | 'mastered') => {
    // Optimistic update
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              conceptBadge: rating === 'mastered' ? 'MASTERED' : rating === 'good' ? 'IN REVIEW' : 'RETEST',
              masteryScore: rating === 'mastered' ? 95 : rating === 'good' ? 75 : 40,
            }
          : c
      )
    );

    try {
      const res = await fetch(`/api/cards/${cardId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();
      if (data) {
        showToast(`Card scheduled for ${data.intervalDays} day interval`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePinCard = async (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const isPinned = !card.isPinned;
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isPinned } : c)));
    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned }),
      });
      showToast(isPinned ? 'Card pinned to desk' : 'Card unpinned');
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateCardFromSelection = async (selectionText: string) => {
    setIsGeneratingCard(true);
    showToast('Synthesizing study card with Gemini...');
    try {
      const res = await fetch('/api/gemini/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textSelection: selectionText,
          noteTitle: activeNote?.title || 'Manuscript',
          workbookId: activeWorkbook?.id || 'epistemology-ai',
          noteId: activeNote?.id,
        }),
      });
      const newCard = await res.json();
      if (newCard && newCard.id) {
        setCards((prev) => [newCard, ...prev]);
        setActiveCardIndex(0);
        showToast(`Created Activity Card #${newCard.cardNumber}: ${newCard.title}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Card generation failed');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleSendGeminiMessage = async (messageText: string) => {
    setIsGeminiChatLoading(true);

    const userTempMsg: GeminiMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: 'Just now',
    };
    setGeminiMessages((prev) => [...prev, userTempMsg]);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          noteContext: activeNote ? `${activeNote.title}\n\n${activeNote.content}` : '',
          workbookId: activeWorkbook?.id || 'epistemology-ai',
        }),
      });
      const data = await res.json();
      if (data && data.modelMsg) {
        setGeminiMessages((prev) => [...prev.filter((m) => m.id !== userTempMsg.id), data.userMsg, data.modelMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeminiChatLoading(false);
    }
  };

  const handleSaveVoiceRecord = async (recData: {
    filename: string;
    duration: string;
    durationSeconds: number;
    transcript: string;
  }) => {
    if (!activeNote) return;
    try {
      const res = await fetch(`/api/notes/${activeNote.id}/voice-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recData),
      });
      const savedVN = await res.json();

      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNote.id
            ? { ...n, voiceNotes: [savedVN, ...(n.voiceNotes || [])] }
            : n
        )
      );

      // Also create an attached source entry for it
      const newSrc: Omit<SourceMedia, 'id'> = {
        workbookId: activeWorkbook?.id || 'epistemology-ai',
        name: recData.filename,
        type: 'audio',
        icon: 'graphic_eq',
        metadataTag: `Indexed (${recData.duration})`,
        size: '1.8 MB',
        uploadDate: 'Today',
        excerpt: recData.transcript,
        details: 'Recorded directly at desk during seminar session.',
      };
      handleAddNewSource(newSrc);
      showToast('Voice memo attached to note and indexed');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewSource = async (sourceData: Omit<SourceMedia, 'id'>) => {
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceData),
      });
      const newSource = await res.json();
      if (newSource && newSource.id) {
        setSources((prev) => [newSource, ...prev]);
        showToast(`Attached source: ${newSource.name}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      setSources((prev) => prev.filter((s) => s.id !== id));
      showToast('Source detached from codex');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateWorkbook = async (wbData: {
    name: string;
    icon: string;
    description: string;
  }) => {
    try {
      const res = await fetch('/api/workbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wbData),
      });
      const newWb = await res.json();
      if (newWb && newWb.id) {
        setWorkbooks((prev) => [...prev, newWb]);
        handleSelectWorkbook(newWb.id);
        showToast(`Codex "${newWb.name}" initialized`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Average mastery calculation
  const masteryRate =
    cards.length > 0
      ? Math.round(
          cards.reduce((acc, c) => acc + (c.masteryScore || 60), 0) / cards.length
        )
      : 83;

  return (
    <div className="min-h-screen bg-[#131315] text-[#e4e2e4] flex flex-col font-body-md selection:bg-[#ffb68c] selection:text-[#532200]">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2a2a2c] text-[#ffb68c] px-4 py-2 rounded-lg border border-[#ffb68c]/50 shadow-2xl font-label-md text-xs flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop or Mobile Switcher */}
      {isMobile ? (
        <>
          <MobileView
            note={
              activeNote || {
                id: 'default',
                workbookId: 'epistemology-ai',
                title: 'Inductive Gaps in Reward Modeling',
                chapter: 'CODEX CHAPTER 03',
                chapterNumber: '§ 03.4',
                content: '',
                updatedAt: '14 mins ago',
              }
            }
            cards={cards}
            sources={sources}
            activeCardIndex={activeCardIndex}
            onSelectCardIndex={setActiveCardIndex}
            onReviewCard={handleReviewCard}
            onRecordVoiceMemo={() => setIsAudioModalOpen(true)}
            onAttachMedia={() => {
              setIsSourceAddMode(true);
              setIsSourceModalOpen(true);
            }}
            onOpenSourceDetails={(src) => {
              setSelectedSourceForView(src);
              setIsSourceAddMode(false);
              setIsSourceModalOpen(true);
            }}
            geminiMessages={geminiMessages}
            onSendMessage={handleSendGeminiMessage}
            isGeneratingCard={isGeneratingCard}
            onOpenSidebar={() => setIsSidebarOpenMobile(true)}
            onExport={() => {
              window.location.href = `/api/export/pdf?workbookId=${currentWorkbookId}`;
            }}
            onOpenLiveTranscriber={() => setIsLiveTranscriberOpen(true)}
            onOpenAIPromptNote={() => setIsAIPromptModalOpen(true)}
            onOpenImageToWeb={() => setIsImageToWebModalOpen(true)}
            onOpenCloudSettings={() => setIsCloudSettingsOpen(true)}
          />

          <Sidebar
            workbooks={workbooks}
            currentWorkbookId={currentWorkbookId}
            onSelectWorkbook={handleSelectWorkbook}
            isOpenMobile={isSidebarOpenMobile}
            onCloseMobile={() => setIsSidebarOpenMobile(false)}
            onNewNotebook={() => {
              setIsSidebarOpenMobile(false);
              setIsNewWorkbookModalOpen(true);
            }}
          />
        </>
      ) : (
        /* Full Desktop Experience */
        <div className="flex w-full min-h-screen">
          {/* Left Navigation Sidebar */}
          <Sidebar
            workbooks={workbooks}
            currentWorkbookId={currentWorkbookId}
            onSelectWorkbook={handleSelectWorkbook}
            isOpenMobile={isSidebarOpenMobile}
            onCloseMobile={() => setIsSidebarOpenMobile(false)}
            onNewNotebook={() => setIsNewWorkbookModalOpen(true)}
          />

          {/* Main Worktable Space */}
          <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
            {/* Top Workspace Header */}
            <TopNav
              workbooks={workbooks}
              currentWorkbookId={currentWorkbookId}
              onSelectWorkbook={handleSelectWorkbook}
              onNewNotebook={() => setIsNewWorkbookModalOpen(true)}
              onToggleSidebar={() => setIsSidebarOpenMobile(true)}
              onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
              onOpenLiveTranscriber={() => setIsLiveTranscriberOpen(true)}
              isMobile={isMobile}
            />

            {/* Worktable Content */}
            <main className="flex-1 mt-16 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto">
              {/* Workspace Sub-bar & Synthesis Pipeline Ribbon */}
              <WorkspaceRibbon
                breadcrumb={`${activeWorkbook?.name || 'Epistemology & AI'}-094`}
                viewMode={preferences.activeViewMode}
                onChangeViewMode={(mode) => setPreferences({ ...preferences, activeViewMode: mode })}
                workspaceMode={workspaceMode}
                onChangeWorkspaceMode={(mode) => setWorkspaceMode(mode)}
                onOpenImageToWeb={() => setIsImageToWebModalOpen(true)}
                sources={sources}
                onOpenAddSource={() => {
                  setIsSourceAddMode(true);
                  setIsSourceModalOpen(true);
                }}
                masteryRate={masteryRate}
                onRecordMemo={() => setIsAudioModalOpen(true)}
                onOpenAIPromptNote={() => setIsAIPromptModalOpen(true)}
                onOpenLiveTranscriber={() => setIsLiveTranscriberOpen(true)}
                onOpenCloudSettings={() => setIsCloudSettingsOpen(true)}
                onAddStickyNote={handleAddStickyNote}
              />

              {/* Toggle: Website Studio vs Manuscript Desk */}
              {workspaceMode === 'website-studio' && activeProject ? (
                <WebsiteStudio
                  project={activeProject}
                  workbookId={currentWorkbookId}
                  onUpdateProject={handleUpdateActiveProject}
                  onOpenImageToWebModal={() => setIsImageToWebModalOpen(true)}
                  onOpenExportModal={() => setIsExportProjectModalOpen(true)}
                  onOpenAssetModal={() => setIsAssetManagerModalOpen(true)}
                  onSwitchToDesk={() => setWorkspaceMode('desk')}
                  showToast={showToast}
                />
              ) : (
                /* Primary Dual-Desk Grid Layout: 7 Columns Manuscript, 5 Columns Study & AI */
                <div
                  className={`grid gap-6 ${
                    preferences.activeViewMode === 'folio'
                      ? 'grid-cols-1 max-w-4xl mx-auto'
                      : 'grid-cols-1 lg:grid-cols-12'
                  }`}
                >
                  {/* Left Column (Manuscript & Scribe Worktable) */}
                  <div
                    className={
                      preferences.activeViewMode === 'folio'
                        ? 'w-full'
                        : 'lg:col-span-7 flex flex-col'
                    }
                  >
                    {activeNote ? (
                      <ManuscriptDesk
                        note={activeNote}
                        sources={sources}
                        onUpdateNote={handleUpdateNote}
                        onGenerateCardFromSelection={handleGenerateCardFromSelection}
                        onAskGeminiPrompt={handleSendGeminiMessage}
                        onSelectCitation={(citId) => {
                          const src = sources.find((s) => s.id === citId) || sources[0];
                          setSelectedSourceForView(src);
                          setIsSourceAddMode(false);
                          setIsSourceModalOpen(true);
                        }}
                        onOpenSourceDetails={(src) => {
                          setSelectedSourceForView(src);
                          setIsSourceAddMode(false);
                          setIsSourceModalOpen(true);
                        }}
                        onAttachMedia={() => {
                          setIsSourceAddMode(true);
                          setIsSourceModalOpen(true);
                        }}
                        isGeneratingCard={isGeneratingCard}
                        onNoteCreated={handleNoteCreated}
                        onAddStickyNote={handleAddStickyNote}
                      />
                    ) : (
                      <div className="p-8 bg-[#1b1b1d] rounded-xl text-center text-[#dbc1b4]">
                        Loading Manuscript...
                      </div>
                    )}
                  </div>

                  {/* Right Column (Study Card Deck & Gemini Companion) */}
                  {preferences.activeViewMode !== 'folio' && (
                    <div className="lg:col-span-5 flex flex-col gap-6">
                      {/* Activity Study Card Deck */}
                      <StudyCardDeck
                        cards={cards}
                        activeCardIndex={activeCardIndex}
                        onSelectCardIndex={setActiveCardIndex}
                        onReviewCard={handleReviewCard}
                        onTogglePinCard={handleTogglePinCard}
                        onAddNewCardModal={() =>
                          handleGenerateCardFromSelection(
                            activeNote?.content.slice(0, 180) || 'Humean problem of induction'
                          )
                        }
                      />

                      {/* Gemini Dialectic Companion */}
                      <GeminiDialectic
                        messages={geminiMessages}
                        onSendMessage={handleSendGeminiMessage}
                        isLoading={isGeminiChatLoading}
                        onOpenExcerpt={(refText) => {
                          const src = sources.find((s) => s.name.includes('Russell') || s.name.includes('Tape')) || sources[0];
                          setSelectedSourceForView(src);
                          setIsSourceAddMode(false);
                          setIsSourceModalOpen(true);
                        }}
                        groundedSourceCount={sources.length}
                      />
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AudioRecordModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onSaveRecord={handleSaveVoiceRecord}
      />

      <SourceViewerModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        source={selectedSourceForView}
        isAddMode={isSourceAddMode}
        onDeleteSource={handleDeleteSource}
        onAddNewSource={handleAddNewSource}
      />

      <NewWorkbookModal
        isOpen={isNewWorkbookModalOpen}
        onClose={() => setIsNewWorkbookModalOpen(false)}
        onCreate={handleCreateWorkbook}
      />

      {/* Image-to-Website Conversion Modal */}
      <ImageToWebModal
        isOpen={isImageToWebModalOpen}
        onClose={() => setIsImageToWebModalOpen(false)}
        workbookId={currentWorkbookId}
        onWebsiteCreated={handleWebsiteCreated}
        showToast={showToast}
      />

      {/* Export Project Modal */}
      {activeProject && (
        <ExportProjectModal
          isOpen={isExportProjectModalOpen}
          onClose={() => setIsExportProjectModalOpen(false)}
          project={activeProject}
          showToast={showToast}
        />
      )}

      {/* Asset Manager Modal */}
      <AssetManagerModal
        isOpen={isAssetManagerModalOpen}
        onClose={() => setIsAssetManagerModalOpen(false)}
        projectHtml={activeProject?.html || ''}
        onUpdateHtml={(newHtml) => handleUpdateActiveProject({ html: newHtml })}
        showToast={showToast}
      />

      {/* Live Audio Feed Transcriber Powered by Gemini */}
      <LiveAudioTranscriberModal
        isOpen={isLiveTranscriberOpen}

        onClose={() => setIsLiveTranscriberOpen(false)}
        currentWorkbookId={currentWorkbookId}
        onNoteCreated={handleNoteCreated}
        onAttachVoiceNote={(data) => handleSaveVoiceRecord(data)}
      />

      {/* AI Prompt Synthesizer & Note Generator */}
      <AIPromptNoteModal
        isOpen={isAIPromptModalOpen}
        onClose={() => setIsAIPromptModalOpen(false)}
        workbooks={workbooks}
        currentWorkbookId={currentWorkbookId}
        onNoteCreated={handleNoteCreated}
      />

      {/* User Profile & Key Routing Control */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
      />

      {/* Cloud & AI Engine Configuration (Gemini API & Firebase) */}
      <CloudAndAISettingsModal
        isOpen={isCloudSettingsOpen}
        onClose={() => setIsCloudSettingsOpen(false)}
        activeProject={activeProject}
      />

      {/* Draggable Sticky Notes Workspace Overlay */}
      {stickyNotes.map((sn) => (
        <DraggableStickyNote
          key={sn.id}
          note={sn}
          onUpdate={(id, updates) =>
            setStickyNotes((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
          }
          onDelete={(id) => setStickyNotes((prev) => prev.filter((item) => item.id !== id))}
        />
      ))}
    </div>
  );
}
