import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Compass, User, Bot, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';

export const CompanionChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
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
        setMessages(res.messages);
      } else {
        // Initial warm welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'model',
            content: "Hello. I'm your Life Observatory companion. I keep track of the trajectories, patterns, and inflection points in your life. You can talk through how your week went, or ask for analytical perspective on a strategic decision.",
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
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          content: 'I could not process that message right now. Please try again.',
          timestamp: new Date().toISOString(),
          mode: 'companion',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card h-[700px] flex flex-col p-0 overflow-hidden mb-8 border-slate-800">
      {/* Chat Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Observatory Companion</h2>
            <p className="text-[11px] text-slate-400">
              Multi-turn reflection • Switches to Analytical Advisor on strategic questions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full">
          <Compass size={13} className="text-indigo-400" />
          <span>Context-Aware</span>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          const isAdvisor = msg.mode === 'advisor';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : isAdvisor
                    ? 'bg-slate-900 border border-indigo-500/30 text-slate-200 rounded-tl-none shadow-lg'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {!isUser && isAdvisor && (
                  <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 mb-2 flex items-center gap-1">
                    <Compass size={12} /> Strategic Advisor Mode
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div
                  className={`text-[10px] mt-2 text-right ${
                    isUser ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              <span>Thinking with Life Model context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Talk to your companion or ask: 'How can I grow in my career?'"
          className="flex-1 text-sm bg-slate-950/80 border-slate-800"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn-primary py-2 px-4 text-xs disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
