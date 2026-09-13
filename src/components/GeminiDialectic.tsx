import React, { useState, useRef, useEffect } from 'react';
import { GeminiMessage } from '../types';

interface GeminiDialecticProps {
  messages: GeminiMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onOpenExcerpt: (citationText: string) => void;
  groundedSourceCount: number;
}

export const GeminiDialectic: React.FC<GeminiDialecticProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onOpenExcerpt,
  groundedSourceCount,
}) => {
  const [inputText, setInputText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickPrompt = (promptText: string) => {
    onSendMessage(promptText);
  };

  return (
    <section className="bg-[#1b1b1d] rounded-xl p-4 shadow-lg border border-[#2a2a2c]/60 flex flex-col transition-all">
      {/* Companion Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2c]/50 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#d97736]/20 flex items-center justify-center text-[#ffb68c] shrink-0">
            <span className="material-symbols-outlined text-[17px]">neurology</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-headline-md text-sm text-[#e4e2e4] font-semibold leading-tight truncate">
              Gemini Dialectic
            </h3>
            <p className="font-label-sm text-[10px] text-[#8ed5b4] truncate">
              Grounded in {groundedSourceCount} Active Workspace Sources
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 flex items-center justify-center rounded text-[#a38c80] hover:text-[#e4e2e4] hover:bg-[#2a2a2c] transition-colors"
          title={isCollapsed ? 'Expand Dialectic' : 'Collapse Dialectic'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isCollapsed ? 'unfold_more' : 'unfold_less'}
          </span>
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Quick Flow-Directing Prompt Actions */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() =>
                handleQuickPrompt(
                  "Explain Hume's problem of induction and how it applies to neural reward policies."
                )
              }
              className="px-2.5 py-1 rounded-full bg-[#1f1f21] text-[#dbc1b4] hover:text-[#ffb68c] hover:bg-[#2a2a2c] font-label-sm text-[11px] transition-colors flex items-center gap-1 border border-[#2a2a2c]/60"
            >
              <span className="material-symbols-outlined text-[12px] text-[#ffb68c]">
                psychology_alt
              </span>
              <span>Explain Hume's Induction</span>
            </button>

            <button
              onClick={() =>
                handleQuickPrompt(
                  'Conduct a rigorous Socratic test on the Turkey Paradox applied to prompt validation.'
                )
              }
              className="px-2.5 py-1 rounded-full bg-[#1f1f21] text-[#dbc1b4] hover:text-[#f9ba78] hover:bg-[#2a2a2c] font-label-sm text-[11px] transition-colors flex items-center gap-1 border border-[#2a2a2c]/60"
            >
              <span className="material-symbols-outlined text-[12px] text-[#f9ba78]">quiz</span>
              <span>Test Me on This Card</span>
            </button>

            <button
              onClick={() =>
                handleQuickPrompt(
                  'Synthesize the next conceptual vulnerability from Russell Problems of Philosophy Ch 6.'
                )
              }
              className="px-2.5 py-1 rounded-full bg-[#1f1f21] text-[#dbc1b4] hover:text-[#8ed5b4] hover:bg-[#2a2a2c] font-label-sm text-[11px] transition-colors flex items-center gap-1 border border-[#2a2a2c]/60"
            >
              <span className="material-symbols-outlined text-[12px] text-[#8ed5b4]">
                library_add
              </span>
              <span>Extract Next Concept</span>
            </button>
          </div>

          {/* Dialectic Chat Messages Area */}
          <div
            ref={chatScrollRef}
            className="space-y-2.5 mb-3 max-h-64 overflow-y-auto pr-1 no-scrollbar"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg border ${
                  msg.role === 'user'
                    ? 'bg-[#1f1f21] border-[#353437] ml-4'
                    : 'bg-[#1f1f21]/90 border-[#ffb68c]/20 mr-2'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-label-sm text-[10px] font-semibold flex items-center gap-1 uppercase tracking-wider ${
                      msg.role === 'user' ? 'text-[#f9ba78]' : 'text-[#ffb68c]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        msg.role === 'user' ? 'bg-[#f9ba78]' : 'bg-[#ffb68c]'
                      }`}
                    ></span>
                    {msg.role === 'user' ? 'Scholar Inquiry' : 'Gemini Synthesis'}
                  </span>
                  <span className="font-label-sm text-[10px] text-[#a38c80]">
                    {msg.timestamp}
                  </span>
                </div>

                <p className="font-body-md text-xs text-[#e4e2e4] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Grounding Source Callout */}
                {msg.sourceRef && (
                  <div className="mt-2 pt-2 border-t border-[#2a2a2c]/60 flex items-center justify-between text-[11px] font-label-sm text-[#dbc1b4]">
                    <span className="flex items-center gap-1 truncate text-[#8ed5b4]">
                      <span className="material-symbols-outlined text-[13px] text-[#ffb68c]">
                        link
                      </span>
                      <span className="truncate">{msg.sourceRef}</span>
                    </span>
                    <button
                      onClick={() => onOpenExcerpt(msg.sourceRef || '')}
                      className="text-[#ffb68c] hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Open Excerpt
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="p-3 bg-[#1f1f21] rounded-lg border border-[#ffb68c]/30 flex items-center gap-2 text-xs text-[#dbc1b4]">
                <span className="material-symbols-outlined text-[16px] text-[#ffb68c] animate-spin">
                  refresh
                </span>
                <span className="font-label-sm">
                  Interrogating grounded codex and Humean epistemology...
                </span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Gemini about this note or attached sources..."
              className="w-full pl-3 pr-10 py-2 bg-[#1f1f21] rounded-lg font-body-md text-xs text-[#e4e2e4] placeholder:text-[#a38c80] focus:outline-none focus:ring-1 focus:ring-[#ffb68c] border border-[#2a2a2c]/60 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="absolute right-1.5 top-1.5 w-7 h-7 flex items-center justify-center rounded bg-[#d97736] text-[#532200] hover:bg-[#f9ba78] transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
              title="Send Dialectic Query"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            </button>
          </form>

          {/* Active Synthesizer Latency Footer */}
          <div className="mt-3 pt-2 border-t border-[#2a2a2c]/40 flex items-center justify-between text-[11px] font-label-sm">
            <div className="flex items-center gap-1.5 text-[#dbc1b4]">
              <span className="material-symbols-outlined text-[#8ed5b4] text-[16px]">
                model_training
              </span>
              <span>
                Active Synthesizer:{' '}
                <strong className="text-[#e4e2e4]">Gemini 3.8 Flash</strong>
              </span>
            </div>
            <span className="text-[#a38c80]">Latency: 240ms</span>
          </div>
        </>
      )}
    </section>
  );
};
