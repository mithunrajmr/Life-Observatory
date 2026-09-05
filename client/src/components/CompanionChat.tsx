import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Sparkles, Loader2, Lock } from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';

interface CompanionChatProps {
  initialPrompt?: string;
}

function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-[#1D2421]">
          {inner}
        </strong>
      );
    }
    return part;
  });
}

const RenderedMessageContent: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <p className="whitespace-pre-wrap leading-relaxed text-[13.5px] text-[#FFFFFF]">{content}</p>;
  }

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="my-2 space-y-1.5 pl-1">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-[13.5px] text-[#343F38] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#355C4A] shrink-0 mt-2" />
              <div className="flex-1">{renderInlineFormatting(item)}</div>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const headerMatch = trimmed.match(/^(?:#{1,4}\s*(?:\d+\.\s*)?|(?:\d+\.\s+))(.+)$/);
    if (headerMatch && (trimmed.startsWith('#') || /^\d+\.\s+[A-Z]/.test(trimmed))) {
      flushList();
      const title = headerMatch[1].replace(/\*\*/g, '').trim();
      blocks.push(
        <div key={`h-${lineIdx}`} className="pt-3 pb-1 first:pt-0">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#355C4A] font-semibold block">
            {title}
          </span>
        </div>
      );
      return;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemContent = trimmed.substring(2).trim();
      currentList.push(itemContent);
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${lineIdx}`} className="text-[13.5px] text-[#343F38] leading-relaxed my-1.5">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{blocks}</div>;
};

export const CompanionChat: React.FC<CompanionChatProps> = ({ initialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await api.getChatHistory();
      if (res.messages && res.messages.length > 0) {
        const deduplicated: ChatMessage[] = [];
        for (let i = 0; i < res.messages.length; i++) {
          const m = res.messages[i];
          const prev = deduplicated[deduplicated.length - 1];
          if (prev && prev.role === m.role && prev.content === m.content) {
            continue;
          }
          deduplicated.push(m);
        }
        setMessages(deduplicated);
      } else {
        setMessages([
          {
            id: 'welcome_1',
            role: 'model',
            content: "Hello Alex. I am holding in mind the arc of your reflections across June through September 2026 — including your 35-day learning streak, the July sprint crunch, and the recovery pattern you established in August.\n\nWhat is currently on your mind as you look at your trajectory today?",
            timestamp: new Date().toISOString(),
            mode: 'companion',
          },
        ]);
      }
    } catch {
      // Fallback
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendMessage(userText);
      setMessages(prev => [...prev, res.reply]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          content: 'I could not process that thought right now. Please take a quiet moment and try again.',
          timestamp: new Date().toISOString(),
          mode: 'companion',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSuggestion = (text: string) => {
    setInput(text);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full mb-12">
      {/* Editorial Page Header */}
      <div className="border-b border-[#DDE2DD] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-[#355C4A]" />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#355C4A]">
            Longitudinal Thinking Partner
          </span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl text-[#1D2421] font-normal leading-tight">
          Reflective Dialogue
        </h1>
        <p className="text-[13.5px] text-[#66706B] font-light max-w-xl mt-1.5 leading-relaxed">
          A calm conversation that remembers your past months, recognizes recurring drift patterns, and helps you notice subtle compounding progress.
        </p>
      </div>

      {/* Active Longitudinal Memory Grounding Substrate */}
      <div className="rounded-[20px] bg-[#FAF9F5] border border-[#DDE2DD] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#355C4A] font-semibold">
              Longitudinal Memory Grounding
            </span>
            <span className="h-px w-6 bg-[#DDE2DD]" />
            <span className="text-[11px] text-[#8A938E] font-mono">
              Jun 13 – Sep 5, 2026
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#355C4A] font-mono">
            <Lock size={12} />
            <span>Client-Isolated Memory</span>
          </div>
        </div>

        <div className="divide-y sm:divide-y-0 sm:divide-x divide-[#DDE2DD] grid grid-cols-1 sm:grid-cols-3 text-xs pt-2 border-t border-[#DDE2DD]/70">
          <div className="py-2 sm:py-0 sm:pr-4">
            <span className="font-mono text-[9.5px] text-[#8A938E] uppercase block mb-0.5">Active Anchor</span>
            <p className="font-medium text-[#1D2421]">35-Day Learning Habit</p>
            <p className="text-[11.5px] text-[#66706B] mt-0.5 font-light">Morning craft practice holding steady</p>
          </div>
          <div className="py-2 sm:py-0 sm:px-4">
            <span className="font-mono text-[9.5px] text-[#8A938E] uppercase block mb-0.5">Known Inflection</span>
            <p className="font-medium text-[#1D2421]">July Sprint Compromise</p>
            <p className="text-[11.5px] text-[#66706B] mt-0.5 font-light">Friend isolation trade-off identified</p>
          </div>
          <div className="py-2 sm:py-0 sm:pl-4">
            <span className="font-mono text-[9.5px] text-[#8A938E] uppercase block mb-0.5">Current Recovery</span>
            <p className="font-medium text-[#1D2421]">Social Balance Renewal</p>
            <p className="text-[11.5px] text-[#66706B] mt-0.5 font-light">Sunday gatherings returning</p>
          </div>
        </div>
      </div>

      {/* Main Dialogue Sanctuary */}
      <div className="rounded-[22px] bg-[#FFFFFF] border border-[#DDE2DD] shadow-xs flex flex-col min-h-[640px] overflow-hidden">
        {/* Suggested Longitudinal Questions */}
        <div className="px-5 py-3 bg-[#FAF9F5]/70 border-b border-[#DDE2DD]/70 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="font-mono text-[10px] text-[#8A938E] uppercase tracking-wider shrink-0">
            Inquire:
          </span>
          <button
            onClick={() => handlePromptSuggestion("How can I grow in my career while protecting my energy?")}
            className="shrink-0 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] hover:border-[#355C4A] text-[#1D2421] transition text-[11.5px]"
          >
            Career growth vs. energy
          </button>
          <button
            onClick={() => handlePromptSuggestion("I feel my energy is finally stabilizing, but I want to make sure I don't repeat the July crunch burnout.")}
            className="shrink-0 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] hover:border-[#355C4A] text-[#1D2421] transition text-[11.5px]"
          >
            Avoid July crunch recurrence
          </button>
          <button
            onClick={() => handlePromptSuggestion("What gradual patterns have you noticed in my habits?")}
            className="shrink-0 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] hover:border-[#355C4A] text-[#1D2421] transition text-[11.5px]"
          >
            Patterns in my habits
          </button>
        </div>

        {/* Message Stream — Intellectual Journal Dialogue */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-[#FFFFFF]">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            const isAdvisor = msg.mode === 'advisor';

            return (
              <div
                key={msg.id}
                className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#355C4A] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <Sparkles size={14} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-[18px] p-5 leading-relaxed ${
                    isUser
                      ? 'bg-[#355C4A] text-[#FFFFFF] shadow-xs'
                      : 'bg-[#FAF9F5] border border-[#DDE2DD]/90 text-[#1D2421]'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DDE2DD]/60 text-[10.5px] font-mono text-[#66706B]">
                      <span className="font-semibold text-[#355C4A] uppercase tracking-wider">
                        {isAdvisor ? 'Longitudinal Perspective' : 'Observatory Companion'}
                      </span>
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  <RenderedMessageContent content={msg.content} isUser={isUser} />

                  {isUser && (
                    <div className="text-[10px] mt-2 text-right font-mono text-[#EBF2ED]/70">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#EBECE7] text-[#1D2421] flex items-center justify-center shrink-0 mt-1">
                    <User size={14} />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#355C4A] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles size={14} />
              </div>
              <div className="p-4 bg-[#FAF9F5] border border-[#DDE2DD] rounded-[18px] flex items-center gap-2.5 text-xs text-[#66706B]">
                <Loader2 size={14} className="animate-spin text-[#355C4A]" />
                <span>Reflecting against your 4-month trajectory...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-[#FAF9F5] border-t border-[#DDE2DD] flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Explore with your companion: 'How did my habits change after the July sprint?'"
            className="flex-1 text-xs sm:text-[13.5px] bg-[#FFFFFF] border-[#DDE2DD] rounded-full text-[#1D2421] placeholder:text-[#8A938E] py-3 px-5 focus:outline-none focus:border-[#355C4A]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-full bg-[#355C4A] text-white py-3 px-6 gap-2 text-xs sm:text-[13px] font-medium disabled:opacity-40 hover:bg-[#284738] transition flex items-center shrink-0 shadow-xs"
          >
            <span>Send</span>
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};
