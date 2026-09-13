import React, { useState, useEffect } from 'react';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  isFirebaseConfigured,
  syncProjectToFirebase,
  FirebaseClientConfig,
} from '../services/firebase';
import { WebsiteProject } from '../types';

interface CloudAndAISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject?: WebsiteProject | null;
}

export const CloudAndAISettingsModal: React.FC<CloudAndAISettingsModalProps> = ({
  isOpen,
  onClose,
  activeProject,
}) => {
  const [activeTab, setActiveTab] = useState<'gemini' | 'firebase'>('gemini');

  // Gemini State
  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<any>(null);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestFeedback, setGeminiTestFeedback] = useState<string | null>(null);

  // Firebase State
  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseClientConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load Firebase Config
    const storedCfg = getFirebaseConfig();
    if (storedCfg) {
      setFirebaseConfigState(storedCfg);
      setIsFirebaseConnected(Boolean(storedCfg.apiKey && storedCfg.projectId));
    } else {
      setIsFirebaseConnected(false);
    }

    // Load Gemini Status from server
    fetchGeminiStatus();
  }, [isOpen]);

  const fetchGeminiStatus = async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setGeminiStatus(data);
      }
    } catch (err) {
      console.warn('Could not fetch Gemini status', err);
    }
  };

  const handleSaveGeminiKey = async () => {
    if (!geminiKey.trim()) return;
    setIsTestingGemini(true);
    setGeminiTestFeedback(null);
    try {
      const res = await fetch('/api/ai/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: geminiKey.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeminiTestFeedback('Gemini API key updated & verified successfully!');
        setGeminiKey('');
        fetchGeminiStatus();
      } else {
        setGeminiTestFeedback(data.error || 'Failed to update Gemini key');
      }
    } catch (err: any) {
      setGeminiTestFeedback(`Error connecting to server: ${err.message}`);
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleTestGeminiConnection = async () => {
    setIsTestingGemini(true);
    setGeminiTestFeedback(null);
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Scholar Codex verification ping' }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeminiTestFeedback(`Connected! Active model: ${data.model || 'gemini-2.5-flash'}`);
      } else {
        setGeminiTestFeedback(data.error || 'Connection failed');
      }
    } catch (err: any) {
      setGeminiTestFeedback(`Network test failed: ${err.message}`);
    } finally {
      setIsTestingGemini(false);
    }
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      setSyncStatus('API Key and Project ID are required.');
      return;
    }
    saveFirebaseConfig(firebaseConfig);
    setIsFirebaseConnected(true);
    setSyncStatus('Firebase configuration saved successfully!');
    setTimeout(() => setSyncStatus(null), 3500);
  };

  const handleClearFirebase = () => {
    clearFirebaseConfig();
    setFirebaseConfigState({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    });
    setIsFirebaseConnected(false);
    setSyncStatus('Firebase credentials cleared.');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleSyncToFirestore = async () => {
    if (!activeProject) {
      setSyncStatus('No active website project selected to sync.');
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const result = await syncProjectToFirebase(activeProject);
      setSyncStatus(result.message);
    } catch (err: any) {
      setSyncStatus(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#1b1b1d] border border-[#353437] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2c] bg-[#131315]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb68c] text-[24px]">tune</span>
            <div>
              <h2 className="text-base font-semibold text-[#e4e2e4] font-headline-md tracking-wide">
                Cloud &amp; AI Engine Settings
              </h2>
              <p className="text-xs text-[#a38c80] font-label-sm">
                Configure Google Gemini models and Firebase Cloud infrastructure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2a2a2c] bg-[#171719] px-6">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`flex items-center gap-2 py-3 px-4 font-label-sm text-xs border-b-2 transition-colors ${
              activeTab === 'gemini'
                ? 'border-[#ffb68c] text-[#ffb68c] font-semibold'
                : 'border-transparent text-[#a38c80] hover:text-[#e4e2e4]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">neurology</span>
            <span>Google Gemini API</span>
            {geminiStatus?.totalKeys > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#8ed5b4]"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`flex items-center gap-2 py-3 px-4 font-label-sm text-xs border-b-2 transition-colors ${
              activeTab === 'firebase'
                ? 'border-[#ffb68c] text-[#ffb68c] font-semibold'
                : 'border-transparent text-[#a38c80] hover:text-[#e4e2e4]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">cloud</span>
            <span>Firebase Cloud Suite</span>
            {isFirebaseConnected && (
              <span className="w-2 h-2 rounded-full bg-[#8ed5b4]"></span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: GEMINI */}
          {activeTab === 'gemini' && (
            <div className="space-y-5">
              {/* Status Banner */}
              <div className="p-4 rounded-lg bg-[#131315] border border-[#2a2a2c] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#ffb68c]/10 border border-[#ffb68c]/30 flex items-center justify-center text-[#ffb68c]">
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#e4e2e4]">
                      Gemini Multimodal Engine
                    </h3>
                    <p className="text-xs text-[#a38c80]">
                      Active Model: <span className="text-[#ffb68c] font-mono">gemini-2.5-flash</span>
                      {' '}· Audio: <span className="text-[#8ed5b4] font-mono">gemini-3.5-transcribe</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-label-sm font-medium border ${
                      geminiStatus?.totalKeys > 0
                        ? geminiStatus?.activeKeyLabel?.includes('Demo')
                          ? 'bg-[#f9ba78]/10 text-[#f9ba78] border-[#f9ba78]/30'
                          : 'bg-[#8ed5b4]/10 text-[#8ed5b4] border-[#8ed5b4]/30'
                        : 'bg-[#a38c80]/10 text-[#a38c80] border-[#353437]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {geminiStatus?.totalKeys > 0
                      ? geminiStatus?.activeKeyLabel?.includes('Demo')
                        ? 'Free Demo Key Active'
                        : 'Personal Key Connected'
                      : 'No Key — Fallback Mode'}
                  </span>
                </div>
              </div>

              {/* Free Demo Mode Banner */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#8ed5b4]/5 to-[#ffb68c]/5 border border-[#8ed5b4]/20">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#8ed5b4] text-[20px] mt-0.5">auto_awesome</span>
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-[#8ed5b4] mb-1">Free Demo Mode Available</h4>
                    <p className="text-[11px] text-[#a38c80] leading-relaxed">
                      The app works out-of-the-box using a shared free demo key pool with rate-limited AI features.
                      For <strong className="text-[#e4e2e4]">full speed, image-to-website generation, and voice transcription</strong>, add your own free personal API key below.
                    </p>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-[11px] text-[#ffb68c] hover:text-[#ffa570] underline"
                    >
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      Get your free Gemini API key (takes 30 seconds)
                    </a>
                  </div>
                </div>
              </div>

              {/* Key Input Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#e4e2e4] uppercase tracking-wider font-label-sm">
                  Your Personal Gemini API Key
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="Paste your key from AI Studio (AIzaSy...)"
                      className="w-full px-3.5 py-2.5 bg-[#131315] border border-[#353437] rounded-lg text-sm text-[#e4e2e4] placeholder-[#554339] font-mono focus:outline-none focus:border-[#ffb68c] transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-2.5 text-[#a38c80] hover:text-[#e4e2e4]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showGeminiKey ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={handleSaveGeminiKey}
                    disabled={isTestingGemini || !geminiKey.trim()}
                    className="px-4 py-2.5 bg-[#ffb68c] text-[#532200] rounded-lg font-label-sm text-xs font-bold hover:bg-[#ffa570] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Activate Key</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#a38c80]">
                  Keys are hot-reloaded without a server restart and never stored in plaintext.
                </p>
              </div>

              {/* Live Test & Failover Status */}
              <div className="p-4 bg-[#131315] rounded-lg border border-[#2a2a2c] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#e4e2e4]">Diagnostics &amp; Verification</h4>
                  <p className="text-[11px] text-[#a38c80]">
                    Verify multimodal vision, live audio transcription, and dialectic prompting response.
                  </p>
                  {geminiStatus && (
                    <p className="text-[11px] text-[#a38c80] mt-1">
                      Active key: <span className="text-[#ffb68c] font-mono">{geminiStatus.activeKeyLabel || 'None'}</span>
                      {geminiStatus.totalKeys > 0 && <span> · {geminiStatus.totalKeys} key(s) loaded · Failovers: {geminiStatus.quotaFailoverCount}</span>}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleTestGeminiConnection}
                  disabled={isTestingGemini}
                  className="px-3 py-1.5 bg-[#2a2a2c] hover:bg-[#353437] text-[#e4e2e4] rounded-lg text-xs font-label-sm border border-[#353437] transition-colors flex items-center gap-1.5"
                >
                  <span className={`material-symbols-outlined text-[15px] text-[#8ed5b4] ${isTestingGemini ? 'animate-spin' : ''}`}>
                    {isTestingGemini ? 'sync' : 'network_check'}
                  </span>
                  <span>{isTestingGemini ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>

              {geminiTestFeedback && (
                <div className={`p-3 rounded-lg text-xs font-label-sm flex items-center gap-2 border ${
                  geminiTestFeedback.includes('Connected') || geminiTestFeedback.includes('verified')
                    ? 'bg-[#8ed5b4]/10 text-[#8ed5b4] border-[#8ed5b4]/30'
                    : 'bg-[#ffb68c]/10 text-[#ffb68c] border-[#ffb68c]/30'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {geminiTestFeedback.includes('Connected') || geminiTestFeedback.includes('verified') ? 'check_circle' : 'info'}
                  </span>
                  <span>{geminiTestFeedback}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FIREBASE */}
          {activeTab === 'firebase' && (
            <div className="space-y-5">
              {/* Firebase Status */}
              <div className="p-4 rounded-lg bg-[#131315] border border-[#2a2a2c] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#f9ba78]/10 border border-[#f9ba78]/30 flex items-center justify-center text-[#f9ba78]">
                    <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#e4e2e4]">
                      Firebase Cloud Firestore &amp; Hosting
                    </h3>
                    <p className="text-xs text-[#a38c80]">
                      {isFirebaseConnected
                        ? `Connected to project: ${firebaseConfig.projectId}`
                        : 'Local caching active — configure Firebase for live cloud synchronization'}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-label-sm font-medium border ${
                    isFirebaseConnected
                      ? 'bg-[#8ed5b4]/10 text-[#8ed5b4] border-[#8ed5b4]/30'
                      : 'bg-[#a38c80]/10 text-[#a38c80] border-[#353437]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {isFirebaseConnected ? 'Firestore Ready' : 'Local Archive'}
                </span>
              </div>

              {/* Firestore Project Sync Trigger */}
              {activeProject && (
                <div className="p-4 bg-[#131315] border border-[#2a2a2c] rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-[#e4e2e4]">
                      Sync Active Project: "{activeProject.title}"
                    </h4>
                    <p className="text-[11px] text-[#a38c80]">
                      Push HTML, CSS, JS, and design settings to the Cloud Firestore database.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncToFirestore}
                    disabled={isSyncing}
                    className="px-3.5 py-2 bg-[#d97736] text-[#532200] font-bold rounded-lg text-xs font-label-sm hover:bg-[#ffa570] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isSyncing ? 'sync' : 'cloud_upload'}
                    </span>
                    <span>{isSyncing ? 'Syncing...' : 'Sync to Firestore'}</span>
                  </button>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleSaveFirebase} className="space-y-3">
                <h4 className="text-xs font-semibold text-[#e4e2e4] uppercase tracking-wider font-label-sm">
                  Firebase Web App Configuration
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#a38c80] mb-1">Project ID</label>
                    <input
                      type="text"
                      value={firebaseConfig.projectId}
                      onChange={(e) =>
                        setFirebaseConfigState({ ...firebaseConfig, projectId: e.target.value })
                      }
                      placeholder="e.g. scholar-codex-studio"
                      className="w-full px-3 py-2 bg-[#131315] border border-[#353437] rounded-lg text-xs text-[#e4e2e4] font-mono focus:outline-none focus:border-[#ffb68c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#a38c80] mb-1">API Key</label>
                    <input
                      type="password"
                      value={firebaseConfig.apiKey}
                      onChange={(e) =>
                        setFirebaseConfigState({ ...firebaseConfig, apiKey: e.target.value })
                      }
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 bg-[#131315] border border-[#353437] rounded-lg text-xs text-[#e4e2e4] font-mono focus:outline-none focus:border-[#ffb68c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#a38c80] mb-1">Auth Domain (Optional)</label>
                    <input
                      type="text"
                      value={firebaseConfig.authDomain}
                      onChange={(e) =>
                        setFirebaseConfigState({ ...firebaseConfig, authDomain: e.target.value })
                      }
                      placeholder="project.firebaseapp.com"
                      className="w-full px-3 py-2 bg-[#131315] border border-[#353437] rounded-lg text-xs text-[#e4e2e4] font-mono focus:outline-none focus:border-[#ffb68c]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#a38c80] mb-1">App ID (Optional)</label>
                    <input
                      type="text"
                      value={firebaseConfig.appId}
                      onChange={(e) =>
                        setFirebaseConfigState({ ...firebaseConfig, appId: e.target.value })
                      }
                      placeholder="1:123456789:web:abcdef"
                      className="w-full px-3 py-2 bg-[#131315] border border-[#353437] rounded-lg text-xs text-[#e4e2e4] font-mono focus:outline-none focus:border-[#ffb68c]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleClearFirebase}
                    className="text-xs text-[#ffb4ab] hover:underline"
                  >
                    Clear Credentials
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#ffb68c] text-[#532200] font-bold rounded-lg text-xs font-label-sm hover:bg-[#ffa570] transition-colors"
                  >
                    Save Firebase Config
                  </button>
                </div>
              </form>

              {/* Firebase Hosting 1-Click Deployment Guide */}
              <div className="p-4 bg-[#131315] rounded-lg border border-[#2a2a2c] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8ed5b4]">
                  <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                  <span>1-Click Firebase Hosting Deployment</span>
                </div>
                <p className="text-[11px] text-[#a38c80] leading-relaxed">
                  To deploy this application or your exported websites directly to Firebase Hosting, run:
                </p>
                <div className="p-2.5 bg-[#171719] rounded border border-[#353437] font-mono text-[11px] text-[#ffb68c] flex items-center justify-between">
                  <code>npx -y firebase-tools@latest deploy --only hosting</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('npx -y firebase-tools@latest deploy --only hosting');
                      setSyncStatus('Deployment command copied to clipboard!');
                      setTimeout(() => setSyncStatus(null), 2500);
                    }}
                    className="text-xs text-[#a38c80] hover:text-[#e4e2e4] ml-2"
                    title="Copy command"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                  </button>
                </div>
              </div>

              {syncStatus && (
                <div className="p-3 bg-[#131315] border border-[#ffb68c]/30 rounded-lg text-xs font-label-sm text-[#ffb68c] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>{syncStatus}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
