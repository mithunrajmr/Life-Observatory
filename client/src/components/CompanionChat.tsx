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
  const [companionContext, setCompanionContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatData = async () => {
    try {
      const [historyRes, contextRes] = await Promise.all([
        api.getChatHistory(),
        api.getCompanionContext().catch(() => ({ context: null })),
      ]);

      setCompanionContext(contextRes.context);

      if (historyRes.messages && historyRes.messages.length > 0) {
        const deduplicated: ChatMessage[] = [];
        for (let i = 0; i < historyRes.messages.length; i++) {
          const m = historyRes.messages[i];
          const prev = deduplicated[deduplicated.length - 1];
          if (prev && prev.role === m.role && prev.content === m.content) {
            continue;
          }
          deduplicated.push(m);
        }
        setMessages(deduplicated);
      } else {
        const ctx = contextRes.context;
        const totalRefs = ctx?.totalReflectionsCount || 0;
        const memories = ctx?.memories || [];

        let welcomeText = "Welcome to Life Observatory. I am your companion for observing how your life is quietly changing.\n\nI don't have enough recorded observations yet to speak to your personal trajectory. As you compose reflections or connect your calendar, I will begin holding your journey in mind.\n\nWhat is on your mind today as you look ahead?";

        if (totalRefs > 0 || memories.length > 0) {
          welcomeText = `I am holding in mind the arc of your observatory record (${totalRefs} reflection${totalRefs === 1 ? '' : 's'} on file).\n\nWhat is currently on your mind as you look at your trajectory today?`;
        }

        setMessages([
          {
            id: 'welcome_1',
            role: 'model',
            content: welcomeText,
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
      setMessages(prev => [...prev.filter(m => m.id !== optimisticMsg.id), optimisticMsg, res.reply]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `I encountered an issue processing that: ${err.message || 'Please try again in a moment.'}`,
        timestamp: new Date().toISOString(),
        mode: 'companion',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSuggestion = (prompt: string) => {
    setInput(prompt);
  };

  const memories = companionContext?.memories || [];
  const intentions = companionContext?.activeIntentions || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in mb-12">
      {/* Editorial Longitudinal Context Banner */}
      <div className="rounded-[22px] bg-[#FAF9F5] border border-[#DDE2DD] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#355C4A]" />
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#355C4A] font-semibold">
              Longitudinal Memory Context
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#355C4A] font-mono">
            <Lock size={12} />
            <span>User-Isolated Grounding</span>
          </div>
        </div>

        {memories.length === 0 && intentions.length === 0 ? (
          <p className="text-xs text-[#66706B] font-light leading-relaxed">
            Observing baseline. As reflections and habit anchors are confirmed, your durable memory context cards will appear here.
          </p>
        ) : (
          <div className="divide-y sm:divide-y-0 sm:divide-x divide-[#DDE2DD] grid grid-cols-1 sm:grid-cols-3 text-xs pt-2 border-t border-[#DDE2DD]/70 gap-2 sm:gap-0">
            {memories.slice(0, 3).map((m: any, idx: number) => (
              <div key={m.id || idx} className="py-2 sm:py-0 sm:px-3 first:pl-0 last:pr-0">
                <span className="font-mono text-[9px] text-[#8A938E] uppercase block mb-0.5">{m.category.replace('_', ' ')}</span>
                <p className="font-medium text-[#1D2421] truncate">{m.title}</p>
                <p className="text-[11px] text-[#66706B] mt-0.5 font-light line-clamp-2">{m.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Dialogue Sanctuary */}
      <div className="rounded-[22px] bg-[#FFFFFF] border border-[#DDE2DD] shadow-xs flex flex-col min-h-[640px] overflow-hidden">
        {/* Suggested Longitudinal Questions */}
        <div className="px-5 py-3 bg-[#FAF9F5]/70 border-b border-[#DDE2DD]/70 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="font-mono text-[10px] text-[#8A938E] uppercase tracking-wider shrink-0">
            Inquire:
          </span>
          <button
            onClick={() => handlePromptSuggestion("What gradual patterns have you noticed in my habits?")}
            className="shrink-0 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] hover:border-[#355C4A] text-[#1D2421] transition text-[11.5px]"
          >
            Patterns in my habits
          </button>
          <button
            onClick={() => handlePromptSuggestion("How can I grow while protecting my energy and restorative time?")}
            className="shrink-0 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] hover:border-[#355C4A] text-[#1D2421] transition text-[11.5px]"
          >
            Growth vs. energy balance
          </button>
          <button
            onClick={() => handlePromptSuggestion("Where is my attention actually going compared to my stated intentions?")}
            className="shrink-0 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#DDE2DD] hover:border-[#355C4A] text-[#1D2421] transition text-[11.5px]"
          >
            Intention vs. reality alignment
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-[#FFFFFF]">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            const isAdvisor = msg.mode === 'advisor';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium mt-0.5 shadow-2xs ${
                    isUser
                      ? 'bg-[#355C4A] text-white'
                      : isAdvisor
                      ? 'bg-[#2E5E4E] text-white'
                      : 'bg-[#EFF3EE] text-[#355C4A]'
                  }`}
                >
                  {isUser ? <User size={14} /> : <Sparkles size={14} />}
                </div>

                <div
                  className={`rounded-[20px] p-4 sm:p-5 ${
                    isUser
                      ? 'bg-[#355C4A] text-white shadow-xs'
                      : isAdvisor
                      ? 'bg-[#F4F7F4] border border-[#355C4A]/30 text-[#1D2421]'
                      : 'bg-[#FAF9F5] border border-[#DDE2DD] text-[#1D2421]'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#DDE2DD]/60">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#355C4A] font-semibold">
                        {isAdvisor ? 'Strategic Advisor' : 'Longitudinal Companion'}
                      </span>
                      <span className="text-[10px] text-[#8A938E] font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  <RenderedMessageContent content={msg.content} isUser={isUser} />
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center text-xs text-[#8A938E] font-mono">
              <div className="w-8 h-8 rounded-full bg-[#EFF3EE] text-[#355C4A] flex items-center justify-center shadow-2xs">
                <Loader2 size={14} className="animate-spin" />
              </div>
              <span>Grounding in your longitudinal observatory…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-[#FAF9F5] border-t border-[#DDE2DD] flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your companion: 'What patterns do you see in my trajectory?'"
            className="flex-1 bg-[#FFFFFF] border border-[#DDE2DD] rounded-full px-4 py-2.5 text-xs text-[#1D2421] focus:outline-none focus:border-[#355C4A]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-[#355C4A] text-white flex items-center justify-center hover:bg-[#284738] disabled:opacity-40 transition shrink-0 shadow-xs"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
