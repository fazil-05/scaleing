// src/pages/chat/AIChatPage.tsx
// Virtual Manager AI Assistant Interactive Conversation Page

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Send, Sparkles, User, Bot, RefreshCw, ThumbsUp, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

import { chatWithAI } from '@/lib/openai';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIChatPage: React.FC = () => {
  const { user, company } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello ${user?.name || 'Alexander'}! I am Virtual Manager AI. How can I assist you with staff attendance tracking, branch performance audits, or HR SOP policies today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setThinking(true);

    try {
      const chatHistory = messages.concat(userMsg).map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      const aiText = await chatWithAI(chatHistory, {
        companyName: company?.name || 'Acme Global Enterprises',
        employeeRole: user?.role || 'employee',
      });

      const aiMsg: Message = {
        id: `m-${Date.now() + 1}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error('Failed to receive response from AI Assistant');
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm">
            <Brain size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              Virtual Manager AI Assistant <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-bold">Online</span>
            </h3>
            <p className="text-[11px] text-slate-500">Autonomous Workforce Intelligence & Management Copilot</p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 max-w-2xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
              m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
            }`}>
              {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`p-4 rounded-2xl text-xs space-y-1.5 ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                : 'bg-slate-100/80 border border-slate-200/80 text-slate-800 rounded-tl-xs'
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
              <div className={`text-[10px] ${m.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold p-2">
            <Sparkles size={16} className="animate-spin text-blue-600" /> Virtual Manager AI is processing...
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask Virtual Manager AI anything about attendance, staff reports, or branch productivity..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="form-input text-xs flex-1"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || thinking}
            className="px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-xs flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
